-- 1. JOIN + GROUP BY + HAVING
-- Mostra atendentes que realizaram mais vendas que o limite informado.
-- Ajuda a loja a acompanhar o desempenho da equipe de atendimento.
SELECT
    f.nome          AS atendente,
    a.setor,
    COUNT(v.numero)        AS total_vendas,
    SUM(v.valor_total)     AS faturamento_total
FROM venda v
JOIN funcionario f ON f.matricula = v.mat_atendente
JOIN atendente a   ON a.matricula = v.mat_atendente
GROUP BY f.matricula, f.nome, a.setor
HAVING COUNT(v.numero) > ?
ORDER BY total_vendas DESC;

-- 2. Dois JOINs + WHERE
-- Busca produtos pelo nome informado na interface.
-- Ajuda a localizar produtos do catalogo mostrando categoria e fornecedor.
SELECT
    p.codigo,
    p.nome AS produto,
    c.nome AS categoria,
    f.nome AS fornecedor,
    fp.preco_fornecedor,
    fp.prazo_entrega,
    p.preco AS preco_venda
FROM produto p
JOIN categoria c ON c.codigo = p.cod_categoria
JOIN fornece fp ON fp.fk_produto_codigo = p.codigo
JOIN fornecedor f ON f.cnpj = fp.fk_fornecedor_cnpj
WHERE p.nome ILIKE ?
ORDER BY p.nome;

-- 2B. Dois JOINs + WHERE
-- Busca vendas pelo nome do cliente informado na interface.
-- Ajuda a consultar rapidamente o historico de compras de um cliente.
SELECT
    c.cpf,
    c.nome AS cliente,
    c.email,
    v.numero AS numero_venda,
    v.data_hora,
    v.valor_total,
    v.forma_pagamento,
    f.nome AS atendente
FROM cliente c
JOIN venda v ON v.cpf_cliente = c.cpf
JOIN funcionario f ON f.matricula = v.mat_atendente
WHERE c.nome ILIKE ?
ORDER BY c.nome, v.data_hora DESC;

-- 3. Anti join
-- Mostra produtos cadastrados que nunca apareceram em vendas.
-- Ajuda a identificar itens parados no catalogo da loja.
SELECT
    p.codigo,
    p.nome AS produto,
    p.preco
FROM produto p
LEFT JOIN contem ct ON ct.cod_produto = p.codigo
WHERE ct.cod_produto IS NULL;

-- 4. Subconsulta
-- Mostra o fornecedor com menor prazo de entrega para cada produto.
-- Ajuda a loja a escolher rapidamente a melhor opcao de reposicao.
SELECT
    p.codigo,
    p.nome AS produto,
    f.nome AS fornecedor,
    fp.prazo_entrega,
    fp.preco_fornecedor
FROM fornece fp
JOIN produto p ON p.codigo = fp.fk_produto_codigo
JOIN fornecedor f ON f.cnpj = fp.fk_fornecedor_cnpj
WHERE fp.prazo_entrega = (
    SELECT MIN(fp2.prazo_entrega)
    FROM fornece fp2
    WHERE fp2.fk_produto_codigo = fp.fk_produto_codigo
);
