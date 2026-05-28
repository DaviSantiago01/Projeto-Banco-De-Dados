package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.FornecedorDao;
import br.com.cesar.projetobd.backend.model.Fornecedor;
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

// Recebe as requisicoes HTTP do CRUD de fornecedores.
@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {
    private final FornecedorDao fornecedorDao;

    public FornecedorController(FornecedorDao fornecedorDao) {
        this.fornecedorDao = fornecedorDao;
    }

    @GetMapping
    public List<Fornecedor> listarTodos() throws SQLException {
        return fornecedorDao.listarTodos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Fornecedor criar(@RequestBody Fornecedor fornecedor) throws SQLException {
        return fornecedorDao.inserir(fornecedor);
    }

    @PutMapping("/{cnpj}")
    public Fornecedor atualizar(
        @PathVariable String cnpj,
        @RequestBody Fornecedor fornecedor
    ) throws SQLException {
        fornecedor.setCnpj(cnpj);
        Fornecedor fornecedorAtualizado = fornecedorDao.atualizar(cnpj, fornecedor);

        if (fornecedorAtualizado == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor nao encontrado.");
        }

        return fornecedorAtualizado;
    }

    @DeleteMapping("/{cnpj}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String cnpj) throws SQLException {
        boolean fornecedorExcluido = fornecedorDao.excluir(cnpj);

        if (!fornecedorExcluido) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fornecedor nao encontrado.");
        }
    }
}
