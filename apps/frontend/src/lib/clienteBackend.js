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
    throw new Error(corpo?.message ?? 'Não foi possível concluir a operação.');
  }

  return corpo;
}

export function buscarCategorias(signal) {
  return fazerRequisicao('/categorias', { signal });
}

export function buscarClientes(signal) {
  return fazerRequisicao('/clientes', { signal });
}

export function criarCliente(dados) {
  return fazerRequisicao('/clientes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarCliente(cpf, dados) {
  return fazerRequisicao(`/clientes/${cpf}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirCliente(cpf) {
  return fazerRequisicao(`/clientes/${cpf}`, {
    method: 'DELETE',
  });
}

export function buscarAtendentes(signal) {
  return fazerRequisicao('/atendentes', { signal });
}

export function buscarFornecedores(signal) {
  return fazerRequisicao('/fornecedores', { signal });
}

export function buscarProdutos(signal) {
  return fazerRequisicao('/produtos', { signal });
}

export function buscarMelhorFornecedorProduto(codigo) {
  return fazerRequisicao(`/produtos/${codigo}/melhor-fornecedor`);
}

export function atualizarPrecoProdutoProcedimento(codigo, novoPreco) {
  return fazerRequisicao(`/produtos/${codigo}/atualizar-preco-procedimento`, {
    method: 'POST',
    body: JSON.stringify({ novoPreco }),
  });
}

export function buscarLogsAlteracaoPreco(signal) {
  return fazerRequisicao('/produtos/logs/alteracao-preco', { signal });
}

export function buscarConsultaAtendentesPorVendas(minimoVendas, signal) {
  const parametros = new URLSearchParams({
    minimoVendas: String(minimoVendas ?? 0),
  });
  return fazerRequisicao(`/relatorios/consulta-atendentes-por-vendas?${parametros.toString()}`, {
    signal,
  });
}

export function buscarConsultaClientesPorNome(nome, signal) {
  const parametros = new URLSearchParams({
    nome: nome || '%',
  });
  return fazerRequisicao(`/relatorios/consulta-clientes-por-nome?${parametros.toString()}`, {
    signal,
  });
}

export function buscarConsultaProdutosPorNome(nome, signal) {
  const parametros = new URLSearchParams({
    nome: nome || '',
  });
  return fazerRequisicao(`/relatorios/consulta-produtos-por-nome?${parametros.toString()}`, {
    signal,
  });
}

export function buscarConsultaProdutosSemVenda(signal) {
  return fazerRequisicao('/relatorios/consulta-produtos-sem-venda', { signal });
}

export function buscarConsultaMelhorPrazoFornecedor(signal) {
  return fazerRequisicao('/relatorios/consulta-melhor-prazo-fornecedor', { signal });
}

export function buscarViewVendasDetalhadas(signal) {
  return fazerRequisicao('/relatorios/view-vendas-detalhadas', { signal });
}

export function buscarViewEstoqueCritico(signal) {
  return fazerRequisicao('/relatorios/view-estoque-critico', { signal });
}

export function buscarViewProdutosMaisVendidos(signal) {
  return fazerRequisicao('/relatorios/view-produtos-mais-vendidos', { signal });
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

export function criarFornecedor(dados) {
  return fazerRequisicao('/fornecedores', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarFornecedor(cnpj, dados) {
  return fazerRequisicao(`/fornecedores/${cnpj}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirFornecedor(cnpj) {
  return fazerRequisicao(`/fornecedores/${cnpj}`, {
    method: 'DELETE',
  });
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
