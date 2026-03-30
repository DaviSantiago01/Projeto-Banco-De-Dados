package br.com.cesar.projetobd.backend.model;

// Representa uma opcao de categoria para os campos de selecao.
public class OpcaoCategoria {
    private String codigo;
    private String nome;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
