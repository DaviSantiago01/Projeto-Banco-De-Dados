import { Fragment, useEffect, useState } from "react";
import { SecaoDashboard } from "./components/SecaoDashboard";
import { SecaoClientes } from "./components/SecaoClientes";
import { SecaoFornecedores } from "./components/SecaoFornecedores";
import { SecaoProdutos } from "./components/SecaoProdutos";
import { SecaoRelatorios } from "./components/SecaoRelatorios";
import { SecaoVendas } from "./components/SecaoVendas";
import { AvisoStatus } from "./components/AvisoStatus";
import { ModalConfirmacao } from "./components/ModalConfirmacao";
import {
  atualizarCliente,
  atualizarFornecedor,
  atualizarPrecoProdutoProcedimento,
  atualizarProduto,
  atualizarVenda,
  buscarAtendentes,
  buscarCategorias,
  buscarClientes,
  buscarConsultaAtendentesPorVendas,
  buscarConsultaClientesPorNome,
  buscarConsultaMelhorPrazoFornecedor,
  buscarConsultaProdutosPorNome,
  buscarConsultaProdutosSemVenda,
  buscarFornecedores,
  buscarLogsAlteracaoPreco,
  buscarMelhorFornecedorProduto,
  buscarProdutos,
  buscarVendas,
  buscarViewEstoqueCritico,
  buscarViewProdutosMaisVendidos,
  buscarViewVendasDetalhadas,
  criarCliente,
  criarFornecedor,
  criarProduto,
  criarVenda,
  excluirCliente,
  excluirFornecedor,
  excluirProduto,
  excluirVenda,
} from "./lib/clienteBackend";
import "./App.css";

// Reune o estado principal da tela e coordena os modulos de produtos e vendas.
const ABAS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "relatorios", label: "Relatórios" },
  { id: "clientes", label: "Clientes", separadoAnterior: true },
  { id: "fornecedores", label: "Fornecedores" },
  { id: "produtos", label: "Produtos" },
  { id: "vendas", label: "Vendas" },
];

// Gera o proximo codigo seguindo o padrao PROD001, PROD002 e assim por diante.
function montarProximoCodigoProduto(produtos) {
  const maiorCodigo = produtos.reduce((maiorAtual, produto) => {
    const sufixo = produto.codigo?.match(/(\d+)$/)?.[1];
    return sufixo ? Math.max(maiorAtual, Number(sufixo)) : maiorAtual;
  }, 30);

  return `PROD${String(maiorCodigo + 1).padStart(3, "0")}`;
}

// Monta o formulario inicial para deixar a tela pronta assim que os dados carregam.
function montarFormularioInicialProduto(produtos, categorias) {
  return {
    codigo: montarProximoCodigoProduto(produtos),
    nome: "",
    preco: "",
    descricao: "",
    unidadeMedida: "UN",
    codCategoria: categorias[0]?.codigo ?? "",
  };
}

function montarOperacoesProdutoIniciais(produtos) {
  const produtoBase = produtos[0];

  return {
    codigoConsultaFornecedor: produtoBase?.codigo ?? "",
    formularioProcedimentoPreco: {
      codigo: produtoBase?.codigo ?? "",
      novoPreco: produtoBase?.preco != null ? String(produtoBase.preco) : "",
    },
  };
}

function montarFormularioInicialCliente() {
  return {
    cpf: "",
    nome: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
  };
}

function montarFormularioInicialFornecedor() {
  return {
    cnpj: "",
    nome: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
  };
}

function montarFiltrosRelatoriosIniciais() {
  return {
    atendentesMinimoVendas: "0",
    clientesHistoricoNome: "Mariana",
    produtosNome: "PVC",
  };
}

