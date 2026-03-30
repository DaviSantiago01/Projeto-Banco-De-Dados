package br.com.cesar.projetobd.backend.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

// Centraliza os dados de acesso e a abertura da conexao com o banco.
@Component
public class FabricaConexao {
    private final String urlBanco;
    private final String usuario;
    private final String senha;

    public FabricaConexao(
        @Value("${app.db.url}") String urlBanco,
        @Value("${app.db.user}") String usuario,
        @Value("${app.db.password}") String senha
    ) {
        this.urlBanco = urlBanco;
        this.usuario = usuario;
        this.senha = senha;
    }

    // Deixa a abertura da conexao em um ponto so para os DAOs focarem apenas no SQL.
    public Connection abrirConexao() throws SQLException {
        return DriverManager.getConnection(
            urlBanco,
            usuario,
            senha
        );
    }
}
