package br.com.cesar.projetobd.backend.dao;

import br.com.cesar.projetobd.backend.db.FabricaConexao;
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

    public List<OpcaoCategoria> listarTodas() throws SQLException {
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
}
