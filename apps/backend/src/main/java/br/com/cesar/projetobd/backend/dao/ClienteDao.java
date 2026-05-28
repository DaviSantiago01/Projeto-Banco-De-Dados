package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import br.com.cesar.projetobd.backend.model.Cliente;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

// Executa as operacoes de banco ligadas aos clientes.
@Repository
public class ClienteDao {
    private final FabricaConexao fabricaConexao;

    public ClienteDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<Cliente> listarTodos() throws SQLException {
        String sql = """
            SELECT
                cpf,
                nome,
                email,
                cep,
                rua,
                numero,
                bairro
            FROM cliente
            ORDER BY nome, cpf
            """;
        List<Cliente> clientes = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                clientes.add(mapear(resultSet));
            }
        }

        return clientes;
    }

    public Cliente inserir(Cliente cliente) throws SQLException {
        String sql = """
            INSERT INTO cliente (
                cpf,
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
            preencher(statement, cliente);
            statement.executeUpdate();
            return buscarPorCpf(connection, cliente.getCpf());
        }
    }

    public Cliente atualizar(String cpf, Cliente cliente) throws SQLException {
        String sql = """
            UPDATE cliente
            SET
                nome = ?,
                email = ?,
                cep = ?,
                rua = ?,
                numero = ?,
                bairro = ?
            WHERE cpf = ?
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, cliente.getNome());
            statement.setString(2, cliente.getEmail());
            statement.setString(3, cliente.getCep());
            statement.setString(4, cliente.getRua());
            statement.setString(5, cliente.getNumero());
            statement.setString(6, cliente.getBairro());
            statement.setString(7, cpf);

            int updatedRows = statement.executeUpdate();
            if (updatedRows == 0) {
                return null;
            }

            return buscarPorCpf(connection, cpf);
        }
    }

    public boolean excluir(String cpf) throws SQLException {
        String sql = "DELETE FROM cliente WHERE cpf = ?";

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setString(1, cpf);
            return statement.executeUpdate() > 0;
        }
    }

    private Cliente buscarPorCpf(Connection connection, String cpf) throws SQLException {
        String sql = """
            SELECT
                cpf,
                nome,
                email,
                cep,
                rua,
                numero,
                bairro
            FROM cliente
            WHERE cpf = ?
            """;

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, cpf);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }

                return mapear(resultSet);
            }
        }
    }

    private void preencher(PreparedStatement statement, Cliente cliente) throws SQLException {
        statement.setString(1, cliente.getCpf());
        statement.setString(2, cliente.getNome());
        statement.setString(3, cliente.getEmail());
        statement.setString(4, cliente.getCep());
        statement.setString(5, cliente.getRua());
        statement.setString(6, cliente.getNumero());
        statement.setString(7, cliente.getBairro());
    }

    private Cliente mapear(ResultSet resultSet) throws SQLException {
        Cliente cliente = new Cliente();
        cliente.setCpf(resultSet.getString("cpf"));
        cliente.setNome(resultSet.getString("nome"));
        cliente.setEmail(resultSet.getString("email"));
        cliente.setCep(resultSet.getString("cep"));
        cliente.setRua(resultSet.getString("rua"));
        cliente.setNumero(resultSet.getString("numero"));
        cliente.setBairro(resultSet.getString("bairro"));
        return cliente;
    }
}
