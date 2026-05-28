-- Guarda o historico de alteracoes de preco dos produtos.
CREATE TABLE log_alteracao_preco (
    id SERIAL PRIMARY KEY,
    cod_produto VARCHAR(20),
    nome_produto VARCHAR(150),
    preco_antigo NUMERIC(10, 2),
    preco_novo NUMERIC(10, 2),
    alterado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registra no log quando o preco de um produto for alterado.
-- Usamos esta trigger para manter historico das alteracoes de preco dos produtos.
CREATE FUNCTION fn_tg_log_alteracao_preco()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.preco <> NEW.preco THEN
        INSERT INTO log_alteracao_preco (
            cod_produto,
            nome_produto,
            preco_antigo,
            preco_novo
        ) VALUES (
            OLD.codigo,
            OLD.nome,
            OLD.preco,
            NEW.preco
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_log_alteracao_preco
AFTER UPDATE ON produto
FOR EACH ROW
EXECUTE FUNCTION fn_tg_log_alteracao_preco();

-- Guarda o historico de mudancas de status das entregas.
CREATE TABLE log_status_entrega (
    id SERIAL PRIMARY KEY,
    numero_venda INTEGER,
    status_antigo VARCHAR(50),
    status_novo VARCHAR(50),
    alterado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registra no log quando o status de uma entrega for alterado.
-- Usamos esta trigger para acompanhar o historico de mudancas nas entregas.
CREATE FUNCTION fn_tg_log_status_entrega()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO log_status_entrega (
            numero_venda,
            status_antigo,
            status_novo
        ) VALUES (
            OLD.numero_venda,
            OLD.status,
            NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_log_mudanca_status_entrega
AFTER UPDATE ON entrega
FOR EACH ROW
EXECUTE FUNCTION fn_tg_log_status_entrega();
