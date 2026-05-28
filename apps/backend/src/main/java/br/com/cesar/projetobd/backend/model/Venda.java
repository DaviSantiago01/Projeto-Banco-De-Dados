package br.com.cesar.projetobd.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Representa os dados de uma venda trafegando entre API e banco.
public class Venda {
    private Integer numero;

    private LocalDateTime dataHora;

    private BigDecimal valorTotal;

    private String formaPagamento;

    private String cpfCliente;

    private String clienteNome;

    private String matAtendente;

    private String atendenteNome;

    public Integer getNumero() {
        return numero;
    }

    public void setNumero(Integer numero) {
        this.numero = numero;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public String getCpfCliente() {
        return cpfCliente;
    }

    public void setCpfCliente(String cpfCliente) {
        this.cpfCliente = cpfCliente;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public String getMatAtendente() {
        return matAtendente;
    }

    public void setMatAtendente(String matAtendente) {
        this.matAtendente = matAtendente;
    }

    public String getAtendenteNome() {
        return atendenteNome;
    }

    public void setAtendenteNome(String atendenteNome) {
        this.atendenteNome = atendenteNome;
    }
}
