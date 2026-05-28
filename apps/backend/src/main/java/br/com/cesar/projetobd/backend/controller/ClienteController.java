package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.ClienteDao;
import br.com.cesar.projetobd.backend.model.Cliente;
import java.sql.SQLException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

// Recebe as requisicoes HTTP do CRUD de clientes.
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteDao clienteDao;

    public ClienteController(ClienteDao clienteDao) {
        this.clienteDao = clienteDao;
    }

    @GetMapping
    public List<Cliente> listarTodos() throws SQLException {
        return clienteDao.listarTodos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente criar(@RequestBody Cliente cliente) throws SQLException {
        return clienteDao.inserir(cliente);
    }

    @PutMapping("/{cpf}")
    public Cliente atualizar(
        @PathVariable String cpf,
        @RequestBody Cliente cliente
    ) throws SQLException {
        cliente.setCpf(cpf);
        Cliente clienteAtualizado = clienteDao.atualizar(cpf, cliente);

        if (clienteAtualizado == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado.");
        }

        return clienteAtualizado;
    }

    @DeleteMapping("/{cpf}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String cpf) throws SQLException {
        boolean clienteExcluido = clienteDao.excluir(cpf);

        if (!clienteExcluido) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado.");
        }
    }
}
