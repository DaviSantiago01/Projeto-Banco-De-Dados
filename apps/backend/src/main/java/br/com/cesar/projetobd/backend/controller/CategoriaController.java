package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.CategoriaDao;
import br.com.cesar.projetobd.backend.model.Categoria;
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

// Recebe as requisicoes HTTP do CRUD de categorias.
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaDao categoriaDao;

    public CategoriaController(CategoriaDao categoriaDao) {
        this.categoriaDao = categoriaDao;
    }

    @GetMapping
    public List<Categoria> listarTodas() throws SQLException {
        return categoriaDao.listarTodas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria criar(@RequestBody Categoria categoria) throws SQLException {
        return categoriaDao.inserir(categoria);
    }

    @PutMapping("/{codigo}")
    public Categoria atualizar(
        @PathVariable String codigo,
        @RequestBody Categoria categoria
    ) throws SQLException {
        categoria.setCodigo(codigo);
        Categoria categoriaAtualizada = categoriaDao.atualizar(codigo, categoria);

        if (categoriaAtualizada == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada.");
        }

        return categoriaAtualizada;
    }

    @DeleteMapping("/{codigo}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable String codigo) throws SQLException {
        boolean categoriaExcluida = categoriaDao.excluir(codigo);

        if (!categoriaExcluida) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria nao encontrada.");
        }
    }
}
