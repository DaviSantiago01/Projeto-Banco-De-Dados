import { useState } from 'react';
import { formatarMoeda } from '../lib/formatadores';
import { PainelSecao } from './PainelSecao';

const CORES_GRAFICO = ['#5f7cff', '#5de0aa', '#f4c95d', '#fb8f67', '#73c1ff', '#b58cff'];

function somarValoresVendas(vendas) {
  return vendas.reduce((acumulado, venda) => acumulado + Number(venda.valorTotal ?? 0), 0);
}

function formatarNumero(valor, casas = 0) {
  return Number(valor ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function formatarDataIsoCurta(valor) {
  return valor ? String(valor).slice(0, 10) : '';
}

function formatarDataRotulo(valor) {
  if (!valor) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${valor}T00:00:00`));
}

function estaDentroDoPeriodo(dataIso, dataInicio, dataFim) {
  if (!dataIso) {
    return false;
  }

  if (dataInicio && dataIso < dataInicio) {
    return false;
  }

  if (dataFim && dataIso > dataFim) {
    return false;
  }

  return true;
}

function obterInicioSemana(dataIso) {
  const data = new Date(`${dataIso}T00:00:00`);
  const diaSemana = data.getDay() || 7;
  data.setDate(data.getDate() - diaSemana + 1);
  return data.toISOString().slice(0, 10);
}

function montarChaveTemporal(dataIso, granularidade) {
  if (granularidade === 'mensal') {
    return {
      chave: dataIso.slice(0, 7),
      rotulo: new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: '2-digit',
      }).format(new Date(`${dataIso.slice(0, 7)}-01T00:00:00`)),
    };
  }

  if (granularidade === 'semanal') {
    const inicioSemana = obterInicioSemana(dataIso);
    return {
      chave: inicioSemana,
      rotulo: `Sem. ${formatarDataRotulo(inicioSemana)}`,
    };
  }

  return {
    chave: dataIso,
    rotulo: formatarDataRotulo(dataIso),
  };
}

function montarResumoDashboard({ clientes, vendas, viewVendasDetalhadas }) {
  const totalVendas = vendas.length;
  const faturamentoTotal = somarValoresVendas(vendas);
  const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;
  const totalItensVendidos = viewVendasDetalhadas.reduce(
    (acumulado, item) => acumulado + Number(item.quantidade ?? 0),
    0,
  );

  return [
    {
      titulo: 'Total de vendas',
      valor: totalVendas.toLocaleString('pt-BR'),
      detalhe: 'registros confirmados',
    },
    {
      titulo: 'Faturamento total',
      valor: formatarMoeda(faturamentoTotal),
      detalhe: 'receita total registrada',
    },
    {
      titulo: 'Ticket medio',
      valor: formatarMoeda(ticketMedio),
      detalhe: 'valor medio por venda',
    },
    {
      titulo: 'Total de clientes',
      valor: clientes.length.toLocaleString('pt-BR'),
      detalhe: 'clientes cadastrados',
    },
    {
      titulo: 'Itens vendidos',
      valor: formatarNumero(totalItensVendidos),
      detalhe: 'quantidade total vendida',
    },
  ];
}

function montarFaturamentoTemporal(detalhes, vendas, granularidade) {
  const grupos = new Map();

  if (detalhes.length > 0) {
    detalhes.forEach((item) => {
      const dataIso = formatarDataIsoCurta(item.data_hora);
      const grupo = montarChaveTemporal(dataIso, granularidade);
      const atual = grupos.get(grupo.chave) ?? { ...grupo, valor: 0, vendas: new Set() };
      atual.valor += Number(item.subtotal_item ?? 0);
      if (item.numero_venda != null) {
        atual.vendas.add(item.numero_venda);
      }
      grupos.set(grupo.chave, atual);
    });
  } else {
    vendas.forEach((venda, indice) => {
      const dataIso = formatarDataIsoCurta(venda.dataHora);
      const grupo = montarChaveTemporal(dataIso, granularidade);
      const atual = grupos.get(grupo.chave) ?? { ...grupo, valor: 0, vendas: new Set() };
      atual.valor += Number(venda.valorTotal ?? 0);
      atual.vendas.add(venda.numero ?? `${grupo.chave}-${indice}`);
      grupos.set(grupo.chave, atual);
    });
  }

  return [...grupos.values()]
    .map(({ vendas: totalVendas, ...item }) => ({
      ...item,
      totalVendas: totalVendas.size,
    }))
    .sort((itemA, itemB) => itemA.chave.localeCompare(itemB.chave));
}

function BotaoFiltro({ aberto, rotulo, aoClique }) {
  return (
    <button
      type="button"
      className={`input input--compact dashboard-select-trigger${aberto ? ' dashboard-select-trigger--active' : ''}`}
      onClick={aoClique}
      aria-expanded={aberto}
    >
      <span>{rotulo}</span>
      <span className="dashboard-select-trigger__arrow" aria-hidden="true">
        v
      </span>
    </button>
  );
}

function montarMeiosPagamento(vendas, meiosOcultos) {
  const pagamentosMap = new Map();

  vendas.forEach((venda) => {
    const chave = venda.formaPagamento;
    pagamentosMap.set(chave, (pagamentosMap.get(chave) ?? 0) + 1);
  });

  return [...pagamentosMap.entries()]
    .map(([chave, valor]) => ({
      chave,
      rotulo: chave.replaceAll('_', ' '),
      valor,
      ativo: !meiosOcultos.includes(chave),
    }))
    .sort((itemA, itemB) => itemB.valor - itemA.valor);
}

function montarFaixasValorVendas(vendas) {
  const faixas = [
    { chave: 'faixa-1', rotulo: 'Até R$ 100', minimo: 0, maximo: 100 },
    { chave: 'faixa-2', rotulo: 'R$ 100 a R$ 300', minimo: 100, maximo: 300 },
    { chave: 'faixa-3', rotulo: 'R$ 300 a R$ 600', minimo: 300, maximo: 600 },
    { chave: 'faixa-4', rotulo: 'Acima de R$ 600', minimo: 600, maximo: Number.POSITIVE_INFINITY },
  ].map((faixa) => ({ ...faixa, valor: 0 }));

  vendas.forEach((venda) => {
    const valor = Number(venda.valorTotal ?? 0);
    const faixa = faixas.find((item) => valor >= item.minimo && valor < item.maximo);

    if (faixa) {
      faixa.valor += 1;
    }
  });

  return faixas.map((faixa) => ({
    chave: faixa.chave,
    rotulo: faixa.rotulo,
    valor: faixa.valor,
    descricao: `${formatarNumero(faixa.valor)} vendas nesta faixa`,
  }));
}

function BarraLegenda({ itens, sufixo = '', casas = 0 }) {
  if (itens.length === 0) {
    return <p className="chart-empty">Nenhum dado disponivel para o filtro atual.</p>;
  }

  const maiorValor = Math.max(...itens.map((item) => item.valor), 1);

  return (
    <div className="chart-bars chart-bars--horizontal" role="img" aria-label="Grafico de barras">
      {itens.map((item) => (
        <article key={item.chave ?? item.rotulo} className="chart-bars__item">
          <div className="chart-bars__meta">
            <strong>{item.rotulo}</strong>
            <span>{formatarNumero(item.valor, casas)}{sufixo}</span>
          </div>
          <div className="chart-bars__track">
            <span
              className="chart-bars__fill"
              style={{ width: `${Math.max((item.valor / maiorValor) * 100, 6)}%` }}
            />
          </div>
          {item.descricao ? <small>{item.descricao}</small> : null}
        </article>
      ))}
    </div>
  );
}

function GraficoLinha({ pontos }) {
  if (pontos.length === 0) {
    return <p className="chart-empty">Nenhum dado disponivel para o filtro atual.</p>;
  }

  const [indiceAtivo, setIndiceAtivo] = useState(null);
  const largura = 860;
  const altura = 260;
  const margemX = 26;
  const margemY = 20;
  const maiorValor = Math.max(...pontos.map((ponto) => ponto.valor), 1);
  const passoX = pontos.length > 1 ? (largura - margemX * 2) / (pontos.length - 1) : 0;
  const coordenadas = pontos.map((ponto, indice) => {
    const x = margemX + indice * passoX;
    const y = altura - margemY - (ponto.valor / maiorValor) * (altura - margemY * 2);
    return { ...ponto, x, y };
  });
  const caminho = coordenadas
    .map((ponto, indice) => `${indice === 0 ? 'M' : 'L'} ${ponto.x} ${ponto.y}`)
    .join(' ');
  const area = `${caminho} L ${largura - margemX} ${altura - margemY} L ${margemX} ${altura - margemY} Z`;
  const totalPeriodo = pontos.reduce((acumulado, ponto) => acumulado + ponto.valor, 0);
  const totalVendas = pontos.reduce(
    (acumulado, ponto) => acumulado + Number(ponto.totalVendas ?? 0),
    0,
  );
  const pontoAtivo = indiceAtivo != null ? coordenadas[indiceAtivo] : null;

  function lidarMouseMove(evento) {
    const { left, width } = evento.currentTarget.getBoundingClientRect();
    const xRelativo = ((evento.clientX - left) / width) * largura;
    const indiceMaisProximo = coordenadas.reduce((maisProximo, ponto, indice) => {
      const distanciaAtual = Math.abs(ponto.x - xRelativo);
      const distanciaMaisProxima = Math.abs(coordenadas[maisProximo].x - xRelativo);
      return distanciaAtual < distanciaMaisProxima ? indice : maisProximo;
    }, 0);
    setIndiceAtivo(indiceMaisProximo);
  }

  return (
    <div className="line-chart" onMouseLeave={() => setIndiceAtivo(null)}>
      <div className="line-chart__summary" aria-live="polite">
        <div className="line-chart__summary-item">
          <span>Total no periodo</span>
          <strong>{formatarMoeda(totalPeriodo)}</strong>
        </div>
        <div className="line-chart__summary-item">
          <span>Vendas no periodo</span>
          <strong>{formatarNumero(totalVendas)}</strong>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="line-chart__svg"
        aria-hidden="true"
        onMouseMove={lidarMouseMove}
      >
        <defs>
          <linearGradient id="dashboardLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(88, 128, 255, 0.36)" />
            <stop offset="100%" stopColor="rgba(88, 128, 255, 0.02)" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((linha) => {
          const y = margemY + ((altura - margemY * 2) / 3) * linha;
          return (
            <line
              key={linha}
              x1={margemX}
              y1={y}
              x2={largura - margemX}
              y2={y}
              className="line-chart__grid"
            />
          );
        })}
        <path d={area} fill="url(#dashboardLineFill)" />
        <path d={caminho} className="line-chart__path" />
        {pontoAtivo ? (
          <line
            x1={pontoAtivo.x}
            x2={pontoAtivo.x}
            y1={margemY}
            y2={altura - margemY}
            className="line-chart__hover-line"
          />
        ) : null}
        {coordenadas.map((ponto, indice) => (
          <circle
            key={ponto.chave}
            cx={ponto.x}
            cy={ponto.y}
            r={indice === indiceAtivo ? 6 : 4}
            className={`line-chart__point${indice === indiceAtivo ? ' line-chart__point--active' : ''}`}
          />
        ))}
        {pontoAtivo ? (
          <circle
            cx={pontoAtivo.x}
            cy={pontoAtivo.y}
            r="7"
            className="line-chart__hover-dot"
          />
        ) : null}
      </svg>
      {pontoAtivo ? (
        <div
          className="line-chart__tooltip"
          style={{
            left: `${(pontoAtivo.x / largura) * 100}%`,
            top: `${(pontoAtivo.y / altura) * 100}%`,
          }}
        >
          <span className="line-chart__tooltip-date">{pontoAtivo.rotulo}</span>
          <strong>{formatarMoeda(pontoAtivo.valor)}</strong>
          <small>{formatarNumero(pontoAtivo.totalVendas)} vendas</small>
        </div>
      ) : null}
    </div>
  );
}

function GraficoRosca({ itens }) {
  const itensAtivos = itens.filter((item) => item.ativo);

  if (itensAtivos.length === 0) {
    return <p className="chart-empty">Selecione ao menos um meio de pagamento no filtro.</p>;
  }

  const total = itensAtivos.reduce((acumulado, item) => acumulado + item.valor, 0);
  const { segmentos } = itensAtivos.reduce(
    (estadoAtual, item, indice) => {
      const inicio = (estadoAtual.acumulado / total) * 360;
      const novoAcumulado = estadoAtual.acumulado + item.valor;
      const fim = (novoAcumulado / total) * 360;
      estadoAtual.segmentos.push(`${CORES_GRAFICO[indice % CORES_GRAFICO.length]} ${inicio}deg ${fim}deg`);
      estadoAtual.acumulado = novoAcumulado;
      return estadoAtual;
    },
    { acumulado: 0, segmentos: [] },
  );

  return (
    <div className="donut-chart">
      <div
        className="donut-chart__ring"
        style={{ background: `conic-gradient(${segmentos.join(', ')})` }}
        aria-hidden="true"
      >
        <div className="donut-chart__hole">
          <strong>{formatarNumero(total)}</strong>
          <span>vendas</span>
        </div>
      </div>
      <div className="donut-chart__legend">
        {itens.map((item, indice) => (
          <div
            key={item.chave}
            className={`payment-legend-item${item.ativo ? '' : ' payment-legend-item--muted'}`}
          >
            <span
              className="donut-chart__swatch"
              style={{ backgroundColor: CORES_GRAFICO[indice % CORES_GRAFICO.length] }}
            />
            <span>
              <strong>{item.rotulo}</strong>
              <small>
                {formatarNumero(item.valor)} registros
                {item.ativo ? ` (${formatarNumero((item.valor / total) * 100, 1)}%)` : ''}
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecaoDashboard({ clientes = [], vendas = [], viewVendasDetalhadas = [] }) {
  const [dataInicioVendas, setDataInicioVendas] = useState('');
  const [dataFimVendas, setDataFimVendas] = useState('');
  const [meiosOcultos, setMeiosOcultos] = useState([]);
  const [filtroPeriodoAberto, setFiltroPeriodoAberto] = useState(false);
  const [filtroPagamentoAberto, setFiltroPagamentoAberto] = useState(false);
  const cards = montarResumoDashboard({ clientes, vendas, viewVendasDetalhadas });
  const vendasFiltradasNoPeriodo = vendas.filter((venda) =>
    estaDentroDoPeriodo(formatarDataIsoCurta(venda.dataHora), dataInicioVendas, dataFimVendas),
  );
  const detalhesFiltradosNoPeriodo = viewVendasDetalhadas.filter((item) =>
    estaDentroDoPeriodo(formatarDataIsoCurta(item.data_hora), dataInicioVendas, dataFimVendas),
  );
  const evolucaoVendas = montarFaturamentoTemporal(
    detalhesFiltradosNoPeriodo,
    vendasFiltradasNoPeriodo,
    'diario',
  );
  const faixasValorVendas = montarFaixasValorVendas(vendasFiltradasNoPeriodo);
  const meiosPagamento = montarMeiosPagamento(vendas, meiosOcultos);

  function alternarMeioPagamento(chave) {
    setMeiosOcultos((atuais) =>
      atuais.includes(chave) ? atuais.filter((item) => item !== chave) : [...atuais, chave],
    );
  }

  const rotuloPeriodo =
    dataInicioVendas || dataFimVendas
      ? `${dataInicioVendas || 'inicio'} ate ${dataFimVendas || 'fim'}`
      : 'Periodo';
  const totalMeiosAtivos = meiosPagamento.filter((item) => item.ativo).length;
  const rotuloPagamento =
    totalMeiosAtivos === meiosPagamento.length ? 'Todos os meios' : `${totalMeiosAtivos} meios`;

  return (
    <div id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard" className="panel-stack">
      <section className="dashboard-cards">
        {cards.map((card) => (
          <article key={card.titulo} className="dashboard-card">
            <span className="dashboard-card__label">{card.titulo}</span>
            <strong className="dashboard-card__value">{card.valor}</strong>
            <span className="dashboard-card__detail">{card.detalhe}</span>
          </article>
        ))}
      </section>

      <div className="dashboard-panel-card dashboard-panel-card--wide">
        <PainelSecao
          titulo="Evolução de vendas"
          descricao="Receita registrada ao longo do tempo dentro do intervalo selecionado."
          acoes={
            <BotaoFiltro
              aberto={filtroPeriodoAberto}
              rotulo={rotuloPeriodo}
              aoClique={() => setFiltroPeriodoAberto((atual) => !atual)}
            />
          }
        >
          {filtroPeriodoAberto ? (
            <div className="dashboard-inline-filters dashboard-date-range">
              <label className="form-field">
                <span className="form-field__label">Data inicial</span>
                <input
                  type="date"
                  className="input input--compact"
                  value={dataInicioVendas}
                  max={dataFimVendas || undefined}
                  onChange={(evento) => setDataInicioVendas(evento.target.value)}
                />
              </label>
              <label className="form-field">
                <span className="form-field__label">Data final</span>
                <input
                  type="date"
                  className="input input--compact"
                  value={dataFimVendas}
                  min={dataInicioVendas || undefined}
                  onChange={(evento) => setDataFimVendas(evento.target.value)}
                />
              </label>
            </div>
          ) : null}
          <GraficoLinha pontos={evolucaoVendas} />
        </PainelSecao>
      </div>

      <section className="dashboard-secondary-grid">
        <div className="dashboard-panel-card">
          <PainelSecao
            titulo="Faixa de valor das vendas"
            descricao="Distribui as vendas por faixas de valor para destacar ticket baixo, medio e alto."
          >
            <BarraLegenda itens={faixasValorVendas} />
          </PainelSecao>
        </div>

        <div className="dashboard-panel-card">
          <PainelSecao
            titulo="Meios de pagamento"
            descricao="Proporção de cada forma de pagamento nas vendas registradas."
            acoes={
              <BotaoFiltro
                aberto={filtroPagamentoAberto}
                rotulo={rotuloPagamento}
                aoClique={() => setFiltroPagamentoAberto((atual) => !atual)}
              />
            }
          >
            {filtroPagamentoAberto ? (
              <div className="dashboard-inline-filters payment-filter-grid">
                {meiosPagamento.map((item) => (
                  <label key={item.chave} className="category-check">
                    <input
                      type="checkbox"
                      checked={item.ativo}
                      onChange={() => alternarMeioPagamento(item.chave)}
                    />
                    <span>{item.rotulo}</span>
                  </label>
                ))}
              </div>
            ) : null}
            <GraficoRosca itens={meiosPagamento} />
          </PainelSecao>
        </div>
      </section>
    </div>
  );
}
