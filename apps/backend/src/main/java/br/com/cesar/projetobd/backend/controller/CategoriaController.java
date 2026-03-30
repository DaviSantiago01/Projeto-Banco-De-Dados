package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.CategoriaDao;
import br.com.cesar.projetobd.backend.model.OpcaoCategoria;
import java.sql.SQLException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Exponhe a listagem de categorias usada pelos formularios da tela.
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaDao categoriaDao;

    public CategoriaController(CategoriaDao categoriaDao) {
        this.categoriaDao = categoriaDao;
    }

    @GetMapping
    public List<OpcaoCategoria> listarTodas() throws SQLException {
        return categoriaDao.listarTodas();
    }
}
