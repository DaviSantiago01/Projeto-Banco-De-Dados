package br.com.cesar.projetobd.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Representa os dados de uma venda trafegando entre API e banco.
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Venda {
    @NotNull
    private Integer numero;

    @NotNull
    private LocalDateTime dataHora;

    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal valorTotal;

    @NotBlank
    @Pattern(regexp = "DINHEIRO|CARTAO_CREDITO|CARTAO_DEBITO|PIX|BOLETO")
    private String formaPagamento;

    @NotBlank
    @Pattern(regexp = "^[0-9]{11}$")
    private String cpfCliente;

    private String clienteNome;

    @NotBlank
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
