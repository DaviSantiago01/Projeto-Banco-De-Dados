package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import br.com.cesar.projetobd.backend.model.OpcaoAtendente;
import br.com.cesar.projetobd.backend.model.OpcaoCliente;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

// Busca dados auxiliares para montar os selects do frontend.
@Repository
public class ReferenciaDao {
    private final FabricaConexao fabricaConexao;

    public ReferenciaDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<OpcaoCliente> listarClientes() throws SQLException {
        String sql = """
            SELECT cpf, nome
            FROM cliente
            ORDER BY nome
            """;
        List<OpcaoCliente> clientes = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                OpcaoCliente cliente = new OpcaoCliente();
                cliente.setCpf(resultSet.getString("cpf"));
                cliente.setNome(resultSet.getString("nome"));
                clientes.add(cliente);
            }
        }

        return clientes;
    }

    public List<OpcaoAtendente> listarAtendentes() throws SQLException {
        String sql = """
            SELECT a.matricula, f.nome
            FROM atendente a
            JOIN funcionario f ON f.matricula = a.matricula
            ORDER BY f.nome
            """;
        List<OpcaoAtendente> atendentes = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                OpcaoAtendente atendente = new OpcaoAtendente();
                atendente.setMatricula(resultSet.getString("matricula"));
                atendente.setNome(resultSet.getString("nome"));
                atendentes.add(atendente);
            }
        }

        return atendentes;
    }
}
