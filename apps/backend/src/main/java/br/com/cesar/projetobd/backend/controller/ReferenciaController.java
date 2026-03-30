package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.ReferenciaDao;
import br.com.cesar.projetobd.backend.model.OpcaoAtendente;
import br.com.cesar.projetobd.backend.model.OpcaoCliente;
import java.sql.SQLException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Exponhe listas auxiliares para preencher os campos de selecao da tela.
@RestController
@RequestMapping("/api")
public class ReferenciaController {
    private final ReferenciaDao referenciaDao;

    public ReferenciaController(ReferenciaDao referenciaDao) {
        this.referenciaDao = referenciaDao;
    }

    @GetMapping("/clientes")
    public List<OpcaoCliente> listarClientes() throws SQLException {
        return referenciaDao.listarClientes();
    }

    @GetMapping("/atendentes")
    public List<OpcaoAtendente> listarAtendentes() throws SQLException {
        return referenciaDao.listarAtendentes();
    }
}
