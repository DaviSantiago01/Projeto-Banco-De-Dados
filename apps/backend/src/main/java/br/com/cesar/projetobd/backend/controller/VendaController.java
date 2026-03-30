package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.VendaDao;
import br.com.cesar.projetobd.backend.model.Venda;
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

// Recebe as requisicoes HTTP do CRUD de vendas.
@RestController
@RequestMapping("/api/vendas")
public class VendaController {
    private final VendaDao vendaDao;

    public VendaController(VendaDao vendaDao) {
        this.vendaDao = vendaDao;
    }

    @GetMapping
    public List<Venda> listarTodas() throws SQLException {
        return vendaDao.listarTodas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Venda criar(@Valid @RequestBody Venda venda) throws SQLException {
        return vendaDao.inserir(venda);
    }

    @PutMapping("/{numero}")
    public Venda atualizar(
        @PathVariable Integer numero,
        @Valid @RequestBody Venda venda
    ) throws SQLException {
        // Usa o numero da URL para evitar divergencia com o corpo enviado pela tela.
        venda.setNumero(numero);
        Venda vendaAtualizada = vendaDao.atualizar(numero, venda);

        if (vendaAtualizada == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda nao encontrada.");
        }

        return vendaAtualizada;
    }

    @DeleteMapping("/{numero}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer numero) throws SQLException {
        boolean vendaExcluida = vendaDao.excluir(numero);

        if (!vendaExcluida) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda nao encontrada.");
        }
    }
}
