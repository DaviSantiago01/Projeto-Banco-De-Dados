package br.com.cesar.projetobd.backend.model;

// Representa uma opcao de atendente para os campos de selecao.
public class OpcaoAtendente {
    private String matricula;
    private String nome;

    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
