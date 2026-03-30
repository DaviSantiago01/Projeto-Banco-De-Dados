package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.ProdutoDao;
import br.com.cesar.projetobd.backend.model.Produto;
import jakarta.validation.Valid;
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

// Recebe as requisicoes HTTP do CRUD de produtos.
@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {
    private final ProdutoDao produtoDao;

    public ProdutoController(ProdutoDao produtoDao) {
        this.produtoDao = produtoDao;
    }

    @GetMapping
    public List<Produto> listarTodos() throws SQLException {
        return produtoDao.listarTodos();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Produto criar(@Valid @RequestBody Produto produto) throws SQLException {
        return produtoDao.inserir(produto);
    }

    @PutMapping("/{codigo}")
    public Produto atualizar(
        @PathVariable String codigo,
        @Valid @RequestBody Produto produto
    ) throws SQLException {
        // Usa o codigo da URL para evitar divergencia com o corpo enviado pela tela.
        produto.setCodigo(codigo);
        Produto produtoAtualizado = produtoDao.atualizar(codigo, produto);

        if (produtoAtualizado == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado.");
        }

        return produtoAtualizado;
    }

    @DeleteMapping("/{codigo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String codigo) throws SQLException {
        boolean produtoExcluido = produtoDao.excluir(codigo);

        if (!produtoExcluido) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado.");
        }
    }
}
