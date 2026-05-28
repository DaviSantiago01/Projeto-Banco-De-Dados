import { useState } from 'react';
import { CampoFormulario } from './CampoFormulario';
import { ModalFormulario } from './ModalFormulario';
import { PainelSecao } from './PainelSecao';
import { TabelaAnalitica } from './TabelaAnalitica';

const ABAS_CLIENTES = [
  { id: 'lista', rotulo: 'Lista de clientes' },
  { id: 'consultas', rotulo: 'Consultas' },
];

const CONTEUDO_ABAS_CLIENTES = {
  lista: {
    titulo: 'Lista de clientes',
    descricao: 'Visualize os clientes cadastrados e gerencie os dados principais dessa área.',
  },
  consultas: {
    titulo: 'Consultas de clientes',
    descricao: 'Execute consultas relacionadas aos clientes e visualize o resultado diretamente nesta subtela.',
  },
};

// Exibe o formulario e a lista usados no CRUD de clientes.
export function SecaoClientes({
  carregando,
  clientesFiltrados,
  carregandoRelatorios,
  consultaClientesPorNome,
  cpfClienteEmEdicao,
  filtrosRelatorios,
  formularioCliente,
  modalClienteAberto,
  mensagemTabelaClientes,
  salvandoCliente,
  aoAbrirNovoCliente,
  aoAtualizarFiltroRelatorio,
  aoEditarCliente,
  aoExecutarConsultaClientesPorNome,
  aoExcluirCliente,
  aoLimparCliente,
  aoMudarCampoCliente,
  aoSalvarCliente,
}) {
  const [abaInternaAtiva, setAbaInternaAtiva] = useState('lista');
  const conteudoAbaAtiva = CONTEUDO_ABAS_CLIENTES[abaInternaAtiva];

  return (
    <div id="panel-clientes" role="tabpanel" aria-labelledby="tab-clientes" className="panel-stack">
      <ModalFormulario
        aberto={modalClienteAberto}
        titulo={cpfClienteEmEdicao ? 'Editar cliente' : 'Novo cliente'}
        descricao="Cadastre os dados principais do cliente para usar nas vendas da loja."
        aoFechar={aoLimparCliente}
      >
        <form className="editor-form" onSubmit={aoSalvarCliente}>
          <div className="editor-form__grid">
            <CampoFormulario
              htmlFor="cliente-cpf"
              rotulo="CPF"
              ajuda="Informe apenas os 11 numeros do CPF."
            >
              <input
                id="cliente-cpf"
                name="cpf"
                className="input"
                value={formularioCliente.cpf}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
                maxLength="11"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="cliente-nome" rotulo="Nome">
              <input
                id="cliente-nome"
                name="nome"
                className="input"
                value={formularioCliente.nome}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="cliente-email" rotulo="Email">
              <input
                id="cliente-email"
                name="email"
                className="input"
                type="email"
                value={formularioCliente.email}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="cliente-cep" rotulo="CEP">
              <input
                id="cliente-cep"
                name="cep"
                className="input"
                value={formularioCliente.cep}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
                maxLength="8"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="cliente-rua" rotulo="Rua">
              <input
                id="cliente-rua"
                name="rua"
                className="input"
                value={formularioCliente.rua}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="cliente-numero" rotulo="Numero">
              <input
                id="cliente-numero"
                name="numero"
                className="input"
                value={formularioCliente.numero}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="cliente-bairro" rotulo="Bairro">
              <input
                id="cliente-bairro"
                name="bairro"
                className="input"
                value={formularioCliente.bairro}
                onChange={aoMudarCampoCliente}
                autoComplete="off"
              />
            </CampoFormulario>
          </div>
          <div className="editor-form__actions">
            <button type="submit" className="button button--primary" disabled={salvandoCliente}>
              {salvandoCliente
                ? 'Salvando...'
                : cpfClienteEmEdicao
                  ? 'Atualizar cliente'
                  : 'Criar cliente'}
            </button>
            <button type="button" className="button button--secondary" onClick={aoLimparCliente}>
              Limpar
            </button>
          </div>
        </form>
      </ModalFormulario>

      <div className="view-block">
      <PainelSecao
        titulo={conteudoAbaAtiva.titulo}
        descricao={conteudoAbaAtiva.descricao}
        acoes={
          <div className="panel-header-actions">
            {abaInternaAtiva === 'lista' ? (
              <button
                type="button"
                className="button button--primary"
                onClick={aoAbrirNovoCliente}
              >
                Novo cliente
              </button>
            ) : null}
            <div className="section-tabs" role="tablist" aria-label="Subtelas de clientes">
              {ABAS_CLIENTES.map((aba) => (
                <button
                  key={aba.id}
                  type="button"
                  role="tab"
                  className={`section-tab${abaInternaAtiva === aba.id ? ' section-tab--active' : ''}`}
                  aria-selected={abaInternaAtiva === aba.id}
                  onClick={() => setAbaInternaAtiva(aba.id)}
                >
                  {aba.rotulo}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {abaInternaAtiva === 'lista' ? (
          <div className="section-panel">
            <div className="table-wrap">
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">Lista de clientes cadastrados</caption>
                  <thead>
                    <tr>
                      <th>CPF</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Endereço</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.cpf}>
                        <td>{cliente.cpf}</td>
                        <td>{cliente.nome}</td>
                        <td>{cliente.email || '-'}</td>
                        <td>
                          <strong>{cliente.rua || 'Sem rua'}</strong>
                          <span className="table-note">
                            {[cliente.numero, cliente.bairro, cliente.cep].filter(Boolean).join(' | ') ||
                              'Endereço não informado'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="button button--secondary"
                              onClick={() => aoEditarCliente(cliente)}
                              aria-label={`Editar cliente ${cliente.cpf}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="button button--danger"
                              onClick={() => aoExcluirCliente(cliente.cpf)}
                              aria-label={`Excluir cliente ${cliente.cpf}`}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!clientesFiltrados.length ? (
                      <tr>
                        <td colSpan="5" className="table-empty">
                          {carregando ? 'Carregando clientes...' : mensagemTabelaClientes}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="section-panel section-panel--stack">
            <div className="query-block">
            <PainelSecao
              sobretitulo="Consulta 2B"
              titulo="Histórico por nome do cliente"
              descricao="Localize um cliente pelo nome e visualize as vendas registradas com o atendente responsável."
            >
              <div className="section-panel section-panel--stack">
                <div className="operation-grid operation-grid--single">
                  <section className="operation-card">
                    <form className="editor-form" onSubmit={aoExecutarConsultaClientesPorNome}>
                      <label className="form-field">
                        <span className="form-field__label">Nome do cliente</span>
                        <input
                          name="clientesHistoricoNome"
                          className="input"
                          value={filtrosRelatorios.clientesHistoricoNome}
                          onChange={aoAtualizarFiltroRelatorio}
                        />
                      </label>
                      <div className="editor-form__actions">
                        <button type="submit" className="button button--primary">
                          Atualizar histórico
                        </button>
                      </div>
                    </form>
                    <p className="operation-example">Base técnica: 2 JOINs + WHERE usando cliente.nome.</p>
                  </section>
                </div>
                <TabelaAnalitica
                  titulo="Resultado do histórico por cliente"
                  linhas={consultaClientesPorNome}
                  carregando={carregandoRelatorios}
                  semCabecalho
                />
              </div>
            </PainelSecao>
            </div>
          </div>
        )}
      </PainelSecao>
      </div>
    </div>
  );
}
