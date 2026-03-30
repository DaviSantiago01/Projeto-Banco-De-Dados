BEGIN;

INSERT INTO funcionario (matricula, nome, data_nascimento, salario, turno, mat_supervisor)
SELECT
    'F' || LPAD(g::text, 3, '0'),
    'Funcionario ' || LPAD(g::text, 2, '0'),
    DATE '1980-01-01' + (g * 120),
    ROUND((2200 + (g * 135.75))::NUMERIC, 2),
    CASE MOD(g, 4)
        WHEN 0 THEN 'MANHA'
        WHEN 1 THEN 'TARDE'
        WHEN 2 THEN 'NOITE'
        ELSE 'INTEGRAL'
    END,
    CASE
        WHEN g <= 10 THEN NULL
        ELSE 'F' || LPAD((((g - 1) % 10) + 1)::text, 3, '0')
    END
FROM generate_series(1, 70) AS g;

INSERT INTO gerente (matricula, data_promocao, bonificacao)
SELECT
    'F' || LPAD(g::text, 3, '0'),
    DATE '2021-01-01' + (g * 20),
    ROUND((900 + (g * 85.50))::NUMERIC, 2)
FROM generate_series(1, 30) AS g;

INSERT INTO atendente (matricula, setor)
SELECT
    'F' || LPAD((g + 30)::text, 3, '0'),
    CASE MOD(g, 5)
        WHEN 0 THEN 'Hidraulica'
        WHEN 1 THEN 'Eletrica'
        WHEN 2 THEN 'Acabamento'
        WHEN 3 THEN 'Ferragens'
        ELSE 'Tintas'
    END
FROM generate_series(1, 30) AS g;

INSERT INTO dependente (nome, matricula_funcionario)
SELECT
    'Dependente ' || LPAD(g::text, 2, '0'),
    'F' || LPAD(g::text, 3, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO cliente (cpf, nome, email, cep, rua, numero, bairro)
SELECT
    LPAD(g::text, 11, '0'),
    'Cliente ' || LPAD(g::text, 2, '0'),
    'cliente' || g || '@lojamateriais.com',
    LPAD((50000000 + g)::text, 8, '0'),
    'Rua dos Clientes',
    g::text,
    'Bairro ' || LPAD((((g - 1) % 10) + 1)::text, 2, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO telefone_cliente (cpf_cliente, telefone)
SELECT
    LPAD(g::text, 11, '0'),
    '81' || LPAD((900000000 + g)::text, 9, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO categoria (codigo, nome, descricao)
SELECT
    'CAT' || LPAD(g::text, 3, '0'),
    'Categoria ' || LPAD(g::text, 2, '0'),
    'Descricao da categoria ' || g
FROM generate_series(1, 30) AS g;

INSERT INTO produto (codigo, nome, preco, descricao, unidade_medida, cod_categoria)
SELECT
    'PROD' || LPAD(g::text, 3, '0'),
    'Produto ' || LPAD(g::text, 2, '0'),
    ROUND((12.50 + (g * 4.35))::NUMERIC, 2),
    'Descricao do produto ' || g,
    CASE MOD(g, 5)
        WHEN 0 THEN 'UN'
        WHEN 1 THEN 'KG'
        WHEN 2 THEN 'M'
        WHEN 3 THEN 'L'
        ELSE 'CX'
    END,
    'CAT' || LPAD(g::text, 3, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO estoque (cod_produto, quantidade, quantidade_minima, data_ultima_atualizacao)
SELECT
    'PROD' || LPAD(g::text, 3, '0'),
    40 + (g * 3),
    5 + MOD(g, 8),
    CURRENT_DATE - g
FROM generate_series(1, 30) AS g;

INSERT INTO fornecedor (cnpj, nome, email, cep, rua, numero, bairro)
SELECT
    '1' || LPAD(g::text, 13, '0'),
    'Fornecedor ' || LPAD(g::text, 2, '0'),
    'fornecedor' || g || '@lojamateriais.com',
    LPAD((60000000 + g)::text, 8, '0'),
    'Rua dos Fornecedores',
    g::text,
    'Distrito ' || LPAD((((g - 1) % 10) + 1)::text, 2, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO telefone_fornecedor (cnpj_fornecedor, telefone)
SELECT
    '1' || LPAD(g::text, 13, '0'),
    '81' || LPAD((910000000 + g)::text, 9, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO fornece (fk_fornecedor_cnpj, fk_produto_codigo, prazo_entrega, preco_fornecedor)
SELECT
    '1' || LPAD(g::text, 13, '0'),
    'PROD' || LPAD(g::text, 3, '0'),
    2 + MOD(g, 7),
    ROUND(((12.50 + (g * 4.35)) * 0.78)::NUMERIC, 2)
FROM generate_series(1, 30) AS g;

INSERT INTO transportadora (cnpj, nome, telefone, email)
SELECT
    '8' || LPAD(g::text, 13, '0'),
    'Transportadora ' || LPAD(g::text, 2, '0'),
    '81' || LPAD((920000000 + g)::text, 9, '0'),
    'transportadora' || g || '@logistica.com'
FROM generate_series(1, 30) AS g;

INSERT INTO venda (data_hora, valor_total, forma_pagamento, cpf_cliente, mat_atendente)
SELECT
    CURRENT_TIMESTAMP - ((g * 2) || ' days')::INTERVAL,
    ROUND((80 + (g * 19.90))::NUMERIC, 2),
    CASE MOD(g, 5)
        WHEN 0 THEN 'DINHEIRO'
        WHEN 1 THEN 'CARTAO_CREDITO'
        WHEN 2 THEN 'CARTAO_DEBITO'
        WHEN 3 THEN 'PIX'
        ELSE 'BOLETO'
    END,
    LPAD(g::text, 11, '0'),
    'F' || LPAD((g + 30)::text, 3, '0')
FROM generate_series(1, 30) AS g;

INSERT INTO contem (numero_venda, cod_produto, quantidade)
SELECT
    g,
    'PROD' || LPAD(g::text, 3, '0'),
    1 + MOD(g, 6)
FROM generate_series(1, 30) AS g;

INSERT INTO contem (numero_venda, cod_produto, quantidade)
SELECT
    g,
    'PROD' || LPAD((((g + 7 - 1) % 30) + 1)::text, 3, '0'),
    2 + MOD(g, 5)
FROM generate_series(1, 30) AS g;

INSERT INTO entrega (numero_venda, data_saida, data_entrega, status, numero, rua, cep, bairro, cnpj_transportadora)
SELECT
    g,
    CURRENT_DATE - (40 - g),
    CASE
        WHEN g <= 20 THEN CURRENT_DATE - (38 - g)
        ELSE NULL
    END,
    CASE
        WHEN g <= 20 THEN 'ENTREGUE'
        WHEN g <= 25 THEN 'EM_TRANSITO'
        ELSE 'PENDENTE'
    END,
    (100 + g)::text,
    'Rua de Entrega ' || g,
    LPAD((70000000 + g)::text, 8, '0'),
    'Bairro Entrega ' || LPAD((((g - 1) % 10) + 1)::text, 2, '0'),
    '8' || LPAD(g::text, 13, '0')
FROM generate_series(1, 30) AS g;

COMMIT;
