// Reune formatadores simples usados nas telas.
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatarMoeda(valor) {
  return formatadorMoeda.format(Number(valor ?? 0));
}

export function formatarDataHora(valor) {
  if (!valor) {
    return 'Sem data';
  }

  return formatadorDataHora.format(new Date(valor));
}
