import { useState } from 'react';
import { CampoFormulario } from './CampoFormulario';
import { ModalFormulario } from './ModalFormulario';
import { PainelSecao } from './PainelSecao';
import { TabelaAnalitica } from './TabelaAnalitica';
import { formatarDataHora, formatarMoeda } from '../lib/formatadores';

// Exibe o formulario e a lista usados no CRUD de produtos.
const OPCOES_UNIDADE = ['UN', 'KG', 'M', 'L', 'CX'];
const ABAS_PRODUTOS = [
  { id: 'lista', rotulo: 'Lista de produtos' },
  { id: 'consultas', rotulo: 'Consultas' },
  { id: 'operacoes', rotulo: 'Operações avançadas' },
];

const CONTEUDO_ABAS_PRODUTOS = {
  lista: {
    titulo: 'Lista de produtos',
    descricao: 'Visualize os produtos cadastrados e gerencie os dados principais do catálogo da loja.',
  },
  consultas: {
    titulo: 'Consultas de produtos',
    descricao: 'Execute consultas relacionadas aos produtos e visualize os resultados sem misturar com a listagem principal.',
  },
  operacoes: {
    titulo: 'Operações avançadas',
    descricao: 'Acesse as rotinas complementares de produto, incluindo função, procedimento e histórico automático.',
  },
};