function montarFormularioInicialVenda(vendas, clientes = [], atendentes = []) {
  const proximoNumero =
    vendas.reduce(
      (maiorAtual, venda) => Math.max(maiorAtual, venda.numero ?? 0),
      30,
    ) + 1;
  const dataAtual = new Date();
  const dataHoraLocal = new Date(
    dataAtual.getTime() - dataAtual.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

  return {
    numero: String(proximoNumero),
    dataHora: dataHoraLocal,
    valorTotal: "",
    formaPagamento: "PIX",
    cpfCliente: clientes[0]?.cpf ?? "",
    matAtendente: atendentes[0]?.matricula ?? "",
  };
}

function produtoParaFormulario(produto) {
  return {
    codigo: produto.codigo,
    nome: produto.nome,
    preco: String(produto.preco),
    descricao: produto.descricao ?? "",
    unidadeMedida: produto.unidadeMedida,
    codCategoria: produto.codCategoria,
  };
}

function vendaParaFormulario(venda) {
  return {
    numero: String(venda.numero),
    dataHora: venda.dataHora.slice(0, 16),
    valorTotal: String(venda.valorTotal),
    formaPagamento: venda.formaPagamento,
    cpfCliente: venda.cpfCliente,
    matAtendente: venda.matAtendente,
  };
}

function clienteParaFormulario(cliente) {
  return {
    cpf: cliente.cpf,
    nome: cliente.nome ?? "",
    email: cliente.email ?? "",
    cep: cliente.cep ?? "",
    rua: cliente.rua ?? "",
    numero: cliente.numero ?? "",
    bairro: cliente.bairro ?? "",
  };
}

function fornecedorParaFormulario(fornecedor) {
  return {
    cnpj: fornecedor.cnpj,
    nome: fornecedor.nome ?? "",
    email: fornecedor.email ?? "",
    cep: fornecedor.cep ?? "",
    rua: fornecedor.rua ?? "",
    numero: fornecedor.numero ?? "",
    bairro: fornecedor.bairro ?? "",
  };
}

function normalizarDataHora(valor) {
  return valor.length === 16 ? `${valor}:00` : valor;
}

// Reaproveita a mesma carga no primeiro acesso e no botao de atualizar.
async function carregarTodosOsDados(signal) {
  const [
    clientes,
    fornecedores,
    atendentes,
    categorias,
    produtos,
    vendas,
    logsAlteracaoPreco,
  ] = await Promise.all([
    buscarClientes(signal),
    buscarFornecedores(signal),
    buscarAtendentes(signal),
    buscarCategorias(signal),
    buscarProdutos(signal),
    buscarVendas(signal),
    buscarLogsAlteracaoPreco(signal),
  ]);

  return {
    clientes,
    fornecedores,
    atendentes,
    categorias,
    produtos,
    vendas,
    logsAlteracaoPreco,
  };
}

async function carregarRelatorios(signal, filtros) {
  const resultados = await Promise.allSettled([
    buscarConsultaAtendentesPorVendas(
      Number(filtros.atendentesMinimoVendas || 0),
      signal,
    ),
    buscarConsultaClientesPorNome(filtros.clientesHistoricoNome, signal),
    buscarConsultaProdutosPorNome(filtros.produtosNome, signal),
    buscarConsultaProdutosSemVenda(signal),
    buscarConsultaMelhorPrazoFornecedor(signal),
    buscarViewVendasDetalhadas(signal),
    buscarViewEstoqueCritico(signal),
    buscarViewProdutosMaisVendidos(signal),
  ]);
  const [
    consultaAtendentesVendas,
    consultaClientesPorNome,
    consultaProdutosNome,
    consultaProdutosSemVenda,
    consultaMelhorPrazoFornecedor,
    viewVendasDetalhadas,
    viewEstoqueCritico,
    viewProdutosMaisVendidos,
  ] = resultados.map((resultado) =>
    resultado.status === "fulfilled" ? resultado.value : [],
  );

  return {
    consultaAtendentesVendas,
    consultaClientesPorNome,
    consultaProdutosNome,
    consultaProdutosSemVenda,
    consultaMelhorPrazoFornecedor,
    viewVendasDetalhadas,
    viewEstoqueCritico,
    viewProdutosMaisVendidos,
  };
}

function Aplicacao() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [atendentes, setAtendentes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [logsAlteracaoPreco, setLogsAlteracaoPreco] = useState([]);
  const [formularioCliente, setFormularioCliente] = useState(
    montarFormularioInicialCliente(),
  );
  const [formularioFornecedor, setFormularioFornecedor] = useState(
    montarFormularioInicialFornecedor(),
  );
  const [formularioProduto, setFormularioProduto] = useState(
    montarFormularioInicialProduto([], []),
  );
  const [codigoConsultaFornecedor, setCodigoConsultaFornecedor] = useState("");
  const [formularioProcedimentoPreco, setFormularioProcedimentoPreco] =
    useState({
      codigo: "",
      novoPreco: "",
    });
  const [melhorFornecedorProduto, setMelhorFornecedorProduto] = useState(null);
  const [formularioVenda, setFormularioVenda] = useState(
    montarFormularioInicialVenda([]),
  );
  const [filtrosRelatorios, setFiltrosRelatorios] = useState(
    montarFiltrosRelatoriosIniciais(),
  );
  const [cpfClienteEmEdicao, setCpfClienteEmEdicao] = useState(null);
  const [cnpjFornecedorEmEdicao, setCnpjFornecedorEmEdicao] = useState(null);
  const [codigoProdutoEmEdicao, setCodigoProdutoEmEdicao] = useState(null);
  const [numeroVendaEmEdicao, setNumeroVendaEmEdicao] = useState(null);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false);
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [modalVendaAberto, setModalVendaAberto] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [salvandoCliente, setSalvandoCliente] = useState(false);
  const [salvandoFornecedor, setSalvandoFornecedor] = useState(false);
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [salvandoVenda, setSalvandoVenda] = useState(false);
  const [consultandoMelhorFornecedor, setConsultandoMelhorFornecedor] =
    useState(false);
  const [executandoProcedimentoPreco, setExecutandoProcedimentoPreco] =
    useState(false);
  const [carregandoRelatorios, setCarregandoRelatorios] = useState(true);
  const [consultaAtendentesVendas, setConsultaAtendentesVendas] = useState([]);
  const [consultaClientesPorNome, setConsultaClientesPorNome] = useState([]);
  const [consultaProdutosNome, setConsultaProdutosNome] = useState([]);
  const [consultaProdutosSemVenda, setConsultaProdutosSemVenda] = useState([]);
  const [consultaMelhorPrazoFornecedor, setConsultaMelhorPrazoFornecedor] =
    useState([]);
  const [viewVendasDetalhadas, setViewVendasDetalhadas] = useState([]);
  const [viewEstoqueCritico, setViewEstoqueCritico] = useState([]);
  const [viewProdutosMaisVendidos, setViewProdutosMaisVendidos] = useState([]);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    const controleAbortar = new AbortController();

    async function carregarDadosIniciais() {
      setCarregando(true);
      setCarregandoRelatorios(true);

      try {
        const [dados, relatorios] = await Promise.all([
          carregarTodosOsDados(controleAbortar.signal),
          carregarRelatorios(
            controleAbortar.signal,
            montarFiltrosRelatoriosIniciais(),
          ),
        ]);

        setClientes(dados.clientes);
        setFornecedores(dados.fornecedores);
        setAtendentes(dados.atendentes);
        setCategorias(dados.categorias);
        setProdutos(dados.produtos);
        setVendas(dados.vendas);
        setLogsAlteracaoPreco(dados.logsAlteracaoPreco);
        setFormularioProduto(
          montarFormularioInicialProduto(dados.produtos, dados.categorias),
        );
        const operacoesIniciais = montarOperacoesProdutoIniciais(
          dados.produtos,
        );
        setCodigoConsultaFornecedor(operacoesIniciais.codigoConsultaFornecedor);
        setFormularioProcedimentoPreco(
          operacoesIniciais.formularioProcedimentoPreco,
        );
        setFormularioVenda(
          montarFormularioInicialVenda(
            dados.vendas,
            dados.clientes,
            dados.atendentes,
          ),
        );
        setConsultaAtendentesVendas(relatorios.consultaAtendentesVendas);
        setConsultaClientesPorNome(relatorios.consultaClientesPorNome);
        setConsultaProdutosNome(relatorios.consultaProdutosNome);
        setConsultaProdutosSemVenda(relatorios.consultaProdutosSemVenda);
        setConsultaMelhorPrazoFornecedor(
          relatorios.consultaMelhorPrazoFornecedor,
        );
        setViewVendasDetalhadas(relatorios.viewVendasDetalhadas);
        setViewEstoqueCritico(relatorios.viewEstoqueCritico);
        setViewProdutosMaisVendidos(relatorios.viewProdutosMaisVendidos);
      } catch (erro) {
        if (erro.name !== "AbortError") {
          setAviso({ tipo: "error", mensagem: erro.message });
        }
      } finally {
        setCarregando(false);
        setCarregandoRelatorios(false);
      }
    }

    carregarDadosIniciais();

    return () => controleAbortar.abort();
  }, []);

  useEffect(() => {
    if (!aviso) {
      return undefined;
    }

    const temporizador = window.setTimeout(() => {
      setAviso(null);
    }, 5000);

    return () => window.clearTimeout(temporizador);
  }, [aviso]);

  // Atualiza as listas e, se preciso, limpa a edicao ativa para voltar ao formulario inicial.
  async function atualizarDados({
    limparCliente = false,
    limparFornecedor = false,
    limparProduto = false,
    limparVenda = false,
  } = {}) {
    setAtualizando(true);
    setCarregandoRelatorios(true);

    try {
      const dados = await carregarTodosOsDados();

      setClientes(dados.clientes);
      setFornecedores(dados.fornecedores);
      setAtendentes(dados.atendentes);
      setCategorias(dados.categorias);
      setProdutos(dados.produtos);
      setVendas(dados.vendas);
      setLogsAlteracaoPreco(dados.logsAlteracaoPreco);

      if (limparCliente) {
        setCpfClienteEmEdicao(null);
        setFormularioCliente(montarFormularioInicialCliente());
        setModalClienteAberto(false);
      }

      if (limparFornecedor) {
        setCnpjFornecedorEmEdicao(null);
        setFormularioFornecedor(montarFormularioInicialFornecedor());
        setModalFornecedorAberto(false);
      }

      if (limparProduto) {
        setCodigoProdutoEmEdicao(null);
        setFormularioProduto(
          montarFormularioInicialProduto(dados.produtos, dados.categorias),
        );
        setModalProdutoAberto(false);
      }

      if (!limparProduto && codigoProdutoEmEdicao) {
        const produtoAtualizado = dados.produtos.find(
          (produto) => produto.codigo === codigoProdutoEmEdicao,
        );

        if (produtoAtualizado) {
          setFormularioProduto(produtoParaFormulario(produtoAtualizado));
        }
      }

      if (limparVenda) {
        setNumeroVendaEmEdicao(null);
        setFormularioVenda(
          montarFormularioInicialVenda(
            dados.vendas,
            dados.clientes,
            dados.atendentes,
          ),
        );
        setModalVendaAberto(false);
      }

      const produtoOperacao =
        dados.produtos.find(
          (produto) => produto.codigo === formularioProcedimentoPreco.codigo,
        ) ??
        dados.produtos.find(
          (produto) => produto.codigo === codigoConsultaFornecedor,
        ) ??
        dados.produtos[0];

      if (produtoOperacao) {
        setCodigoConsultaFornecedor(produtoOperacao.codigo);
        setFormularioProcedimentoPreco((formularioAtual) => ({
          codigo: produtoOperacao.codigo,
          novoPreco:
            formularioAtual.codigo === produtoOperacao.codigo &&
            formularioAtual.novoPreco !== ""
              ? formularioAtual.novoPreco
              : String(produtoOperacao.preco),
        }));
      }

      const relatorios = await carregarRelatorios(undefined, filtrosRelatorios);
      setConsultaAtendentesVendas(relatorios.consultaAtendentesVendas);
      setConsultaClientesPorNome(relatorios.consultaClientesPorNome);
      setConsultaProdutosNome(relatorios.consultaProdutosNome);
      setConsultaProdutosSemVenda(relatorios.consultaProdutosSemVenda);
      setConsultaMelhorPrazoFornecedor(
        relatorios.consultaMelhorPrazoFornecedor,
      );
      setViewVendasDetalhadas(relatorios.viewVendasDetalhadas);
      setViewEstoqueCritico(relatorios.viewEstoqueCritico);
      setViewProdutosMaisVendidos(relatorios.viewProdutosMaisVendidos);
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setAtualizando(false);
      setCarregandoRelatorios(false);
    }
  }

  async function atualizarRelatorios() {
    setCarregandoRelatorios(true);

    try {
      const relatorios = await carregarRelatorios(undefined, filtrosRelatorios);
      setConsultaAtendentesVendas(relatorios.consultaAtendentesVendas);
      setConsultaClientesPorNome(relatorios.consultaClientesPorNome);
      setConsultaProdutosNome(relatorios.consultaProdutosNome);
      setConsultaProdutosSemVenda(relatorios.consultaProdutosSemVenda);
      setConsultaMelhorPrazoFornecedor(
        relatorios.consultaMelhorPrazoFornecedor,
      );
      setViewVendasDetalhadas(relatorios.viewVendasDetalhadas);
      setViewEstoqueCritico(relatorios.viewEstoqueCritico);
      setViewProdutosMaisVendidos(relatorios.viewProdutosMaisVendidos);
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
      throw erro;
    } finally {
      setCarregandoRelatorios(false);
    }
  }

  function atualizarCampoProduto(evento) {
    const { name, value } = evento.target;
    setFormularioProduto((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function atualizarCampoCliente(evento) {
    const { name, value } = evento.target;
    setFormularioCliente((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function atualizarCampoFornecedor(evento) {
    const { name, value } = evento.target;
    setFormularioFornecedor((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function atualizarCampoVenda(evento) {
    const { name, value } = evento.target;
    setFormularioVenda((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function atualizarCampoProcedimentoPreco(evento) {
    const { name, value } = evento.target;
    setFormularioProcedimentoPreco((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }));
  }

  function atualizarFiltroRelatorio(evento) {
    const { name, value } = evento.target;
    setFiltrosRelatorios((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: value,
    }));
  }

  async function salvarProduto(evento) {
    evento.preventDefault();
    setSalvandoProduto(true);

    const dadosProduto = {
      ...formularioProduto,
      preco: Number(formularioProduto.preco),
    };

    try {
      if (codigoProdutoEmEdicao) {
        await atualizarProduto(codigoProdutoEmEdicao, dadosProduto);
        setAviso({
          tipo: "success",
          mensagem: "Produto atualizado com sucesso.",
        });
      } else {
        await criarProduto(dadosProduto);
        setAviso({ tipo: "success", mensagem: "Produto criado com sucesso." });
      }

      await atualizarDados({ limparProduto: true });
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setSalvandoProduto(false);
    }
  }

  async function salvarCliente(evento) {
    evento.preventDefault();
    setSalvandoCliente(true);

    const dadosCliente = { ...formularioCliente };

    try {
      if (cpfClienteEmEdicao) {
        await atualizarCliente(cpfClienteEmEdicao, dadosCliente);
        setAviso({
          tipo: "success",
          mensagem: "Cliente atualizado com sucesso.",
        });
      } else {
        await criarCliente(dadosCliente);
        setAviso({ tipo: "success", mensagem: "Cliente criado com sucesso." });
      }

      await atualizarDados({ limparCliente: true });
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setSalvandoCliente(false);
    }
  }

  async function salvarFornecedor(evento) {
    evento.preventDefault();
    setSalvandoFornecedor(true);

    const dadosFornecedor = { ...formularioFornecedor };

    try {
      if (cnpjFornecedorEmEdicao) {
        await atualizarFornecedor(cnpjFornecedorEmEdicao, dadosFornecedor);
        setAviso({
          tipo: "success",
          mensagem: "Fornecedor atualizado com sucesso.",
        });
      } else {
        await criarFornecedor(dadosFornecedor);
        setAviso({
          tipo: "success",
          mensagem: "Fornecedor criado com sucesso.",
        });
      }

      await atualizarDados({ limparFornecedor: true });
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setSalvandoFornecedor(false);
    }
  }

  async function salvarVenda(evento) {
    evento.preventDefault();
    setSalvandoVenda(true);

    const dadosVenda = {
      ...formularioVenda,
      numero: Number(formularioVenda.numero),
      valorTotal: Number(formularioVenda.valorTotal),
      dataHora: normalizarDataHora(formularioVenda.dataHora),
    };

    try {
      if (numeroVendaEmEdicao) {
        await atualizarVenda(numeroVendaEmEdicao, dadosVenda);
        setAviso({
          tipo: "success",
          mensagem: "Venda atualizada com sucesso.",
        });
      } else {
        await criarVenda(dadosVenda);
        setAviso({ tipo: "success", mensagem: "Venda criada com sucesso." });
      }

      await atualizarDados({ limparVenda: true });
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setSalvandoVenda(false);
    }
  }

  function removerProduto(codigo) {
    const produto = produtos.find((item) => item.codigo === codigo);
    setConfirmacaoExclusao({
      tipo: "produto",
      id: codigo,
      titulo: "Excluir produto",
      mensagem: `Deseja excluir ${produto?.nome ?? `o produto ${codigo}`}? Esta ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir produto",
    });
  }

  function removerCliente(cpf) {
    const cliente = clientes.find((item) => item.cpf === cpf);
    setConfirmacaoExclusao({
      tipo: "cliente",
      id: cpf,
      titulo: "Excluir cliente",
      mensagem: `Deseja excluir ${cliente?.nome ?? `o cliente ${cpf}`}? Esta ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir cliente",
    });
  }

  function removerFornecedor(cnpj) {
    const fornecedor = fornecedores.find((item) => item.cnpj === cnpj);
    setConfirmacaoExclusao({
      tipo: "fornecedor",
      id: cnpj,
      titulo: "Excluir fornecedor",
      mensagem: `Deseja excluir ${fornecedor?.nome ?? `o fornecedor ${cnpj}`}? Esta ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir fornecedor",
    });
  }

  function removerVenda(numero) {
    setConfirmacaoExclusao({
      tipo: "venda",
      id: numero,
      titulo: "Excluir venda",
      mensagem: `Deseja excluir a venda ${numero}? Esta ação não pode ser desfeita.`,
      rotuloConfirmar: "Excluir venda",
    });
  }

  async function confirmarExclusao() {
    if (!confirmacaoExclusao) {
      return;
    }

    setExcluindo(true);

    try {
      if (confirmacaoExclusao.tipo === "produto") {
        await excluirProduto(confirmacaoExclusao.id);
        setAviso({
          tipo: "success",
          mensagem: "Produto excluido com sucesso.",
        });
        await atualizarDados({
          limparProduto: codigoProdutoEmEdicao === confirmacaoExclusao.id,
        });
      }

      if (confirmacaoExclusao.tipo === "cliente") {
        await excluirCliente(confirmacaoExclusao.id);
        setAviso({
          tipo: "success",
          mensagem: "Cliente excluido com sucesso.",
        });
        setAbaAtiva("clientes");
        await atualizarDados({
          limparCliente: cpfClienteEmEdicao === confirmacaoExclusao.id,
        });
      }

      if (confirmacaoExclusao.tipo === "fornecedor") {
        await excluirFornecedor(confirmacaoExclusao.id);
        setAviso({
          tipo: "success",
          mensagem: "Fornecedor excluido com sucesso.",
        });
        await atualizarDados({
          limparFornecedor: cnpjFornecedorEmEdicao === confirmacaoExclusao.id,
        });
      }

      if (confirmacaoExclusao.tipo === "venda") {
        await excluirVenda(confirmacaoExclusao.id);
        setAviso({ tipo: "success", mensagem: "Venda excluida com sucesso." });
        await atualizarDados({
          limparVenda: numeroVendaEmEdicao === confirmacaoExclusao.id,
        });
      }

      setConfirmacaoExclusao(null);
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setExcluindo(false);
    }
  }

  function iniciarEdicaoProduto(produto) {
    setAbaAtiva("produtos");
    setCodigoProdutoEmEdicao(produto.codigo);
    setFormularioProduto(produtoParaFormulario(produto));
    setModalProdutoAberto(true);
    setCodigoConsultaFornecedor(produto.codigo);
    setFormularioProcedimentoPreco({
      codigo: produto.codigo,
      novoPreco: String(produto.preco),
    });
    setAviso({
      tipo: "info",
      mensagem: `Edição ativa para o produto ${produto.codigo}.`,
    });
  }

  function iniciarEdicaoCliente(cliente) {
    setAbaAtiva("clientes");
    setCpfClienteEmEdicao(cliente.cpf);
    setFormularioCliente(clienteParaFormulario(cliente));
    setModalClienteAberto(true);
    setAviso({
      tipo: "info",
      mensagem: `Edição ativa para o cliente ${cliente.cpf}.`,
    });
  }

  function iniciarEdicaoFornecedor(fornecedor) {
    setAbaAtiva("fornecedores");
    setCnpjFornecedorEmEdicao(fornecedor.cnpj);
    setFormularioFornecedor(fornecedorParaFormulario(fornecedor));
    setModalFornecedorAberto(true);
    setAviso({
      tipo: "info",
      mensagem: `Edição ativa para o fornecedor ${fornecedor.cnpj}.`,
    });
  }

  function iniciarEdicaoVenda(venda) {
    setAbaAtiva("vendas");
    setNumeroVendaEmEdicao(venda.numero);
    setFormularioVenda(vendaParaFormulario(venda));
    setModalVendaAberto(true);
    setAviso({
      tipo: "info",
      mensagem: `Edição ativa para a venda ${venda.numero}.`,
    });
  }

  function limparEdicaoProduto() {
    setCodigoProdutoEmEdicao(null);
    setFormularioProduto(montarFormularioInicialProduto(produtos, categorias));
    setModalProdutoAberto(false);
  }

  async function consultarMelhorFornecedor(evento) {
    evento.preventDefault();

    if (!codigoConsultaFornecedor.trim()) {
      setAviso({
        tipo: "error",
        mensagem: "Informe o código do produto para consultar a função.",
      });
      return;
    }

    setConsultandoMelhorFornecedor(true);

    try {
      const fornecedor = await buscarMelhorFornecedorProduto(
        codigoConsultaFornecedor.trim(),
      );
      setMelhorFornecedorProduto(fornecedor);
      setAviso({ tipo: "success", mensagem: "Função executada com sucesso." });
    } catch (erro) {
      setMelhorFornecedorProduto(null);
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setConsultandoMelhorFornecedor(false);
    }
  }

  async function executarProcedimentoPreco(evento) {
    evento.preventDefault();

    if (!formularioProcedimentoPreco.codigo.trim()) {
      setAviso({
        tipo: "error",
        mensagem: "Informe o código do produto para executar o procedimento.",
      });
      return;
    }

    setExecutandoProcedimentoPreco(true);

    try {
      await atualizarPrecoProdutoProcedimento(
        formularioProcedimentoPreco.codigo.trim(),
        Number(formularioProcedimentoPreco.novoPreco),
      );
      await atualizarDados();
      setAviso({
        tipo: "success",
        mensagem:
          "Procedimento executado com sucesso e log de preço atualizado.",
      });
    } catch (erro) {
      setAviso({ tipo: "error", mensagem: erro.message });
    } finally {
      setExecutandoProcedimentoPreco(false);
    }
  }

  async function executarConsultaAtendentesVendas(evento) {
    evento.preventDefault();
    await atualizarRelatorios();
    setAviso({
      tipo: "success",
      mensagem: "Consulta de atendentes atualizada.",
    });
  }

  async function executarConsultaClientesPorNome(evento) {
    evento.preventDefault();
    await atualizarRelatorios();
    setAviso({ tipo: "success", mensagem: "Histórico do cliente atualizado." });
  }

  async function executarConsultaProdutosNome(evento) {
    evento.preventDefault();
    await atualizarRelatorios();
    setAviso({ tipo: "success", mensagem: "Busca de produtos atualizada." });
  }

  function limparEdicaoCliente() {
    setCpfClienteEmEdicao(null);
    setFormularioCliente(montarFormularioInicialCliente());
    setModalClienteAberto(false);
  }

  function limparEdicaoFornecedor() {
    setCnpjFornecedorEmEdicao(null);
    setFormularioFornecedor(montarFormularioInicialFornecedor());
    setModalFornecedorAberto(false);
  }

  function limparEdicaoVenda() {
    setNumeroVendaEmEdicao(null);
    setFormularioVenda(
      montarFormularioInicialVenda(vendas, clientes, atendentes),
    );
    setModalVendaAberto(false);
  }

  function abrirNovoProduto() {
    setAbaAtiva("produtos");
    setCodigoProdutoEmEdicao(null);
    setFormularioProduto(montarFormularioInicialProduto(produtos, categorias));
    setModalProdutoAberto(true);
  }

  function abrirNovoCliente() {
    setAbaAtiva("clientes");
    setCpfClienteEmEdicao(null);
    setFormularioCliente(montarFormularioInicialCliente());
    setModalClienteAberto(true);
  }

  function abrirNovoFornecedor() {
    setAbaAtiva("fornecedores");
    setCnpjFornecedorEmEdicao(null);
    setFormularioFornecedor(montarFormularioInicialFornecedor());
    setModalFornecedorAberto(true);
  }

  function abrirNovaVenda() {
    setAbaAtiva("vendas");
    setNumeroVendaEmEdicao(null);
    setFormularioVenda(
      montarFormularioInicialVenda(vendas, clientes, atendentes),
    );
    setModalVendaAberto(true);
  }

  const statusCabecalho = carregando
    ? "Carregando dados"
    : atualizando
      ? "Atualizando dados"
      : "Base pronta";
  const mensagemTabelaProdutos = carregando
    ? "Carregando produtos..."
    : "Nenhum produto corresponde à busca atual.";
  const mensagemTabelaClientes = carregando
    ? "Carregando clientes..."
    : "Nenhum cliente corresponde à busca atual.";
  const mensagemTabelaFornecedores = carregando
    ? "Carregando fornecedores..."
    : "Nenhum fornecedor corresponde à busca atual.";
  const mensagemTabelaVendas = carregando
    ? "Carregando vendas..."
    : "Nenhuma venda corresponde à busca atual.";
  const contextoTela = {
    dashboard: {
      titulo: "Dashboard",
      kicker: "Painel principal",
      subtitulo:
        "Acompanhe os totais principais da loja e um recorte visual das vendas já registradas no banco.",
    },
    clientes: {
      titulo: "Clientes",
      kicker: "Cadastros",
      subtitulo:
        "Cadastre, consulte e atualize os clientes usados nas vendas da loja.",
    },
    fornecedores: {
      titulo: "Fornecedores",
      kicker: "Cadastros",
      subtitulo:
        "Gerencie os fornecedores cadastrados e mantenha a base comercial organizada.",
    },
    produtos: {
      titulo: "Produtos",
      kicker: "Catálogo",
      subtitulo:
        "Controle o catálogo da loja e acompanhe consultas e operações complementares dos produtos.",
    },
    vendas: {
      titulo: "Vendas",
      kicker: "Operação diária",
      subtitulo:
        "Registre, consulte e atualize as vendas realizadas no banco de dados.",
    },
    relatorios: {
      titulo: "Relatórios",
      kicker: "Views consolidadas",
      subtitulo:
        "Visualize apenas os dados consolidados da base para apoiar a leitura geral do sistema.",
    },
  }[abaAtiva];

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <main className="app-shell">
        <ModalConfirmacao
          aberto={Boolean(confirmacaoExclusao)}
          titulo={confirmacaoExclusao?.titulo}
          mensagem={confirmacaoExclusao?.mensagem}
          rotuloConfirmar={confirmacaoExclusao?.rotuloConfirmar}
          processando={excluindo}
          aoCancelar={() => setConfirmacaoExclusao(null)}
          aoConfirmar={confirmarExclusao}
        />
        <div className="app-body">
          <aside className="sidebar-nav" aria-label="Modulos principais">
            <h2 className="sidebar-nav__title">
              Loja de Materiais de Construção
            </h2>
            <div className="sidebar-nav__content">
              <nav
                className="sidebar-nav__list"
                role="tablist"
                aria-orientation="vertical"
              >
                {ABAS.map((aba) => (
                  <Fragment key={aba.id}>
                    {aba.separadoAnterior ? (
                      <hr className="sidebar-separator" />
                    ) : null}
                    <button
                      id={`tab-${aba.id}`}
                      type="button"
                      role="tab"
                      className={`sidebar-button${abaAtiva === aba.id ? " sidebar-button--active" : ""}`}
                      aria-selected={abaAtiva === aba.id}
                      aria-controls={`panel-${aba.id}`}
                      onClick={() => setAbaAtiva(aba.id)}
                    >
                      {aba.label}
                    </button>
                  </Fragment>
                ))}
              </nav>
            </div>
          </aside>

          <div className="content-shell">
            <header className="page-header">
              <div>
                <p className="page-kicker">{contextoTela.kicker}</p>
                <h1 className="page-title">{contextoTela.titulo}</h1>
                <p className="page-subtitle">{contextoTela.subtitulo}</p>
              </div>
              {abaAtiva === "dashboard" && (
                <div className="page-header__actions">
                  <span className="page-status">{statusCabecalho}</span>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => atualizarDados()}
                    disabled={atualizando}
                  >
                    {atualizando ? "Atualizando..." : "Atualizar painel"}
                  </button>
                </div>
              )}
            </header>

            <AvisoStatus aviso={aviso} aoFechar={() => setAviso(null)} />

            <section className="workspace" id="conteudo-principal">
              {abaAtiva === "dashboard" ? (
                <SecaoDashboard
                  clientes={clientes}
                  vendas={vendas}
                  viewVendasDetalhadas={viewVendasDetalhadas}
                />
              ) : abaAtiva === "clientes" ? (
                <SecaoClientes
                  carregando={carregando}
                  carregandoRelatorios={carregandoRelatorios}
                  clientesFiltrados={clientes}
                  consultaClientesPorNome={consultaClientesPorNome}
                  cpfClienteEmEdicao={cpfClienteEmEdicao}
                  filtrosRelatorios={filtrosRelatorios}
                  formularioCliente={formularioCliente}
                  modalClienteAberto={modalClienteAberto}
                  mensagemTabelaClientes={mensagemTabelaClientes}
                  salvandoCliente={salvandoCliente}
                  aoAbrirNovoCliente={abrirNovoCliente}
                  aoAtualizarFiltroRelatorio={atualizarFiltroRelatorio}
                  aoEditarCliente={iniciarEdicaoCliente}
                  aoExecutarConsultaClientesPorNome={
                    executarConsultaClientesPorNome
                  }
                  aoExcluirCliente={removerCliente}
                  aoLimparCliente={limparEdicaoCliente}
                  aoMudarCampoCliente={atualizarCampoCliente}
                  aoSalvarCliente={salvarCliente}
                />
              ) : abaAtiva === "fornecedores" ? (
                <SecaoFornecedores
                  carregando={carregando}
                  carregandoRelatorios={carregandoRelatorios}
                  cnpjFornecedorEmEdicao={cnpjFornecedorEmEdicao}
                  consultaMelhorPrazoFornecedor={consultaMelhorPrazoFornecedor}
                  formularioFornecedor={formularioFornecedor}
                  fornecedoresFiltrados={fornecedores}
                  modalFornecedorAberto={modalFornecedorAberto}
                  mensagemTabelaFornecedores={mensagemTabelaFornecedores}
                  salvandoFornecedor={salvandoFornecedor}
                  aoAbrirNovoFornecedor={abrirNovoFornecedor}
                  aoEditarFornecedor={iniciarEdicaoFornecedor}
                  aoExcluirFornecedor={removerFornecedor}
                  aoLimparFornecedor={limparEdicaoFornecedor}
                  aoMudarCampoFornecedor={atualizarCampoFornecedor}
                  aoSalvarFornecedor={salvarFornecedor}
                />
              ) : abaAtiva === "produtos" ? (
                <SecaoProdutos
                  categorias={categorias}
                  codigoProdutoEmEdicao={codigoProdutoEmEdicao}
                  formularioProduto={formularioProduto}
                  modalProdutoAberto={modalProdutoAberto}
                  carregandoRelatorios={carregandoRelatorios}
                  codigoConsultaFornecedor={codigoConsultaFornecedor}
                  consultaProdutosNome={consultaProdutosNome}
                  consultaProdutosSemVenda={consultaProdutosSemVenda}
                  consultandoMelhorFornecedor={consultandoMelhorFornecedor}
                  executandoProcedimentoPreco={executandoProcedimentoPreco}
                  filtrosRelatorios={filtrosRelatorios}
                  formularioProcedimentoPreco={formularioProcedimentoPreco}
                  logsAlteracaoPreco={logsAlteracaoPreco}
                  melhorFornecedorProduto={melhorFornecedorProduto}
                  produtosFiltrados={produtos}
                  carregando={carregando}
                  salvandoProduto={salvandoProduto}
                  mensagemTabelaProdutos={mensagemTabelaProdutos}
                  aoAbrirNovoProduto={abrirNovoProduto}
                  aoAtualizarFiltroRelatorio={atualizarFiltroRelatorio}
                  aoBuscarMelhorFornecedor={consultarMelhorFornecedor}
                  aoExcluirProduto={removerProduto}
                  aoEditarProduto={iniciarEdicaoProduto}
                  aoExecutarConsultaProdutosNome={executarConsultaProdutosNome}
                  aoExecutarProcedimentoPreco={executarProcedimentoPreco}
                  aoMudarCampoProcedimentoPreco={
                    atualizarCampoProcedimentoPreco
                  }
                  aoMudarCodigoConsultaFornecedor={(evento) =>
                    setCodigoConsultaFornecedor(evento.target.value)
                  }
                  aoMudarCampoProduto={atualizarCampoProduto}
                  aoSalvarProduto={salvarProduto}
                  aoLimparProduto={limparEdicaoProduto}
                />
              ) : abaAtiva === "vendas" ? (
                <SecaoVendas
                  atendentes={atendentes}
                  clientes={clientes}
                  numeroVendaEmEdicao={numeroVendaEmEdicao}
                  formularioVenda={formularioVenda}
                  vendasFiltradas={vendas}
                  carregando={carregando}
                  modalVendaAberto={modalVendaAberto}
                  salvandoVenda={salvandoVenda}
                  mensagemTabelaVendas={mensagemTabelaVendas}
                  aoAbrirNovaVenda={abrirNovaVenda}
                  aoExcluirVenda={removerVenda}
                  aoEditarVenda={iniciarEdicaoVenda}
                  aoLimparVenda={limparEdicaoVenda}
                  aoMudarCampoVenda={atualizarCampoVenda}
                  aoSalvarVenda={salvarVenda}
                />
              ) : (
                <SecaoRelatorios
                  carregandoRelatorios={carregandoRelatorios}
                  consultaAtendentesVendas={consultaAtendentesVendas}
                  filtrosRelatorios={filtrosRelatorios}
                  aoAtualizarFiltroRelatorio={atualizarFiltroRelatorio}
                  aoExecutarConsultaAtendentesVendas={
                    executarConsultaAtendentesVendas
                  }
                  viewVendasDetalhadas={viewVendasDetalhadas}
                  viewEstoqueCritico={viewEstoqueCritico}
                  viewProdutosMaisVendidos={viewProdutosMaisVendidos}
                />
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default Aplicacao;
