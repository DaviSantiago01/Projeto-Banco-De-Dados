package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

// Centraliza as consultas e views da Etapa 04 para exposicao na interface.
@Repository
public class RelatorioDao {
    private static final String SQL_VIEW_VENDAS_DETALHADAS = """
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
        WHERE v.valor_total > 0
        ORDER BY numero_venda, cod_produto
        """;

    private static final String SQL_VIEW_ESTOQUE_CRITICO = """
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
        WHERE e.quantidade < e.quantidade_minima
        ORDER BY quantidade_para_repor DESC, cod_produto
        """;

    private static final String SQL_VIEW_PRODUTOS_MAIS_VENDIDOS = """
        SELECT
            p.codigo AS cod_produto,
            p.nome AS produto,
            SUM(ct.quantidade) AS quantidade_total_vendida,
            COUNT(ct.numero_venda) AS total_vendas_com_produto
        FROM produto p
        JOIN contem ct ON ct.cod_produto = p.codigo
        GROUP BY p.codigo, p.nome
        ORDER BY quantidade_total_vendida DESC, cod_produto
        """;

    private final FabricaConexao fabricaConexao;

    public RelatorioDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<Map<String, String>> consultarAtendentesPorVendas(int minimoVendas)
        throws SQLException {
        String sql = """
            SELECT
                f.nome AS atendente,
                a.setor,
                COUNT(v.numero) AS total_vendas,
                COALESCE(SUM(v.valor_total), 0) AS faturamento_total
            FROM venda v
            JOIN funcionario f ON f.matricula = v.mat_atendente
            JOIN atendente a ON a.matricula = v.mat_atendente
            GROUP BY f.matricula, f.nome, a.setor
            HAVING COUNT(v.numero) > ?
            ORDER BY total_vendas DESC
            """;

        List<Map<String, String>> linhas = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setInt(1, minimoVendas);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Map<String, String> linha = new LinkedHashMap<>();
                    linha.put("atendente", resultSet.getString("atendente"));
                    linha.put("setor", resultSet.getString("setor"));
                    linha.put("total_vendas", String.valueOf(resultSet.getLong("total_vendas")));
                    linha.put(
                        "faturamento_total",
                        normalizarValor(resultSet.getBigDecimal("faturamento_total"))
                    );
                    linhas.add(linha);
                }
            }
        }

        return linhas;
    }

    public List<Map<String, String>> consultarClientesPorNome(String nome) throws SQLException {
        String sql = """
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
            ORDER BY c.nome, v.data_hora DESC
            """;

        return executarConsulta(sql, statement -> statement.setString(1, normalizarBuscaPorPrefixo(nome)));
    }

    public List<Map<String, String>> consultarProdutosPorNome(String nome) throws SQLException {
        String sql = """
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
            ORDER BY p.nome
            """;

        List<Map<String, String>> linhas = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, normalizarBuscaPorTrecho(nome));

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Map<String, String> linha = new LinkedHashMap<>();
                    linha.put("codigo", resultSet.getString("codigo"));
                    linha.put("produto", resultSet.getString("produto"));
                    linha.put("categoria", resultSet.getString("categoria"));
                    linha.put("fornecedor", resultSet.getString("fornecedor"));
                    linha.put(
                        "preco_fornecedor",
                        normalizarValor(resultSet.getBigDecimal("preco_fornecedor"))
                    );
                    linha.put(
                        "prazo_entrega",
                        String.valueOf(resultSet.getInt("prazo_entrega"))
                    );
                    linha.put("preco_venda", normalizarValor(resultSet.getBigDecimal("preco_venda")));
                    linhas.add(linha);
                }
            }
        }

        return linhas;
    }

    private String normalizarBuscaPorPrefixo(String valor) {
        if (valor == null || valor.isBlank()) {
            return "%";
        }

        String termo = valor.trim();
        return termo.contains("%") || termo.contains("_") ? termo : termo + "%";
    }

    private String normalizarBuscaPorTrecho(String valor) {
        if (valor == null || valor.isBlank()) {
            return "%";
        }

        String termo = valor.trim();
        return termo.contains("%") || termo.contains("_") ? termo : "%" + termo + "%";
    }

    public List<Map<String, String>> consultarProdutosSemVenda() throws SQLException {
        String sql = """
            SELECT
                p.codigo,
                p.nome AS produto,
                p.preco
            FROM produto p
            LEFT JOIN contem ct ON ct.cod_produto = p.codigo
            WHERE ct.cod_produto IS NULL
            """;

        return executarConsulta(sql, statement -> { });
    }

    public List<Map<String, String>> consultarMelhorPrazoFornecedor() throws SQLException {
        String sql = """
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
            )
            ORDER BY p.codigo
            """;

        return executarConsulta(sql, statement -> { });
    }

    public List<Map<String, String>> listarViewVendasDetalhadas() throws SQLException {
        return executarViewComFallback(
            "SELECT * FROM vw_vendas_detalhadas ORDER BY numero_venda, cod_produto",
            SQL_VIEW_VENDAS_DETALHADAS
        );
    }

    public List<Map<String, String>> listarViewEstoqueCritico() throws SQLException {
        return executarViewComFallback(
            "SELECT * FROM vw_estoque_critico ORDER BY quantidade_para_repor DESC, cod_produto",
            SQL_VIEW_ESTOQUE_CRITICO
        );
    }

    public List<Map<String, String>> listarViewProdutosMaisVendidos() throws SQLException {
        return executarViewComFallback(
            "SELECT * FROM vw_produtos_mais_vendidos ORDER BY quantidade_total_vendida DESC, cod_produto",
            SQL_VIEW_PRODUTOS_MAIS_VENDIDOS
        );
    }

    private List<Map<String, String>> executarViewComFallback(
        String sqlView,
        String sqlFallback
    ) throws SQLException {
        try {
            return executarConsulta(sqlView, statement -> { });
        } catch (SQLException exception) {
            if (viewIndisponivel(exception)) {
                return executarConsulta(sqlFallback, statement -> { });
            }

            throw exception;
        }
    }

    private boolean viewIndisponivel(SQLException exception) {
        String estadoSql = exception.getSQLState();
        return "42P01".equals(estadoSql) || "42703".equals(estadoSql);
    }

    private List<Map<String, String>> executarConsulta(
        String sql,
        ParametrizadorConsulta parametrizador
    ) throws SQLException {
        List<Map<String, String>> linhas = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            parametrizador.parametrizar(statement);

            try (ResultSet resultSet = statement.executeQuery()) {
                ResultSetMetaData metaData = resultSet.getMetaData();
                int totalColunas = metaData.getColumnCount();

                while (resultSet.next()) {
                    Map<String, String> linha = new LinkedHashMap<>();

                    for (int indice = 1; indice <= totalColunas; indice++) {
                        String coluna = metaData.getColumnLabel(indice);
                        Object valor = resultSet.getObject(indice);
                        linha.put(coluna, normalizarValor(valor));
                    }

                    linhas.add(linha);
                }
            }
        }

        return linhas;
    }

    private String normalizarValor(Object valor) {
        if (valor == null) {
            return null;
        }

        if (valor instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime().toString();
        }

        if (valor instanceof Date data) {
            return data.toLocalDate().toString();
        }

        if (valor instanceof BigDecimal decimal) {
            return decimal.toPlainString();
        }

        return String.valueOf(valor);
    }

    @FunctionalInterface
    private interface ParametrizadorConsulta {
        void parametrizar(PreparedStatement statement) throws SQLException;
    }
}
