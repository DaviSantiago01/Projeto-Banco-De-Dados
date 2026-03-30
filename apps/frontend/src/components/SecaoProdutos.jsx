import { CampoFormulario } from './CampoFormulario';
import { PainelSecao } from './PainelSecao';
import { formatarMoeda } from '../lib/formatadores';

// Exibe o formulario e a lista usados no CRUD de produtos.
const OPCOES_UNIDADE = ['UN', 'KG', 'M', 'L', 'CX'];

export function SecaoProdutos({
  categorias,
  codigoProdutoEmEdicao,
  produtosFiltrados,
  carregando,
  salvandoProduto,
  formularioProduto,
  buscaProduto,
  mensagemTabelaProdutos,
  aoExcluirProduto,
  aoEditarProduto,
  aoMudarCampoProduto,
  aoMudarBuscaProduto,
  aoSalvarProduto,
  aoLimparProduto,
}) {
  return (
    <div
      id="panel-produtos"
      role="tabpanel"
      aria-labelledby="tab-produtos"
      className="module-grid"
    >
      <PainelSecao
        titulo={codigoProdutoEmEdicao ? 'Editar produto' : 'Novo produto'}
        descricao="Preencha os campos principais do item para cadastrar ou atualizar o catalogo da loja."
      >
        <form className="editor-form" onSubmit={aoSalvarProduto}>
          <div className="editor-form__grid">
            <CampoFormulario
              htmlFor="produto-codigo"
              rotulo="Codigo"
              ajuda="Informe um codigo unico."
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
            <CampoFormulario htmlFor="produto-preco" rotulo="Preco">
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
            <CampoFormulario htmlFor="produto-descricao" rotulo="Descricao">
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
      </PainelSecao>

      <PainelSecao
        titulo="Lista de produtos"
        descricao="Consulte os produtos cadastrados, filtre por codigo ou nome e abra rapidamente uma edicao."
        acoes={
          <label className="search-field" htmlFor="busca-produtos">
            <span className="sr-only">Buscar produtos</span>
            <input
              id="busca-produtos"
              name="busca-produtos"
              type="search"
              value={buscaProduto}
              onChange={aoMudarBuscaProduto}
              placeholder="Buscar por codigo ou nome..."
              autoComplete="off"
            />
          </label>
        }
      >
        <div className="table-wrap">
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Lista de produtos cadastrados</caption>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preco</th>
                  <th>Unidade</th>
                  <th>Acoes</th>
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
      </PainelSecao>
    </div>
  );
}
