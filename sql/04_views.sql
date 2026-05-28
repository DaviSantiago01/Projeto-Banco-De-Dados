-- Historico detalhado das vendas efetivas, mostrando cliente, atendente e itens vendidos.
CREATE OR REPLACE VIEW vw_vendas_detalhadas AS
SELECT
    v.numero AS numero_venda,
    v.data_hora,
    v.valor_total,
    v.forma_pagamento,

    cli.cpf AS cpf_cliente,
    cli.nome AS cliente_nome,
    cli.email AS cliente_email,

    f.matricula AS mat_atendente,
    f.nome AS atendente_nome,
    a.setor AS setor_atendente,

    p.codigo AS cod_produto,
    p.nome AS produto,
    cat.nome AS categoria,
    ct.quantidade,
    p.preco AS preco_atual_produto,
    ct.quantidade * p.preco AS subtotal_item
FROM venda v
JOIN cliente cli ON cli.cpf = v.cpf_cliente
JOIN funcionario f ON f.matricula = v.mat_atendente
JOIN atendente a ON a.matricula = v.mat_atendente
JOIN contem ct ON ct.numero_venda = v.numero
JOIN produto p ON p.codigo = ct.cod_produto
JOIN categoria cat ON cat.codigo = p.cod_categoria
WHERE v.valor_total > 0;

-- Produtos com estoque abaixo da quantidade minima.
-- Observacao: esta view usa a tabela estoque atual. Se o estoque for movido para produto no futuro, esta view deve ser ajustada.
CREATE OR REPLACE VIEW vw_estoque_critico AS
SELECT
    p.codigo AS cod_produto,
    p.nome AS produto,
    e.quantidade AS estoque_atual,
    e.quantidade_minima,
    e.quantidade_minima - e.quantidade AS quantidade_para_repor,
    (
        SELECT COUNT(*)
        FROM fornece fc
        WHERE fc.fk_produto_codigo = p.codigo
    ) AS total_fornecedores
FROM produto p
JOIN estoque e ON e.cod_produto = p.codigo
WHERE e.quantidade < e.quantidade_minima;

-- Ranking de produtos pela quantidade total vendida.
CREATE OR REPLACE VIEW vw_produtos_mais_vendidos AS
SELECT
    p.codigo AS cod_produto,
    p.nome AS produto,
    SUM(ct.quantidade) AS quantidade_total_vendida,
    COUNT(ct.numero_venda) AS total_vendas_com_produto
FROM produto p
JOIN contem ct ON ct.cod_produto = p.codigo
GROUP BY p.codigo, p.nome
ORDER BY quantidade_total_vendida DESC;
