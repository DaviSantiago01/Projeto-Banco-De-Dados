package br.com.cesar.projetobd.backend.model;

// Representa uma opcao de cliente para os campos de selecao.
public class OpcaoCliente {
    private String cpf;
    private String nome;

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
