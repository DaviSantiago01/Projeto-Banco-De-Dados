export function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar = 'Confirmar',
  processando = false,
  aoCancelar,
  aoConfirmar,
}) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={aoCancelar}>
      <section
        className="modal-sheet modal-sheet--confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="modal-sheet__header">
          <div>
            <h2 className="modal-sheet__title">{titulo}</h2>
            <p className="modal-sheet__description">{mensagem}</p>
          </div>
        </header>
        <div className="modal-confirm__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={aoCancelar}
            disabled={processando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="button button--danger"
            onClick={aoConfirmar}
            disabled={processando}
          >
            {processando ? 'Excluindo...' : rotuloConfirmar}
          </button>
        </div>
      </section>
    </div>
  );
}
