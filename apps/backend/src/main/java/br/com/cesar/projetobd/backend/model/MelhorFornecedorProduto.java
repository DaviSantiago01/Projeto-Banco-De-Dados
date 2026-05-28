package br.com.cesar.projetobd.backend.model;

import java.math.BigDecimal;

// Representa o fornecedor mais vantajoso retornado pela funcao para um produto.
public class MelhorFornecedorProduto {
    private String codProduto;

    private String cnpjFornecedor;

    private String nomeFornecedor;

    private BigDecimal precoFornecedor;

    private Integer prazoEntrega;

    public String getCodProduto() {
        return codProduto;
    }

    public void setCodProduto(String codProduto) {
        this.codProduto = codProduto;
    }

    public String getCnpjFornecedor() {
        return cnpjFornecedor;
    }

    public void setCnpjFornecedor(String cnpjFornecedor) {
        this.cnpjFornecedor = cnpjFornecedor;
    }

    public String getNomeFornecedor() {
        return nomeFornecedor;
    }

    public void setNomeFornecedor(String nomeFornecedor) {
        this.nomeFornecedor = nomeFornecedor;
    }

    public BigDecimal getPrecoFornecedor() {
        return precoFornecedor;
    }

    public void setPrecoFornecedor(BigDecimal precoFornecedor) {
        this.precoFornecedor = precoFornecedor;
    }

    public Integer getPrazoEntrega() {
        return prazoEntrega;
    }

    public void setPrazoEntrega(Integer prazoEntrega) {
        this.prazoEntrega = prazoEntrega;
    }
}
