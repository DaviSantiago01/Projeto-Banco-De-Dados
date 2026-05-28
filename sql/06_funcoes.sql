-- Verifica a situacao do estoque de um produto.
-- Usamos esta funcao para identificar rapidamente quando um produto precisa de reposicao.
-- Observacao: se a tabela estoque for removida no futuro, esta funcao deve buscar esses dados em produto.
CREATE FUNCTION fn_status_estoque(p_cod_produto VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_quantidade INTEGER;
    v_quantidade_minima INTEGER;
BEGIN
    SELECT quantidade, quantidade_minima
    INTO v_quantidade, v_quantidade_minima
    FROM estoque
    WHERE cod_produto = p_cod_produto;

    IF v_quantidade IS NULL THEN
        RETURN 'NAO_ENCONTRADO';
    ELSIF v_quantidade < v_quantidade_minima THEN
        RETURN 'CRITICO';
    ELSIF v_quantidade = v_quantidade_minima THEN
        RETURN 'BAIXO';
    ELSE
        RETURN 'OK';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Retorna o fornecedor mais vantajoso para reposicao de um produto.
-- Usamos esta funcao para apoiar a escolha de fornecedor considerando menor preco e, em caso de empate, menor prazo.
CREATE FUNCTION fn_melhor_fornecedor_produto(p_cod_produto VARCHAR)
RETURNS CHAR(14) AS $$
DECLARE
    v_cnpj CHAR(14);
BEGIN
    SELECT fk_fornecedor_cnpj
    INTO v_cnpj
    FROM fornece
    WHERE fk_produto_codigo = p_cod_produto
    ORDER BY preco_fornecedor ASC, prazo_entrega ASC
    LIMIT 1;

    RETURN v_cnpj;
END;
$$ LANGUAGE plpgsql;
