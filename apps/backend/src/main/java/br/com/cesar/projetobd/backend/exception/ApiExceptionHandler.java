package br.com.cesar.projetobd.backend.exception;

import java.sql.SQLException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// Traduz erros do backend em mensagens simples para a interface.
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> tratarResponseStatus(ResponseStatusException exception) {
        String mensagem = exception.getReason() != null
            ? exception.getReason()
            : "Nao foi possivel concluir a operacao.";

        return ResponseEntity.status(exception.getStatusCode())
            .body(Map.of("message", mensagem));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> tratarValidacao(MethodArgumentNotValidException exception) {
        FieldError erroCampo = exception.getBindingResult().getFieldError();
        String mensagem = erroCampo != null
            ? "Campo invalido: " + erroCampo.getField() + "."
            : "Um ou mais campos estao invalidos.";

        return ResponseEntity.badRequest().body(Map.of("message", mensagem));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> tratarCorpoInvalido(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest()
            .body(Map.of("message", "Corpo da requisicao em formato invalido."));
    }

    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Map<String, String>> tratarSql(SQLException exception) {
        // Traduz os codigos mais comuns do PostgreSQL para mensagens simples na interface.
        String codigoSql = exception.getSQLState();

        if ("23505".equals(codigoSql)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Registro duplicado. Verifique os campos unicos."));
        }

        if ("23503".equals(codigoSql)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Operacao invalida por causa de integridade referencial."));
        }

        if ("22P02".equals(codigoSql)) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Um dos valores informados esta em formato invalido."));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Erro ao acessar o banco de dados."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> tratarErroGenerico(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Erro interno do servidor."));
    }
}
