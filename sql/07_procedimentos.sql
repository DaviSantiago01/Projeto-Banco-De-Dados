-- Atualiza o preco de venda de um produto.
-- Usamos este procedimento para centralizar a alteracao de preco dos produtos.
CREATE PROCEDURE sp_atualizar_preco_produto(
    p_cod_produto VARCHAR,
    p_novo_preco NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_novo_preco <= 0 THEN
        RAISE EXCEPTION 'O preco do produto deve ser maior que zero.';
    END IF;

    UPDATE produto
    SET preco = p_novo_preco
    WHERE codigo = p_cod_produto;
END;
$$;

-- Revisa o preco dos produtos com base no menor preco de fornecedor e em uma margem minima.
-- Usamos cursor porque cada produto tem custo proprio e pode precisar de uma decisao individual de reajuste.
CREATE PROCEDURE sp_revisar_precos_fornecedores(
    p_margem_percentual NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    cur_produtos CURSOR FOR
        SELECT
            p.codigo,
            p.nome,
            p.preco,
            MIN(f.preco_fornecedor) AS menor_preco_fornecedor
        FROM produto p
        JOIN fornece f ON f.fk_produto_codigo = p.codigo
        GROUP BY p.codigo, p.nome, p.preco;
    r_produto RECORD;
    v_preco_minimo NUMERIC(10, 2);
BEGIN
    IF p_margem_percentual <= 0 THEN
        RAISE EXCEPTION 'A margem percentual deve ser maior que zero.';
    END IF;

    OPEN cur_produtos;

    LOOP
        FETCH cur_produtos INTO r_produto;
        EXIT WHEN NOT FOUND;

        v_preco_minimo := ROUND(
            r_produto.menor_preco_fornecedor * (1 + p_margem_percentual / 100),
            2
        );

        IF r_produto.preco < v_preco_minimo THEN
            UPDATE produto
            SET preco = v_preco_minimo
            WHERE codigo = r_produto.codigo;
        END IF;
    END LOOP;

    CLOSE cur_produtos;
END;
$$;
