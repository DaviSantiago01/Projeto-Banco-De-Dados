import { CampoFormulario } from './CampoFormulario';
import { ModalFormulario } from './ModalFormulario';
import { PainelSecao } from './PainelSecao';
import { formatarDataHora, formatarMoeda } from '../lib/formatadores';

// Exibe o formulario e a lista usados no CRUD de vendas.
const OPCOES_PAGAMENTO = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO'];

export function SecaoVendas({
  atendentes,
  clientes,
  numeroVendaEmEdicao,
  vendasFiltradas,
  carregando,
  modalVendaAberto,
  salvandoVenda,
  aoAbrirNovaVenda,
  aoExcluirVenda,
  aoEditarVenda,
  aoLimparVenda,
  aoMudarCampoVenda,
  aoSalvarVenda,
  formularioVenda,
  mensagemTabelaVendas,
}) {
  return (
    <div id="panel-vendas" role="tabpanel" aria-labelledby="tab-vendas" className="panel-stack">
      <ModalFormulario
        aberto={modalVendaAberto}
        titulo={numeroVendaEmEdicao ? 'Editar venda' : 'Nova venda'}
        descricao="Registre a venda com data, forma de pagamento, cliente e atendente."
        aoFechar={aoLimparVenda}
      >
        <form className="editor-form" onSubmit={aoSalvarVenda}>
          <div className="editor-form__grid">
            <CampoFormulario htmlFor="venda-numero" rotulo="Número">
              <input
                id="venda-numero"
                name="numero"
                className="input"
                type="number"
                min="1"
                inputMode="numeric"
                value={formularioVenda.numero}
                onChange={aoMudarCampoVenda}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="venda-data" rotulo="Data e hora">
              <input
                id="venda-data"
                name="dataHora"
                className="input"
                type="datetime-local"
                value={formularioVenda.dataHora}
                onChange={aoMudarCampoVenda}
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="venda-valor" rotulo="Valor total">
              <input
                id="venda-valor"
                name="valorTotal"
                className="input"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={formularioVenda.valorTotal}
                onChange={aoMudarCampoVenda}
                autoComplete="off"
                required
              />
            </CampoFormulario>
            <CampoFormulario htmlFor="venda-pagamento" rotulo="Pagamento">
              <select
                id="venda-pagamento"
                name="formaPagamento"
                className="input"
                value={formularioVenda.formaPagamento}
                onChange={aoMudarCampoVenda}
              >
                {OPCOES_PAGAMENTO.map((opcao) => (
                  <option key={opcao} value={opcao}>
                    {opcao.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </CampoFormulario>
            <CampoFormulario
              htmlFor="venda-cliente"
              rotulo="Cliente / CPF"
              ajuda="Selecione um cliente cadastrado."
            >
              <select
                id="venda-cliente"
                name="cpfCliente"
                className="input"
                value={formularioVenda.cpfCliente}
                onChange={aoMudarCampoVenda}
                required
              >
                <option value="">Selecione</option>
                {clientes.map((cliente) => (
                  <option key={cliente.cpf} value={cliente.cpf}>
                    Cliente: {cliente.nome} | CPF: {cliente.cpf}
                  </option>
                ))}
              </select>
            </CampoFormulario>
            <CampoFormulario
              htmlFor="venda-atendente"
              rotulo="Atendente / Matrícula"
              ajuda="Selecione um atendente cadastrado."
            >
              <select
                id="venda-atendente"
                name="matAtendente"
                className="input"
                value={formularioVenda.matAtendente}
                onChange={aoMudarCampoVenda}
                required
              >
                <option value="">Selecione</option>
                {atendentes.map((atendente) => (
                  <option key={atendente.matricula} value={atendente.matricula}>
                    Atendente: {atendente.nome} | Matrícula: {atendente.matricula}
                  </option>
                ))}
              </select>
            </CampoFormulario>
          </div>
          <div className="editor-form__actions">
            <button type="submit" className="button button--primary" disabled={salvandoVenda}>
              {salvandoVenda
                ? 'Salvando...'
                : numeroVendaEmEdicao
                  ? 'Atualizar venda'
                  : 'Criar venda'}
            </button>
            <button type="button" className="button button--secondary" onClick={aoLimparVenda}>
              Limpar
            </button>
          </div>
        </form>
      </ModalFormulario>

      <div className="view-block">
      <PainelSecao
        titulo="Lista de vendas"
        descricao="Acompanhe o histórico de vendas e gerencie os registros diretamente pela lista."
        acoes={
          <div className="panel-actions panel-actions--end">
            <button type="button" className="button button--primary" onClick={aoAbrirNovaVenda}>
              Nova venda
            </button>
          </div>
        }
      >
        <div className="table-wrap">
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Lista de vendas cadastradas</caption>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Atendente</th>
                  <th>Pagamento</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendasFiltradas.map((venda) => (
                  <tr key={venda.numero}>
                    <td>{venda.numero}</td>
                    <td>
                      <strong>{venda.clienteNome}</strong>
                      <span className="table-note">{venda.cpfCliente}</span>
                    </td>
                    <td>
                      <strong>{venda.atendenteNome}</strong>
                      <span className="table-note">{venda.matAtendente}</span>
                    </td>
                    <td>{venda.formaPagamento.replace('_', ' ')}</td>
                    <td>{formatarDataHora(venda.dataHora)}</td>
                    <td>{formatarMoeda(venda.valorTotal)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button button--secondary"
                          onClick={() => aoEditarVenda(venda)}
                          aria-label={`Editar venda ${venda.numero}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="button button--danger"
                          onClick={() => aoExcluirVenda(venda.numero)}
                          aria-label={`Excluir venda ${venda.numero}`}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!vendasFiltradas.length ? (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      {carregando ? 'Carregando vendas...' : mensagemTabelaVendas}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </PainelSecao>
      </div>
    </div>
  );
}
