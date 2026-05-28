package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import br.com.cesar.projetobd.backend.model.LogAlteracaoPreco;
import br.com.cesar.projetobd.backend.model.MelhorFornecedorProduto;
import br.com.cesar.projetobd.backend.model.Produto;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

// Executa as operacoes de banco ligadas aos produtos.
@Repository
public class ProdutoDao {
    private final FabricaConexao fabricaConexao;

    public ProdutoDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<Produto> listarTodos() throws SQLException {
        String sql = """
            SELECT 
                p.codigo,
                p.nome,
                p.preco,
                p.descricao,
                p.unidade_medida,
                p.cod_categoria,
                c.nome AS categoria_nome
            FROM produto p
            JOIN categoria c ON c.codigo = p.cod_categoria
            ORDER BY p.codigo
            """;
        List<Produto> produtos = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                // Converte cada linha retornada pelo banco em um objeto Produto.
                produtos.add(mapear(resultSet));
            }
        }

        return produtos; 
    }

    public Produto inserir(Produto produto) throws SQLException {
        String sql = """
            INSERT INTO produto (
                codigo,
                nome,
                preco,
                descricao,
                unidade_medida,
                cod_categoria
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            preencher(statement, produto);
            statement.executeUpdate();
            // Busca de novo para devolver o registro do jeito que a API lista, com a categoria preenchida.
            return buscarPorCodigo(connection, produto.getCodigo());
        }
    }

    public Produto atualizar(String codigo, Produto produto) throws SQLException {
        String sql = """
            UPDATE produto
            SET
                nome = ?,
                preco = ?,
                descricao = ?,
                unidade_medida = ?,
                cod_categoria = ?
            WHERE codigo = ?
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, produto.getNome());
            statement.setBigDecimal(2, produto.getPreco());
            statement.setString(3, produto.getDescricao());
            statement.setString(4, produto.getUnidadeMedida());
            statement.setString(5, produto.getCodCategoria());
            statement.setString(6, codigo);

            int updatedRows = statement.executeUpdate();
            if (updatedRows == 0) {
                return null;
            }

            // Rele o produto apos o update para devolver os dados finais salvos no banco.
            return buscarPorCodigo(connection, codigo);
        }
    }

    public boolean excluir(String codigo) throws SQLException {
        String sql = "DELETE FROM produto WHERE codigo = ?";

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, codigo);
            return statement.executeUpdate() > 0;
        }
    }

    public MelhorFornecedorProduto buscarMelhorFornecedorProduto(String codigo) throws SQLException {
        String sql = """
            SELECT
                fp.fk_produto_codigo AS cod_produto,
                f.cnpj AS cnpj_fornecedor,
                f.nome AS nome_fornecedor,
                fp.preco_fornecedor,
                fp.prazo_entrega
            FROM fornece fp
            JOIN fornecedor f ON f.cnpj = fp.fk_fornecedor_cnpj
            WHERE fp.fk_produto_codigo = ?
              AND fp.fk_fornecedor_cnpj = fn_melhor_fornecedor_produto(?)
            ORDER BY fp.preco_fornecedor ASC, fp.prazo_entrega ASC
            LIMIT 1
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, codigo);
            statement.setString(2, codigo);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }

                MelhorFornecedorProduto melhorFornecedor = new MelhorFornecedorProduto();
                melhorFornecedor.setCodProduto(resultSet.getString("cod_produto"));
                melhorFornecedor.setCnpjFornecedor(resultSet.getString("cnpj_fornecedor"));
                melhorFornecedor.setNomeFornecedor(resultSet.getString("nome_fornecedor"));
                melhorFornecedor.setPrecoFornecedor(resultSet.getBigDecimal("preco_fornecedor"));
                melhorFornecedor.setPrazoEntrega(resultSet.getInt("prazo_entrega"));
                return melhorFornecedor;
            }
        }
    }

    public Produto atualizarPrecoViaProcedimento(String codigo, java.math.BigDecimal novoPreco)
        throws SQLException {
        String sql = "CALL sp_atualizar_preco_produto(?, ?)";

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, codigo);
            statement.setBigDecimal(2, novoPreco);
            statement.executeUpdate();
            return buscarPorCodigo(connection, codigo);
        }
    }

    public List<LogAlteracaoPreco> listarLogsAlteracaoPreco() throws SQLException {
        String sql = """
            SELECT
                id,
                cod_produto,
                nome_produto,
                preco_antigo,
                preco_novo,
                alterado_em
            FROM log_alteracao_preco
            ORDER BY alterado_em DESC, id DESC
            LIMIT 20
            """;
        List<LogAlteracaoPreco> logs = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                LogAlteracaoPreco log = new LogAlteracaoPreco();
                log.setId(resultSet.getInt("id"));
                log.setCodProduto(resultSet.getString("cod_produto"));
                log.setNomeProduto(resultSet.getString("nome_produto"));
                log.setPrecoAntigo(resultSet.getBigDecimal("preco_antigo"));
                log.setPrecoNovo(resultSet.getBigDecimal("preco_novo"));

                Timestamp alteradoEm = resultSet.getTimestamp("alterado_em");
                if (alteradoEm != null) {
                    log.setAlteradoEm(alteradoEm.toLocalDateTime());
                }

                logs.add(log);
            }
        }

        return logs;
    }

    private Produto buscarPorCodigo(Connection connection, String codigo) throws SQLException {
        String sql = """
            SELECT
                p.codigo,
                p.nome,
                p.preco,
                p.descricao,
                p.unidade_medida,
                p.cod_categoria,
                c.nome AS categoria_nome
            FROM produto p
            JOIN categoria c ON c.codigo = p.cod_categoria
            WHERE p.codigo = ?
            """;

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, codigo);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }

                return mapear(resultSet);
            }
        }
    }

    private void preencher(PreparedStatement statement, Produto produto) throws SQLException {
        statement.setString(1, produto.getCodigo());
        statement.setString(2, produto.getNome());
        statement.setBigDecimal(3, produto.getPreco());
        statement.setString(4, produto.getDescricao());
        statement.setString(5, produto.getUnidadeMedida());
        statement.setString(6, produto.getCodCategoria());
    }

    private Produto mapear(ResultSet resultSet) throws SQLException {
        Produto produto = new Produto();
        produto.setCodigo(resultSet.getString("codigo"));
        produto.setNome(resultSet.getString("nome"));
        produto.setPreco(resultSet.getBigDecimal("preco"));
        produto.setDescricao(resultSet.getString("descricao"));
        produto.setUnidadeMedida(resultSet.getString("unidade_medida"));
        produto.setCodCategoria(resultSet.getString("cod_categoria"));
        produto.setCategoriaNome(resultSet.getString("categoria_nome"));
        return produto;
    }
}
