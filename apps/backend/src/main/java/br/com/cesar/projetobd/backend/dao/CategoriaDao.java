package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import br.com.cesar.projetobd.backend.model.Categoria;
import br.com.cesar.projetobd.backend.model.OpcaoCategoria;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

// Consulta as categorias diretamente no banco usando JDBC.
@Repository
public class CategoriaDao {
    private final FabricaConexao fabricaConexao;

    public CategoriaDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<Categoria> listarTodas() throws SQLException {
        String sql = """
            SELECT
                codigo,
                nome,
                descricao
            FROM categoria
            ORDER BY nome, codigo
            """;
        List<Categoria> categorias = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                categorias.add(mapearCategoria(resultSet));
            }
        }

        return categorias;
    }

    public List<OpcaoCategoria> listarOpcoes() throws SQLException {
        String sql = """
            SELECT codigo, nome
            FROM categoria
            ORDER BY nome
            """;
        List<OpcaoCategoria> categorias = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                OpcaoCategoria categoria = new OpcaoCategoria();
                categoria.setCodigo(resultSet.getString("codigo"));
                categoria.setNome(resultSet.getString("nome"));
                categorias.add(categoria);
            }
        }

        return categorias;
    }

    public Categoria inserir(Categoria categoria) throws SQLException {
        String sql = """
            INSERT INTO categoria (
                codigo,
                nome,
                descricao
            )
            VALUES (?, ?, ?)
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            preencher(statement, categoria);
            statement.executeUpdate();
            return buscarPorCodigo(connection, categoria.getCodigo());
        }
    }

    public Categoria atualizar(String codigo, Categoria categoria) throws SQLException {
        String sql = """
            UPDATE categoria
            SET
                nome = ?,
                descricao = ?
            WHERE codigo = ?
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, categoria.getNome());
            statement.setString(2, categoria.getDescricao());
            statement.setString(3, codigo);

            int updatedRows = statement.executeUpdate();
            if (updatedRows == 0) {
                return null;
            }

            return buscarPorCodigo(connection, codigo);
        }
    }

    public boolean excluir(String codigo) throws SQLException {
        String sql = "DELETE FROM categoria WHERE codigo = ?";

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, codigo);
            return statement.executeUpdate() > 0;
        }
    }

    private Categoria buscarPorCodigo(Connection connection, String codigo) throws SQLException {
        String sql = """
            SELECT
                codigo,
                nome,
                descricao
            FROM categoria
            WHERE codigo = ?
            """;

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, codigo);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }

                return mapearCategoria(resultSet);
            }
        }
    }

    private void preencher(PreparedStatement statement, Categoria categoria) throws SQLException {
        statement.setString(1, categoria.getCodigo());
        statement.setString(2, categoria.getNome());
        statement.setString(3, categoria.getDescricao());
    }

    private Categoria mapearCategoria(ResultSet resultSet) throws SQLException {
        Categoria categoria = new Categoria();
        categoria.setCodigo(resultSet.getString("codigo"));
        categoria.setNome(resultSet.getString("nome"));
        categoria.setDescricao(resultSet.getString("descricao"));
        return categoria;
    }
}
