-- Ajuda a localizar produtos pelo nome nas buscas do catalogo.
CREATE INDEX idx_produto_nome
ON produto (nome);

-- Ajuda a localizar clientes pelo nome nas buscas de cadastro.
CREATE INDEX idx_cliente_nome
ON cliente (nome);