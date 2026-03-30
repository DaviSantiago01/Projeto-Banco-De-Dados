import { useEffect, useState } from 'react';
import { SecaoProdutos } from './components/SecaoProdutos';
import { SecaoVendas } from './components/SecaoVendas';
import { AvisoStatus } from './components/AvisoStatus';
import {
  atualizarProduto,
  atualizarVenda,
  buscarAtendentes,
  buscarCategorias,
  buscarClientes,
  buscarProdutos,
  buscarVendas,
  criarProduto,
  criarVenda,
  excluirProduto,
  excluirVenda,
} from './lib/clienteBackend';
import './App.css';

// Reune o estado principal da tela e coordena os modulos de produtos e vendas.
const ABAS = [
  { id: 'produtos', label: 'Produtos' },
  { id: 'vendas', label: 'Vendas' },
];

// Gera o proximo codigo seguindo o padrao PROD001, PROD002 e assim por diante.
function montarProximoCodigoProduto(produtos) {
  const maiorCodigo = produtos.reduce((maiorAtual, produto) => {
    const sufixo = produto.codigo?.match(/(\d+)$/)?.[1];
    return sufixo ? Math.max(maiorAtual, Number(sufixo)) : maiorAtual;
  }, 30);

  return `PROD${String(maiorCodigo + 1).padStart(3, '0')}`;
}

// Monta o formulario inicial para deixar a tela pronta assim que os dados carregam.
function montarFormularioInicialProduto(produtos, categorias) {
  return {
    codigo: montarProximoCodigoProduto(produtos),
    nome: '',
    preco: '',
    descricao: '',
    unidadeMedida: 'UN',
    codCategoria: categorias[0]?.codigo ?? '',
  };
}

function montarFormularioInicialVenda(vendas, clientes = [], atendentes = []) {
  const proximoNumero = vendas.reduce(
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
    valorTotal: '',
    formaPagamento: 'PIX',
    cpfCliente: clientes[0]?.cpf ?? '',
    matAtendente: atendentes[0]?.matricula ?? '',
  };
}

