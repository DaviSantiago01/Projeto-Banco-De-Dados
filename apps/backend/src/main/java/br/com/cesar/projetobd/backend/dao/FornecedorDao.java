package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import br.com.cesar.projetobd.backend.model.Fornecedor;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

// Executa as operacoes de banco ligadas aos fornecedores.
@Repository
public class FornecedorDao {
    private final FabricaConexao fabricaConexao;

    public FornecedorDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<Fornecedor> listarTodos() throws SQLException {
        String sql = """
            SELECT
                cnpj,
                nome,
                email,
                cep,
                rua,
                numero,
                bairro
            FROM fornecedor
            ORDER BY nome, cnpj
            """;
        List<Fornecedor> fornecedores = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                fornecedores.add(mapear(resultSet));
            }
        }

        return fornecedores;
    }

    public Fornecedor inserir(Fornecedor fornecedor) throws SQLException {
        String sql = """
            INSERT INTO fornecedor (
                cnpj,
                nome,
                email,
                cep,
                rua,
                numero,
                bairro
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            preencher(statement, fornecedor);
            statement.executeUpdate();
            return buscarPorCnpj(connection, fornecedor.getCnpj());
        }
    }

    public Fornecedor atualizar(String cnpj, Fornecedor fornecedor) throws SQLException {
        String sql = """
            UPDATE fornecedor
            SET
                nome = ?,
                email = ?,
                cep = ?,
                rua = ?,
                numero = ?,
                bairro = ?
            WHERE cnpj = ?
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, fornecedor.getNome());
            statement.setString(2, fornecedor.getEmail());
            statement.setString(3, fornecedor.getCep());
            statement.setString(4, fornecedor.getRua());
            statement.setString(5, fornecedor.getNumero());
            statement.setString(6, fornecedor.getBairro());
            statement.setString(7, cnpj);

            int updatedRows = statement.executeUpdate();
            if (updatedRows == 0) {
                return null;
            }

            return buscarPorCnpj(connection, cnpj);
        }
    }

    public boolean excluir(String cnpj) throws SQLException {
        String sql = "DELETE FROM fornecedor WHERE cnpj = ?";

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, cnpj);
            return statement.executeUpdate() > 0;
        }
    }

    private Fornecedor buscarPorCnpj(Connection connection, String cnpj) throws SQLException {
        String sql = """
            SELECT
                cnpj,
                nome,
                email,
                cep,
                rua,
                numero,
                bairro
            FROM fornecedor
            WHERE cnpj = ?
            """;

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, cnpj);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }

                return mapear(resultSet);
            }
        }
    }

    private void preencher(PreparedStatement statement, Fornecedor fornecedor) throws SQLException {
        statement.setString(1, fornecedor.getCnpj());
        statement.setString(2, fornecedor.getNome());
        statement.setString(3, fornecedor.getEmail());
        statement.setString(4, fornecedor.getCep());
        statement.setString(5, fornecedor.getRua());
        statement.setString(6, fornecedor.getNumero());
        statement.setString(7, fornecedor.getBairro());
    }

    private Fornecedor mapear(ResultSet resultSet) throws SQLException {
        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setCnpj(resultSet.getString("cnpj"));
        fornecedor.setNome(resultSet.getString("nome"));
        fornecedor.setEmail(resultSet.getString("email"));
        fornecedor.setCep(resultSet.getString("cep"));
        fornecedor.setRua(resultSet.getString("rua"));
        fornecedor.setNumero(resultSet.getString("numero"));
        fornecedor.setBairro(resultSet.getString("bairro"));
        return fornecedor;
    }
}