export function SecaoProdutos({
  categorias,
  codigoProdutoEmEdicao,
  produtosFiltrados,
  carregando,
  carregandoRelatorios,
  consultaProdutosNome,
  consultaProdutosSemVenda,
  consultandoMelhorFornecedor,
  executandoProcedimentoPreco,
  filtrosRelatorios,
  salvandoProduto,
  formularioProduto,
  modalProdutoAberto,
  codigoConsultaFornecedor,
  formularioProcedimentoPreco,
  melhorFornecedorProduto,
  logsAlteracaoPreco,
  mensagemTabelaProdutos,
  aoAbrirNovoProduto,
  aoAtualizarFiltroRelatorio,
  aoBuscarMelhorFornecedor,
  aoExcluirProduto,
  aoEditarProduto,
  aoExecutarConsultaProdutosNome,
  aoExecutarProcedimentoPreco,
  aoMudarCampoProcedimentoPreco,
  aoMudarCodigoConsultaFornecedor,
  aoMudarCampoProduto,
  aoSalvarProduto,
  aoLimparProduto,
}) {
  const [abaInternaAtiva, setAbaInternaAtiva] = useState('lista');
  const conteudoAbaAtiva = CONTEUDO_ABAS_PRODUTOS[abaInternaAtiva];

  return (
    <div
      id="panel-produtos"
      role="tabpanel"
      aria-labelledby="tab-produtos"
      className="panel-stack"
    >
      <ModalFormulario
        aberto={modalProdutoAberto}
        titulo={codigoProdutoEmEdicao ? 'Editar produto' : 'Novo produto'}
        descricao="Preencha os campos principais do item para cadastrar ou atualizar o catálogo da loja."
        aoFechar={aoLimparProduto}
      >
        <form className="editor-form" onSubmit={aoSalvarProduto}>
          <div className="editor-form__grid">
            <CampoFormulario
              htmlFor="produto-codigo"
              rotulo="Código"
              ajuda="Informe um código único."
            >
              <input
                id="produto-codigo"
                name="codigo"
                className="input"
                value={formularioProduto.codigo}
                onChange={aoMudarCampoProduto}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="produto-nome" rotulo="Nome">
              <input
                id="produto-nome"
                name="nome"
                className="input"
                value={formularioProduto.nome}
                onChange={aoMudarCampoProduto}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="produto-preco" rotulo="Preço">
              <input
                id="produto-preco"
                name="preco"
                className="input"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={formularioProduto.preco}
                onChange={aoMudarCampoProduto}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="produto-unidade" rotulo="Unidade">
              <select
                id="produto-unidade"
                name="unidadeMedida"
                className="input"
                value={formularioProduto.unidadeMedida}
                onChange={aoMudarCampoProduto}
              >
                {OPCOES_UNIDADE.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao}
                  </option>
                ))}
              </select>
            </CampoFormulario>
            <CampoFormulario
              htmlFor="produto-categoria"
              rotulo="Categoria"
              ajuda="Selecione uma categoria cadastrada."
            >
              <select
                id="produto-categoria"
                name="codCategoria"
                className="input"
                value={formularioProduto.codCategoria}
                onChange={aoMudarCampoProduto}
                required
              >
                <option value="">Selecione</option>
                {categorias.map((categoria) => (
                  <option key={categoria.codigo} value={categoria.codigo}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </CampoFormulario>
            <CampoFormulario htmlFor="produto-descricao" rotulo="Descrição">
              <textarea
                id="produto-descricao"
                name="descricao"
                className="input input--textarea"
                value={formularioProduto.descricao}
                onChange={aoMudarCampoProduto}
                rows="5"
              />
            </CampoFormulario>
          </div>
          <div className="editor-form__actions">
            <button type="submit" className="button button--primary" disabled={salvandoProduto}>
              {salvandoProduto
                ? 'Salvando...'
                : codigoProdutoEmEdicao
                  ? 'Atualizar produto'
                  : 'Criar produto'}
            </button>
            <button type="button" className="button button--secondary" onClick={aoLimparProduto}>
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
                onClick={aoAbrirNovoProduto}
              >
                Novo produto
              </button>
            ) : null}
            <div className="section-tabs" role="tablist" aria-label="Subtelas de produtos">
              {ABAS_PRODUTOS.map((aba) => (
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
                  <caption className="sr-only">Lista de produtos cadastrados</caption>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Unidade</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto) => (
                      <tr key={produto.codigo}>
                        <td>{produto.codigo}</td>
                        <td>{produto.nome}</td>
                        <td>{produto.categoriaNome}</td>
                        <td>{formatarMoeda(produto.preco)}</td>
                        <td>{produto.unidadeMedida}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="button button--secondary"
                              onClick={() => aoEditarProduto(produto)}
                              aria-label={`Editar produto ${produto.codigo}`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="button button--danger"
                              onClick={() => aoExcluirProduto(produto.codigo)}
                              aria-label={`Excluir produto ${produto.codigo}`}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!produtosFiltrados.length ? (
                      <tr>
                        <td colSpan="6" className="table-empty">
                          {carregando ? 'Carregando produtos...' : mensagemTabelaProdutos}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : abaInternaAtiva === 'consultas' ? (
          <div className="section-panel section-panel--stack">
            <PainelSecao
              sobretitulo="Consulta 2"
              titulo="Produtos por nome"
              descricao="Filtre produtos por nome para visualizar categoria, fornecedor e preço relacionado."
            >
              <div className="section-panel section-panel--stack">
                <div className="operation-grid operation-grid--single">
                  <section className="operation-card">
                    <form className="editor-form" onSubmit={aoExecutarConsultaProdutosNome}>
                      <label className="form-field">
                        <span className="form-field__label">Nome do produto</span>
                        <input
                          name="produtosNome"
                          className="input"
                          value={filtrosRelatorios.produtosNome}
                          onChange={aoAtualizarFiltroRelatorio}
                        />
                      </label>
                      <div className="editor-form__actions">
                        <button type="submit" className="button button--primary">
                          Atualizar busca
                        </button>
                      </div>
                    </form>
                    <p className="operation-example">Base técnica: Consulta 2.</p>
                  </section>
                </div>
                <TabelaAnalitica
                  titulo="Resultado da consulta de produtos por nome"
                  linhas={consultaProdutosNome}
                  carregando={carregandoRelatorios}
                  semCabecalho
                />
              </div>
            </PainelSecao>

            <TabelaAnalitica
              sobretitulo="Consulta 3"
              titulo="Produtos sem venda"
              descricao="Aponta quais produtos cadastrados ainda não apareceram em nenhuma venda."
              linhas={consultaProdutosSemVenda}
              carregando={carregandoRelatorios}
            />
          </div>
        ) : (
          <div className="database-ops">
            <div className="operation-grid">
              <section className="operation-card">
                <p className="panel-frame__eyebrow">Função do banco</p>
                <h3>Recomendação de fornecedor</h3>
                <p>Consulta o fornecedor mais vantajoso para o produto informado.</p>
                <form className="editor-form" onSubmit={aoBuscarMelhorFornecedor}>
                  <CampoFormulario htmlFor="produto-melhor-fornecedor" rotulo="Código do produto">
                    <input
                      id="produto-melhor-fornecedor"
                      name="codigoConsultaFornecedor"
                      className="input"
                      value={codigoConsultaFornecedor}
                      onChange={aoMudarCodigoConsultaFornecedor}
                      autoComplete="off"
                      required
                    />
                  </CampoFormulario>
                  <div className="editor-form__actions">
                    <button
                      type="submit"
                      className="button button--primary"
                      disabled={consultandoMelhorFornecedor}
                    >
                      {consultandoMelhorFornecedor ? 'Consultando...' : 'Consultar função'}
                    </button>
                  </div>
                </form>
                {melhorFornecedorProduto ? (
                  <div className="operation-result">
                    <strong>{melhorFornecedorProduto.nomeFornecedor}</strong>
                    <span>CNPJ: {melhorFornecedorProduto.cnpjFornecedor}</span>
                    <span>Preco: {formatarMoeda(melhorFornecedorProduto.precoFornecedor)}</span>
                    <span>Prazo: {melhorFornecedorProduto.prazoEntrega} dia(s)</span>
                  </div>
                ) : (
                  <p className="operation-empty">Nenhuma consulta executada nesta sessão.</p>
                )}
              </section>

              <section className="operation-card">
                <p className="panel-frame__eyebrow">Procedimento</p>
                <h3>Atualização de preço</h3>
                <p>Executa a rotina do banco para atualizar o preço de um produto.</p>
                <form className="editor-form" onSubmit={aoExecutarProcedimentoPreco}>
                  <CampoFormulario
                    htmlFor="produto-procedimento-codigo"
                    rotulo="Código do produto"
                  >
                    <input
                      id="produto-procedimento-codigo"
                      name="codigo"
                      className="input"
                      value={formularioProcedimentoPreco.codigo}
                      onChange={aoMudarCampoProcedimentoPreco}
                      autoComplete="off"
                      required
                    />
                  </CampoFormulario>
                  <CampoFormulario htmlFor="produto-procedimento-preco" rotulo="Novo preço">
                    <input
                      id="produto-procedimento-preco"
                      name="novoPreco"
                      className="input"
                      type="number"
                      step="0.01"
                      min="0.01"
                      inputMode="decimal"
                      value={formularioProcedimentoPreco.novoPreco}
                      onChange={aoMudarCampoProcedimentoPreco}
                      autoComplete="off"
                      required
                    />
                  </CampoFormulario>
                  <div className="editor-form__actions">
                    <button
                      type="submit"
                      className="button button--primary"
                      disabled={executandoProcedimentoPreco}
                    >
                      {executandoProcedimentoPreco ? 'Executando...' : 'Executar procedimento'}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <section className="operation-card">
              <p className="panel-frame__eyebrow">Trigger</p>
              <h3>Histórico automático de preços</h3>
              <p>Quando o preço de um produto muda, a automação do banco registra o histórico abaixo.</p>
              <div className="table-wrap">
                <div className="table-scroll table-scroll--compact">
                  <table>
                    <caption className="sr-only">Histórico de alterações de preço</caption>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Preço antigo</th>
                        <th>Preço novo</th>
                        <th>Alterado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsAlteracaoPreco.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <strong>{log.codProduto}</strong>
                            <span className="table-note">{log.nomeProduto}</span>
                          </td>
                          <td>{formatarMoeda(log.precoAntigo)}</td>
                          <td>{formatarMoeda(log.precoNovo)}</td>
                          <td>{formatarDataHora(log.alteradoEm)}</td>
                        </tr>
                      ))}
                      {!logsAlteracaoPreco.length ? (
                        <tr>
                          <td colSpan="4" className="table-empty">
                            Nenhuma alteração de preço foi registrada ainda.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}
      </PainelSecao>
      </div>
    </div>
  );
}
