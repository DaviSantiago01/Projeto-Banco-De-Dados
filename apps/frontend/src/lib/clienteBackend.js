// Centraliza as chamadas HTTP do frontend para a API.
const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function fazerRequisicao(caminho, opcoes = {}) {
  const cabecalhos = {
    ...(opcoes.headers ?? {}),
  };

  // So envia JSON quando a requisicao realmente tem corpo.
  if (opcoes.body != null && !cabecalhos['Content-Type']) {
    cabecalhos['Content-Type'] = 'application/json';
  }

  const resposta = await fetch(`${URL_BASE_API}${caminho}`, {
    headers: cabecalhos,
    ...opcoes,
  });

  if (resposta.status === 204) {
    return null;
  }

  // Le o corpo so quando a resposta vem em JSON para evitar erro em respostas vazias.
  const tipoConteudo = resposta.headers.get('content-type') ?? '';
  const corpo = tipoConteudo.includes('application/json') ? await resposta.json() : null;

  if (!resposta.ok) {
    throw new Error(corpo?.message ?? 'Nao foi possivel concluir a operacao.');
  }

  return corpo;
}

export function buscarCategorias(signal) {
  return fazerRequisicao('/categorias', { signal });
}

export function buscarClientes(signal) {
  return fazerRequisicao('/clientes', { signal });
}

export function buscarAtendentes(signal) {
  return fazerRequisicao('/atendentes', { signal });
}

export function buscarProdutos(signal) {
  return fazerRequisicao('/produtos', { signal });
}

export function criarProduto(dados) {
  return fazerRequisicao('/produtos', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarProduto(codigo, dados) {
  return fazerRequisicao(`/produtos/${codigo}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirProduto(codigo) {
  return fazerRequisicao(`/produtos/${codigo}`, {
    method: 'DELETE',
  });
}

export function buscarVendas(signal) {
  return fazerRequisicao('/vendas', { signal });
}

export function criarVenda(dados) {
  return fazerRequisicao('/vendas', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarVenda(numero, dados) {
  return fazerRequisicao(`/vendas/${numero}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirVenda(numero) {
  return fazerRequisicao(`/vendas/${numero}`, {
    method: 'DELETE',
  });
}
