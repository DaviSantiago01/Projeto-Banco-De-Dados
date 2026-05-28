package br.com.cesar.projetobd.backend.controller;

import br.com.cesar.projetobd.backend.dao.RelatorioDao;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Exibe consultas e views da Etapa 04 para uso direto na interface final.
@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
    private final RelatorioDao relatorioDao;

    public RelatorioController(RelatorioDao relatorioDao) {
        this.relatorioDao = relatorioDao;
    }

    @GetMapping("/consulta-atendentes-por-vendas")
    public List<Map<String, String>> consultarAtendentesPorVendas(
        @RequestParam(defaultValue = "0") int minimoVendas
    ) throws SQLException {
        return relatorioDao.consultarAtendentesPorVendas(minimoVendas);
    }

    @GetMapping("/consulta-clientes-por-nome")
    public List<Map<String, String>> consultarClientesPorNome(
        @RequestParam(defaultValue = "%") String nome
    ) throws SQLException {
        return relatorioDao.consultarClientesPorNome(nome);
    }

    @GetMapping("/consulta-produtos-por-nome")
    public List<Map<String, String>> consultarProdutosPorNome(
        @RequestParam(defaultValue = "%") String nome
    ) throws SQLException {
        return relatorioDao.consultarProdutosPorNome(nome);
    }

    @GetMapping("/consulta-produtos-sem-venda")
    public List<Map<String, String>> consultarProdutosSemVenda() throws SQLException {
        return relatorioDao.consultarProdutosSemVenda();
    }

    @GetMapping("/consulta-melhor-prazo-fornecedor")
    public List<Map<String, String>> consultarMelhorPrazoFornecedor() throws SQLException {
        return relatorioDao.consultarMelhorPrazoFornecedor();
    }

    @GetMapping("/view-vendas-detalhadas")
    public List<Map<String, String>> listarViewVendasDetalhadas() throws SQLException {
        return relatorioDao.listarViewVendasDetalhadas();
    }

    @GetMapping("/view-estoque-critico")
    public List<Map<String, String>> listarViewEstoqueCritico() throws SQLException {
        return relatorioDao.listarViewEstoqueCritico();
    }

    @GetMapping("/view-produtos-mais-vendidos")
    public List<Map<String, String>> listarViewProdutosMaisVendidos() throws SQLException {
        return relatorioDao.listarViewProdutosMaisVendidos();
    }
}
