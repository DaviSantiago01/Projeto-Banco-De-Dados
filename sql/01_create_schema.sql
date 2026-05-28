BEGIN;

DROP TABLE IF EXISTS entrega CASCADE;
DROP TABLE IF EXISTS contem CASCADE;
DROP TABLE IF EXISTS venda CASCADE;
DROP TABLE IF EXISTS transportadora CASCADE;
DROP TABLE IF EXISTS fornece CASCADE;
DROP TABLE IF EXISTS telefone_fornecedor CASCADE;
DROP TABLE IF EXISTS fornecedor CASCADE;
DROP TABLE IF EXISTS estoque CASCADE;
DROP TABLE IF EXISTS produto CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS telefone_cliente CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS dependente CASCADE;
DROP TABLE IF EXISTS atendente CASCADE;
DROP TABLE IF EXISTS gerente CASCADE;
DROP TABLE IF EXISTS funcionario CASCADE;

CREATE TABLE funcionario (
    matricula VARCHAR(10) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    salario NUMERIC(10, 2) NOT NULL CHECK (salario > 0),
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('MANHA', 'TARDE', 'NOITE', 'INTEGRAL')),
    mat_supervisor VARCHAR(10),
    CONSTRAINT chk_funcionario_supervisor
        CHECK (mat_supervisor IS NULL OR mat_supervisor <> matricula),
    CONSTRAINT fk_funcionario_supervisor
        FOREIGN KEY (mat_supervisor)
        REFERENCES funcionario (matricula)
        ON UPDATE CASCADE
);

CREATE TABLE gerente (
    matricula VARCHAR(10) PRIMARY KEY,
    data_promocao DATE NOT NULL,
    bonificacao NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (bonificacao >= 0),
    CONSTRAINT fk_gerente_funcionario
        FOREIGN KEY (matricula)
        REFERENCES funcionario (matricula)
        ON DELETE CASCADE
);

CREATE TABLE atendente (
    matricula VARCHAR(10) PRIMARY KEY,
    setor VARCHAR(50) NOT NULL,
    CONSTRAINT fk_atendente_funcionario
        FOREIGN KEY (matricula)
        REFERENCES funcionario (matricula)
        ON DELETE CASCADE
);

CREATE TABLE dependente (
    numero SERIAL,
    nome VARCHAR(100) NOT NULL,
    matricula_funcionario VARCHAR(10) NOT NULL,
    PRIMARY KEY (numero, matricula_funcionario),
    CONSTRAINT fk_dependente_funcionario
        FOREIGN KEY (matricula_funcionario)
        REFERENCES funcionario (matricula)
        ON DELETE CASCADE
);

CREATE TABLE cliente (
    cpf CHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    cep CHAR(8),
    rua VARCHAR(150),
    numero VARCHAR(10),
    bairro VARCHAR(100)
);

CREATE TABLE telefone_cliente (
    cpf_cliente CHAR(11) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    PRIMARY KEY (cpf_cliente, telefone),
    CONSTRAINT fk_telefone_cliente
        FOREIGN KEY (cpf_cliente)
        REFERENCES cliente (cpf)
        ON DELETE CASCADE
);

CREATE TABLE categoria (
    codigo VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);

CREATE TABLE produto (
    codigo VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco > 0),
    descricao TEXT,
    unidade_medida VARCHAR(20) NOT NULL CHECK (unidade_medida IN ('UN', 'KG', 'M', 'L', 'CX')),
    cod_categoria VARCHAR(20) NOT NULL,
    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (cod_categoria)
        REFERENCES categoria (codigo)
);

CREATE TABLE estoque (
    cod_produto VARCHAR(20) PRIMARY KEY,
    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
    quantidade_minima INTEGER NOT NULL CHECK (quantidade_minima >= 0),
    data_ultima_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_estoque_produto
        FOREIGN KEY (cod_produto)
        REFERENCES produto (codigo)
        ON DELETE CASCADE
);

CREATE TABLE fornecedor (
    cnpj CHAR(14) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    cep CHAR(8),
    rua VARCHAR(150),
    numero VARCHAR(10),
    bairro VARCHAR(100)
);

CREATE TABLE telefone_fornecedor (
    cnpj_fornecedor CHAR(14) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    PRIMARY KEY (cnpj_fornecedor, telefone),
    CONSTRAINT fk_telefone_fornecedor
        FOREIGN KEY (cnpj_fornecedor)
        REFERENCES fornecedor (cnpj)
        ON DELETE CASCADE
);

CREATE TABLE fornece (
    fk_fornecedor_cnpj CHAR(14) NOT NULL,
    fk_produto_codigo VARCHAR(20) NOT NULL,
    prazo_entrega INTEGER NOT NULL CHECK (prazo_entrega > 0),
    preco_fornecedor NUMERIC(10, 2) NOT NULL CHECK (preco_fornecedor > 0),
    PRIMARY KEY (fk_fornecedor_cnpj, fk_produto_codigo),
    CONSTRAINT fk_fornece_fornecedor
        FOREIGN KEY (fk_fornecedor_cnpj)
        REFERENCES fornecedor (cnpj)
        ON DELETE CASCADE,
    CONSTRAINT fk_fornece_produto
        FOREIGN KEY (fk_produto_codigo)
        REFERENCES produto (codigo)
        ON DELETE CASCADE
);

CREATE TABLE transportadora (
    cnpj CHAR(14) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE
);

CREATE TABLE venda (
    numero SERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
    forma_pagamento VARCHAR(50) NOT NULL CHECK (
        forma_pagamento IN ('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO')
    ),
    cpf_cliente CHAR(11) NOT NULL,
    mat_atendente VARCHAR(10),
    CONSTRAINT fk_venda_cliente
        FOREIGN KEY (cpf_cliente)
        REFERENCES cliente (cpf),
    CONSTRAINT fk_venda_atendente
        FOREIGN KEY (mat_atendente)
        REFERENCES atendente (matricula)
        ON DELETE SET NULL
);

CREATE TABLE contem (
    numero_venda INTEGER NOT NULL,
    cod_produto VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    PRIMARY KEY (numero_venda, cod_produto),
    CONSTRAINT fk_contem_venda
        FOREIGN KEY (numero_venda)
        REFERENCES venda (numero)
        ON DELETE CASCADE,
    CONSTRAINT fk_contem_produto
        FOREIGN KEY (cod_produto)
        REFERENCES produto (codigo)
);

CREATE TABLE entrega (
    numero_venda INTEGER PRIMARY KEY,
    data_saida DATE NOT NULL,
    data_entrega DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (
        status IN ('PENDENTE', 'EM_TRANSITO', 'ENTREGUE', 'ATRASADA', 'CANCELADA')
    ),
    numero VARCHAR(10),
    rua VARCHAR(150),
    cep CHAR(8),
    bairro VARCHAR(100),
    cnpj_transportadora CHAR(14) NOT NULL,
    CONSTRAINT chk_entrega_datas
        CHECK (data_entrega IS NULL OR data_entrega >= data_saida),
    CONSTRAINT fk_entrega_venda
        FOREIGN KEY (numero_venda)
        REFERENCES venda (numero)
        ON DELETE CASCADE,
    CONSTRAINT fk_entrega_transportadora
        FOREIGN KEY (cnpj_transportadora)
        REFERENCES transportadora (cnpj)
);

COMMIT;