function produtoParaFormulario(produto) {
  return {
    codigo: produto.codigo,
    nome: produto.nome,
    preco: String(produto.preco),
    descricao: produto.descricao ?? '',
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

function normalizarDataHora(valor) {
  return valor.length === 16 ? `${valor}:00` : valor;
}

// Reaproveita a mesma carga no primeiro acesso e no botao de atualizar.
async function carregarTodosOsDados(signal) {
  const [clientes, atendentes, categorias, produtos, vendas] = await Promise.all([
    buscarClientes(signal),
    buscarAtendentes(signal),
    buscarCategorias(signal),
    buscarProdutos(signal),
    buscarVendas(signal),
  ]);

  return { clientes, atendentes, categorias, produtos, vendas };
}

function Aplicacao() {
  const [abaAtiva, setAbaAtiva] = useState('produtos');
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [atendentes, setAtendentes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [formularioProduto, setFormularioProduto] = useState(
    montarFormularioInicialProduto([], []),
  );
  const [formularioVenda, setFormularioVenda] = useState(montarFormularioInicialVenda([]));
  const [buscaProduto, setBuscaProduto] = useState('');
  const [buscaVenda, setBuscaVenda] = useState('');
  const [codigoProdutoEmEdicao, setCodigoProdutoEmEdicao] = useState(null);
  const [numeroVendaEmEdicao, setNumeroVendaEmEdicao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [salvandoVenda, setSalvandoVenda] = useState(false);
  const [aviso, setAviso] = useState(null);

  const buscaProdutoNormalizada = buscaProduto.trim().toLowerCase();
  const buscaVendaNormalizada = buscaVenda.trim().toLowerCase();

  const produtosFiltrados = produtos.filter((produto) => {
    if (!buscaProdutoNormalizada) {
      return true;
    }

    return [
      produto.codigo,
      produto.nome,
      produto.unidadeMedida,
      produto.categoriaNome,
    ].some((valor) => valor?.toLowerCase().includes(buscaProdutoNormalizada));
  });

  const vendasFiltradas = vendas.filter((venda) => {
    if (!buscaVendaNormalizada) {
      return true;
    }

    return [
      String(venda.numero),
      venda.clienteNome,
      venda.cpfCliente,
      venda.atendenteNome,
      venda.formaPagamento,
    ].some((valor) => valor?.toLowerCase().includes(buscaVendaNormalizada));
  });

  useEffect(() => {
    const controleAbortar = new AbortController();

    async function carregarDadosIniciais() {
      setCarregando(true);

      try {
        const dados = await carregarTodosOsDados(controleAbortar.signal);

        setClientes(dados.clientes);
        setAtendentes(dados.atendentes);
        setCategorias(dados.categorias);
        setProdutos(dados.produtos);
        setVendas(dados.vendas);
        setFormularioProduto(montarFormularioInicialProduto(dados.produtos, dados.categorias));
        setFormularioVenda(
          montarFormularioInicialVenda(dados.vendas, dados.clientes, dados.atendentes),
        );
      } catch (erro) {
        if (erro.name !== 'AbortError') {
          setAviso({ tipo: 'error', mensagem: erro.message });
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosIniciais();

    return () => controleAbortar.abort();
  }, []);

  // Atualiza as listas e, se preciso, limpa a edicao ativa para voltar ao formulario inicial.
  async function atualizarDados({ limparProduto = false, limparVenda = false } = {}) {
    setAtualizando(true);

    try {
      const dados = await carregarTodosOsDados();

      setClientes(dados.clientes);
      setAtendentes(dados.atendentes);
      setCategorias(dados.categorias);
      setProdutos(dados.produtos);
      setVendas(dados.vendas);

      if (limparProduto) {
        setCodigoProdutoEmEdicao(null);
        setFormularioProduto(montarFormularioInicialProduto(dados.produtos, dados.categorias));
      }

      if (limparVenda) {
        setNumeroVendaEmEdicao(null);
        setFormularioVenda(
          montarFormularioInicialVenda(dados.vendas, dados.clientes, dados.atendentes),
        );
      }
    } catch (erro) {
      setAviso({ tipo: 'error', mensagem: erro.message });
    } finally {
      setAtualizando(false);
    }
  }

  function atualizarCampoProduto(evento) {
    const { name, value } = evento.target;
    setFormularioProduto((formularioAtual) => ({ ...formularioAtual, [name]: value }));
  }

  function atualizarCampoVenda(evento) {
    const { name, value } = evento.target;
    setFormularioVenda((formularioAtual) => ({ ...formularioAtual, [name]: value }));
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
        setAviso({ tipo: 'success', mensagem: 'Produto atualizado com sucesso.' });
      } else {
        await criarProduto(dadosProduto);
        setAviso({ tipo: 'success', mensagem: 'Produto criado com sucesso.' });
      }

      await atualizarDados({ limparProduto: true });
    } catch (erro) {
      setAviso({ tipo: 'error', mensagem: erro.message });
    } finally {
      setSalvandoProduto(false);
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
        setAviso({ tipo: 'success', mensagem: 'Venda atualizada com sucesso.' });
      } else {
        await criarVenda(dadosVenda);
        setAviso({ tipo: 'success', mensagem: 'Venda criada com sucesso.' });
      }

      await atualizarDados({ limparVenda: true });
    } catch (erro) {
      setAviso({ tipo: 'error', mensagem: erro.message });
    } finally {
      setSalvandoVenda(false);
    }
  }

  async function removerProduto(codigo) {
    if (!window.confirm(`Deseja excluir o produto ${codigo}?`)) {
      return;
    }

    try {
      await excluirProduto(codigo);
      setAviso({ tipo: 'success', mensagem: 'Produto excluido com sucesso.' });
      await atualizarDados({ limparProduto: codigoProdutoEmEdicao === codigo });
    } catch (erro) {
      setAviso({ tipo: 'error', mensagem: erro.message });
    }
  }

  async function removerVenda(numero) {
    if (!window.confirm(`Deseja excluir a venda ${numero}?`)) {
      return;
    }

    try {
      await excluirVenda(numero);
      setAviso({ tipo: 'success', mensagem: 'Venda excluida com sucesso.' });
      await atualizarDados({ limparVenda: numeroVendaEmEdicao === numero });
    } catch (erro) {
      setAviso({ tipo: 'error', mensagem: erro.message });
    }
  }

  function iniciarEdicaoProduto(produto) {
    setAbaAtiva('produtos');
    setCodigoProdutoEmEdicao(produto.codigo);
    setFormularioProduto(produtoParaFormulario(produto));
    setAviso({ tipo: 'info', mensagem: `Edicao ativa para o produto ${produto.codigo}.` });
  }

  function iniciarEdicaoVenda(venda) {
    setAbaAtiva('vendas');
    setNumeroVendaEmEdicao(venda.numero);
    setFormularioVenda(vendaParaFormulario(venda));
    setAviso({ tipo: 'info', mensagem: `Edicao ativa para a venda ${venda.numero}.` });
  }

  function limparEdicaoProduto() {
    setCodigoProdutoEmEdicao(null);
    setFormularioProduto(montarFormularioInicialProduto(produtos, categorias));
  }

  function limparEdicaoVenda() {
    setNumeroVendaEmEdicao(null);
    setFormularioVenda(montarFormularioInicialVenda(vendas, clientes, atendentes));
  }

  const statusCabecalho = carregando
    ? 'Carregando dados'
    : atualizando
      ? 'Atualizando dados'
      : 'Base pronta';
  const mensagemTabelaProdutos = carregando
    ? 'Carregando produtos...'
    : 'Nenhum produto corresponde a busca atual.';
  const mensagemTabelaVendas = carregando
    ? 'Carregando vendas...'
    : 'Nenhuma venda corresponde a busca atual.';
  const destaquesCabecalho = [
    { rotulo: 'Categorias', valor: categorias.length },
    { rotulo: 'Produtos', valor: produtos.length },
    { rotulo: 'Vendas', valor: vendas.length },
  ];

  return (
    <>
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteudo
      </a>
      <main className="app-shell">
        <header className="page-header">
          <div>
            <p className="page-kicker">Loja de Materiais de Construcao</p>
            <h1 className="page-title">Painel da Loja</h1>
            <p className="page-subtitle">
              Esse sistema serve para gerenciar uma loja de materiais de construcao, com
              cadastro de produtos, consulta de categorias e controle das vendas
              realizadas no banco de dados.
            </p>
            <div className="page-highlights" aria-label="Resumo geral do sistema">
              {destaquesCabecalho.map((item) => (
                <div key={item.rotulo} className="page-highlight">
                  <span className="page-highlight__label">{item.rotulo}</span>
                  <strong className="page-highlight__value">{item.valor}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="page-actions">
            <span className="page-status">{statusCabecalho}</span>
            <button
              type="button"
              className="button button--primary"
              onClick={() => atualizarDados()}
              disabled={atualizando}
            >
              {atualizando ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </header>

        <div className="tabs" role="tablist" aria-label="Modulos principais">
          {ABAS.map((aba) => (
            <button
              key={aba.id}
              id={`tab-${aba.id}`}
              type="button"
              role="tab"
              className={`tab-button${abaAtiva === aba.id ? ' tab-button--active' : ''}`}
              aria-selected={abaAtiva === aba.id}
              aria-controls={`panel-${aba.id}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </button>
          ))}
        </div>

        <AvisoStatus aviso={aviso} aoFechar={() => setAviso(null)} />

        <section className="workspace" id="conteudo-principal">
          {abaAtiva === 'produtos' ? (
            <SecaoProdutos
              categorias={categorias}
              codigoProdutoEmEdicao={codigoProdutoEmEdicao}
              formularioProduto={formularioProduto}
              buscaProduto={buscaProduto}
              produtosFiltrados={produtosFiltrados}
              carregando={carregando}
              salvandoProduto={salvandoProduto}
              mensagemTabelaProdutos={mensagemTabelaProdutos}
              aoExcluirProduto={removerProduto}
              aoEditarProduto={iniciarEdicaoProduto}
              aoMudarCampoProduto={atualizarCampoProduto}
              aoMudarBuscaProduto={(evento) =>
                setBuscaProduto(evento.target.value)
              }
              aoSalvarProduto={salvarProduto}
              aoLimparProduto={limparEdicaoProduto}
            />
          ) : (
            <SecaoVendas
              atendentes={atendentes}
              clientes={clientes}
              numeroVendaEmEdicao={numeroVendaEmEdicao}
              formularioVenda={formularioVenda}
              buscaVenda={buscaVenda}
              vendasFiltradas={vendasFiltradas}
              carregando={carregando}
              salvandoVenda={salvandoVenda}
              mensagemTabelaVendas={mensagemTabelaVendas}
              aoExcluirVenda={removerVenda}
              aoEditarVenda={iniciarEdicaoVenda}
              aoLimparVenda={limparEdicaoVenda}
              aoMudarCampoVenda={atualizarCampoVenda}
              aoMudarBuscaVenda={(evento) =>
                setBuscaVenda(evento.target.value)
              }
              aoSalvarVenda={salvarVenda}
            />
          )}
        </section>
      </main>
    </>
  );
}

export default Aplicacao;
