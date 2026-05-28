package br.com.cesar.projetobd.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Representa uma linha do historico de alteracoes de preco gerado pela trigger.
public class LogAlteracaoPreco {
    private Integer id;

    private String codProduto;

    private String nomeProduto;

    private BigDecimal precoAntigo;

    private BigDecimal precoNovo;

    private LocalDateTime alteradoEm;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCodProduto() {
        return codProduto;
    }

    public void setCodProduto(String codProduto) {
        this.codProduto = codProduto;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public BigDecimal getPrecoAntigo() {
        return precoAntigo;
    }

    public void setPrecoAntigo(BigDecimal precoAntigo) {
        this.precoAntigo = precoAntigo;
    }

    public BigDecimal getPrecoNovo() {
        return precoNovo;
    }

    public void setPrecoNovo(BigDecimal precoNovo) {
        this.precoNovo = precoNovo;
    }

    public LocalDateTime getAlteradoEm() {
        return alteradoEm;
    }

    public void setAlteradoEm(LocalDateTime alteradoEm) {
        this.alteradoEm = alteradoEm;
    }
}
