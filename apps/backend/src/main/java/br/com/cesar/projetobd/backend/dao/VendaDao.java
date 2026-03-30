package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
import br.com.cesar.projetobd.backend.model.Venda;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;

// Executa as operacoes de banco ligadas as vendas.
@Repository
public class VendaDao {
    private final FabricaConexao fabricaConexao;

    public VendaDao(FabricaConexao fabricaConexao) {
        this.fabricaConexao = fabricaConexao;
    }

    public List<Venda> listarTodas() throws SQLException {
        String sql = """
            SELECT
                v.numero,
                v.data_hora,
                v.valor_total,
                v.forma_pagamento,
                v.cpf_cliente,
                c.nome AS cliente_nome,
                v.mat_atendente,
                f.nome AS atendente_nome
            FROM venda v
            JOIN cliente c ON c.cpf = v.cpf_cliente
            JOIN funcionario f ON f.matricula = v.mat_atendente
            ORDER BY v.numero DESC
            """;
        List<Venda> vendas = new ArrayList<>();

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql);
            ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                vendas.add(mapear(resultSet));
            }
        }

        return vendas;
    }

    public Venda inserir(Venda venda) throws SQLException {
        String sql = """
            INSERT INTO venda (
                numero,
                data_hora,
                valor_total,
                forma_pagamento,
                cpf_cliente,
                mat_atendente
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            preencher(statement, venda);
            statement.executeUpdate();
            // Busca de novo para devolver a venda no mesmo formato usado na listagem.
            return buscarPorNumero(connection, venda.getNumero());
        }
    }

    public Venda atualizar(Integer numero, Venda venda) throws SQLException {
        String sql = """
            UPDATE venda
            SET
                data_hora = ?,
                valor_total = ?,
                forma_pagamento = ?,
                cpf_cliente = ?,
                mat_atendente = ?
            WHERE numero = ?
            """;

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setTimestamp(1, Timestamp.valueOf(venda.getDataHora()));
            statement.setBigDecimal(2, venda.getValorTotal());
            statement.setString(3, venda.getFormaPagamento());
            statement.setString(4, venda.getCpfCliente());
            statement.setString(5, venda.getMatAtendente());
            statement.setInt(6, numero);

            int updatedRows = statement.executeUpdate();
            if (updatedRows == 0) {
                return null;
            }

            // Rele a venda apos o update para devolver os dados finais salvos no banco.
            return buscarPorNumero(connection, numero);
        }
    }

    public boolean excluir(Integer numero) throws SQLException {
        String sql = "DELETE FROM venda WHERE numero = ?";

        try (
            Connection connection = fabricaConexao.abrirConexao();
            PreparedStatement statement = connection.prepareStatement(sql)
        ) {
            statement.setInt(1, numero);
            return statement.executeUpdate() > 0;
        }
    }

    private Venda buscarPorNumero(Connection connection, Integer numero) throws SQLException {
        String sql = """
            SELECT
                v.numero,
                v.data_hora,
                v.valor_total,
                v.forma_pagamento,
                v.cpf_cliente,
                c.nome AS cliente_nome,
                v.mat_atendente,
                f.nome AS atendente_nome
            FROM venda v
            JOIN cliente c ON c.cpf = v.cpf_cliente
            JOIN funcionario f ON f.matricula = v.mat_atendente
            WHERE v.numero = ?
            """;

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, numero);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.next()) {
                    return null;
                }

                return mapear(resultSet);
            }
        }
    }

    private void preencher(PreparedStatement statement, Venda venda) throws SQLException {
        statement.setInt(1, venda.getNumero());
        statement.setTimestamp(2, Timestamp.valueOf(venda.getDataHora()));
        statement.setBigDecimal(3, venda.getValorTotal());
        statement.setString(4, venda.getFormaPagamento());
        statement.setString(5, venda.getCpfCliente());
        statement.setString(6, venda.getMatAtendente());
    }

    private Venda mapear(ResultSet resultSet) throws SQLException {
        Venda venda = new Venda();
        venda.setNumero(resultSet.getInt("numero"));
        venda.setDataHora(resultSet.getTimestamp("data_hora").toLocalDateTime());
        venda.setValorTotal(resultSet.getBigDecimal("valor_total"));
        venda.setFormaPagamento(resultSet.getString("forma_pagamento"));
        venda.setCpfCliente(resultSet.getString("cpf_cliente"));
        venda.setClienteNome(resultSet.getString("cliente_nome"));
        venda.setMatAtendente(resultSet.getString("mat_atendente"));
        venda.setAtendenteNome(resultSet.getString("atendente_nome"));
        return venda;
    }
}
