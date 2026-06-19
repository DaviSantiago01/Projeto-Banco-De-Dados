import { PainelSecao } from './PainelSecao';
import { TabelaAnalitica } from './TabelaAnalitica';

export function SecaoRelatorios({
  carregandoRelatorios,
  consultaAtendentesVendas,
  filtrosRelatorios,
  aoAtualizarFiltroRelatorio,
  aoExecutarConsultaAtendentesVendas,
  viewVendasDetalhadas,
  viewEstoqueCritico,
  viewProdutosMaisVendidos,
}) {
  return (
    <div id="panel-relatorios" role="tabpanel" aria-labelledby="tab-relatorios" className="panel-stack">
      <div className="view-block">
        <PainelSecao
          sobretitulo="Consulta 1"
          titulo="Atendentes por quantidade de vendas"
          descricao="Mostra atendentes com total de vendas acima do limite informado."
        >
          <div className="section-panel section-panel--stack">
            <div className="operation-grid operation-grid--single">
              <section className="operation-card">
                <form className="editor-form" onSubmit={aoExecutarConsultaAtendentesVendas}>
                  <label className="form-field">
                    <span className="form-field__label">Mais que quantas vendas?</span>
                    <input
                      name="atendentesMinimoVendas"
                      className="input"
                      type="number"
                      min="0"
                      step="1"
                      value={filtrosRelatorios.atendentesMinimoVendas}
                      onChange={aoAtualizarFiltroRelatorio}
                    />
                  </label>
                  <div className="editor-form__actions">
                    <button type="submit" className="button button--primary">
                      Atualizar consulta
                    </button>
                  </div>
                </form>
                <p className="operation-example">Base técnica: JOIN + GROUP BY + HAVING.</p>
              </section>
            </div>
            <TabelaAnalitica
              titulo="Resultado da consulta de atendentes"
              linhas={consultaAtendentesVendas}
              carregando={carregandoRelatorios}
              semCabecalho
              larguraMinima={980}
            />
          </div>
        </PainelSecao>
      </div>

      <div className="view-block">
        <TabelaAnalitica
          sobretitulo="View 1"
          titulo="Vendas detalhadas"
          descricao="Histórico detalhado de vendas, clientes, atendentes e itens vendidos."
          linhas={viewVendasDetalhadas}
          carregando={carregandoRelatorios}
          compacta
          maxLinhas={20}
          larguraMinima={1180}
        />
      </div>
      <div className="view-block">
        <TabelaAnalitica
          sobretitulo="View 2"
          titulo="Estoque crítico"
          descricao="Produtos com estoque abaixo do mínimo, quando houver."
          linhas={viewEstoqueCritico}
          carregando={carregandoRelatorios}
          compacta
          larguraMinima={980}
        />
      </div>
      <div className="view-block">
        <TabelaAnalitica
          sobretitulo="View 3"
          titulo="Produtos mais vendidos"
          descricao="Ranking de produtos pela quantidade total vendida."
          linhas={viewProdutosMaisVendidos}
          carregando={carregandoRelatorios}
          compacta
          maxLinhas={5}
          larguraMinima={980}
        />
      </div>
    </div>
  );
}
