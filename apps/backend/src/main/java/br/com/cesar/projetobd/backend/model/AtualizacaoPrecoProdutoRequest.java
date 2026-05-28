package br.com.cesar.projetobd.backend.model;

import java.math.BigDecimal;

// Representa o corpo enviado pela interface para executar o procedimento de atualizacao de preco.
public class AtualizacaoPrecoProdutoRequest {
    private BigDecimal novoPreco;

    public BigDecimal getNovoPreco() {
        return novoPreco;
    }

    public void setNovoPreco(BigDecimal novoPreco) {
        this.novoPreco = novoPreco;
    }
}
