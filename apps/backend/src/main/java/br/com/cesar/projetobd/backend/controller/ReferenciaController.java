package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.ReferenciaDao;
import br.com.cesar.projetobd.backend.model.OpcaoAtendente;
import java.sql.SQLException;
import java.util.List;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

// Exponhe listas auxiliares para preencher os campos de selecao da tela.
@RestController
@RequestMapping("/api")
public class ReferenciaController {
    private final ReferenciaDao referenciaDao;

    public ReferenciaController(ReferenciaDao referenciaDao) {
        this.referenciaDao = referenciaDao;
    }

    @GetMapping("/atendentes")
    public List<OpcaoAtendente> listarAtendentes() throws SQLException {
        return referenciaDao.listarAtendentes();
    }
}
