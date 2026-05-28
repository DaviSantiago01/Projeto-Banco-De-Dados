import { useState } from 'react';
import { CampoFormulario } from './CampoFormulario';
import { ModalFormulario } from './ModalFormulario';
import { PainelSecao } from './PainelSecao';
import { TabelaAnalitica } from './TabelaAnalitica';

const ABAS_FORNECEDORES = [
  { id: 'lista', rotulo: 'Lista de fornecedores' },
  { id: 'consultas', rotulo: 'Consultas' },
];

const CONTEUDO_ABAS_FORNECEDORES = {
  lista: {
    titulo: 'Lista de fornecedores',
    descricao: 'Visualize os fornecedores cadastrados e gerencie os dados principais dessa área.',
  },
  consultas: {
    titulo: 'Consultas de fornecedores',
    descricao: 'Visualize consultas relacionadas aos fornecedores sem misturar esse conteúdo com a listagem principal.',
  },
};

// Exibe o formulario e a lista usados no CRUD de fornecedores.
export function SecaoFornecedores({
  carregando,
  carregandoRelatorios,
  cnpjFornecedorEmEdicao,
  consultaMelhorPrazoFornecedor,
  formularioFornecedor,
  fornecedoresFiltrados,
  modalFornecedorAberto,
  mensagemTabelaFornecedores,
  salvandoFornecedor,
  aoAbrirNovoFornecedor,
  aoEditarFornecedor,
  aoExcluirFornecedor,
  aoLimparFornecedor,
  aoMudarCampoFornecedor,
  aoSalvarFornecedor,
}) {
  const [abaInternaAtiva, setAbaInternaAtiva] = useState('lista');
  const conteudoAbaAtiva = CONTEUDO_ABAS_FORNECEDORES[abaInternaAtiva];

  return (
    <div
      id="panel-fornecedores"
      role="tabpanel"
      aria-labelledby="tab-fornecedores"
      className="panel-stack"
    >
      <ModalFormulario
        aberto={modalFornecedorAberto}
        titulo={cnpjFornecedorEmEdicao ? 'Editar fornecedor' : 'Novo fornecedor'}
        descricao="Cadastre os dados principais do fornecedor para usar nas consultas e reposição da loja."
        aoFechar={aoLimparFornecedor}
      >
        <form className="editor-form" onSubmit={aoSalvarFornecedor}>
          <div className="editor-form__grid">
            <CampoFormulario
              htmlFor="fornecedor-cnpj"
              rotulo="CNPJ"
              ajuda="Informe apenas os 14 números do CNPJ."
            >
              <input
                id="fornecedor-cnpj"
                name="cnpj"
                className="input"
                value={formularioFornecedor.cnpj}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
                maxLength="14"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="fornecedor-nome" rotulo="Nome">
              <input
                id="fornecedor-nome"
                name="nome"
                className="input"
                value={formularioFornecedor.nome}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="fornecedor-email" rotulo="Email">
              <input
                id="fornecedor-email"
                name="email"
                className="input"
                type="email"
                value={formularioFornecedor.email}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="fornecedor-cep" rotulo="CEP">
              <input
                id="fornecedor-cep"
                name="cep"
                className="input"
                value={formularioFornecedor.cep}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
                maxLength="8"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="fornecedor-rua" rotulo="Rua">
              <input
                id="fornecedor-rua"
                name="rua"
                className="input"
                value={formularioFornecedor.rua}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="fornecedor-numero" rotulo="Número">
              <input
                id="fornecedor-numero"
                name="numero"
                className="input"
                value={formularioFornecedor.numero}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="fornecedor-bairro" rotulo="Bairro">
              <input
                id="fornecedor-bairro"
                name="bairro"
                className="input"
                value={formularioFornecedor.bairro}
                onChange={aoMudarCampoFornecedor}
                autoComplete="off"
              />
            </CampoFormulario>
          </div>
          <div className="editor-form__actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={salvandoFornecedor}
            >
              {salvandoFornecedor
                ? 'Salvando...'
                : cnpjFornecedorEmEdicao
                  ? 'Atualizar fornecedor'
                  : 'Criar fornecedor'}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={aoLimparFornecedor}
            >
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
                  onClick={aoAbrirNovoFornecedor}
                >
                  Novo fornecedor
                </button>
              ) : null}
              <div className="section-tabs" role="tablist" aria-label="Subtelas de fornecedores">
                {ABAS_FORNECEDORES.map((aba) => (
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
                    <caption className="sr-only">Lista de fornecedores cadastrados</caption>
                    <thead>
                      <tr>
                        <th>CNPJ</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Endereço</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fornecedoresFiltrados.map((fornecedor) => (
                        <tr key={fornecedor.cnpj}>
                          <td>{fornecedor.cnpj}</td>
                          <td>{fornecedor.nome}</td>
                          <td>{fornecedor.email || '-'}</td>
                          <td>
                            <strong>{fornecedor.rua || 'Sem rua'}</strong>
                            <span className="table-note">
                              {[fornecedor.numero, fornecedor.bairro, fornecedor.cep]
                                .filter(Boolean)
                                .join(' | ') || 'Endereço não informado'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="button button--secondary"
                                onClick={() => aoEditarFornecedor(fornecedor)}
                                aria-label={`Editar fornecedor ${fornecedor.cnpj}`}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="button button--danger"
                                onClick={() => aoExcluirFornecedor(fornecedor.cnpj)}
                                aria-label={`Excluir fornecedor ${fornecedor.cnpj}`}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!fornecedoresFiltrados.length ? (
                        <tr>
                          <td colSpan="5" className="table-empty">
                            {carregando ? 'Carregando fornecedores...' : mensagemTabelaFornecedores}
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
                <TabelaAnalitica
                  sobretitulo="Consulta 4"
                  titulo="Melhor prazo por produto"
                  descricao="Mostra o fornecedor mais competitivo de cada produto considerando o menor prazo de entrega."
                  linhas={consultaMelhorPrazoFornecedor}
                  carregando={carregandoRelatorios}
                  semCabecalho
                  larguraMinima={980}
                />
              </div>
            </div>
          )}
        </PainelSecao>
      </div>
    </div>
  );
}
