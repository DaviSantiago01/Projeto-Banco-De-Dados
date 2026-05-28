import { PainelSecao } from './PainelSecao';
import { formatarDataHora, formatarMoeda } from '../lib/formatadores';

function formatarValor(valor) {
  if (valor == null) {
    return '-';
  }

  if (typeof valor === 'number') {
    return Number.isInteger(valor) ? valor : valor.toFixed(2);
  }

  if (typeof valor === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(valor) || /^\d{4}-\d{2}-\d{2} /.test(valor)) {
      return formatarDataHora(valor);
    }

    if (/^\d+\.\d{2}$/.test(valor)) {
      return formatarMoeda(valor);
    }
  }

  return valor;
}

export function TabelaAnalitica({
  sobretitulo,
  titulo,
  descricao,
  linhas,
  carregando,
  semCabecalho = false,
  compacta = false,
  maxLinhas,
  larguraMinima,
}) {
  const colunas = linhas[0] ? Object.keys(linhas[0]) : [];
  const linhasVisiveis = maxLinhas ? linhas.slice(0, maxLinhas) : linhas;

  const conteudoTabela = (
    <div className={`table-wrap${compacta ? ' table-wrap--compact' : ''}`}>
      <div className={`table-scroll table-scroll--compact${compacta ? ' table-scroll--dense' : ''}${maxLinhas ? ' table-scroll--limited' : ''}`}>
        <table style={larguraMinima ? { minWidth: `${larguraMinima}px` } : undefined}>
          <caption className="sr-only">{titulo || 'Tabela analítica'}</caption>
          <thead>
            <tr>
              {colunas.map((coluna) => (
                <th key={coluna}>{coluna.replaceAll('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhasVisiveis.map((linha, indice) => (
              <tr key={`${titulo}-${indice}`}>
                {colunas.map((coluna) => (
                  <td key={coluna}>{formatarValor(linha[coluna])}</td>
                ))}
              </tr>
            ))}
            {!linhas.length ? (
              <tr>
                <td colSpan={Math.max(colunas.length, 1)} className="table-empty">
                  {carregando ? 'Carregando dados...' : 'Nenhum registro encontrado.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (semCabecalho) {
    return conteudoTabela;
  }

  return (
    <PainelSecao sobretitulo={sobretitulo} titulo={titulo} descricao={descricao}>
      {conteudoTabela}
    </PainelSecao>
  );
}
