// Mostra avisos rapidos de sucesso, erro ou informacao.
export function AvisoStatus({ aviso, aoFechar }) {
  if (!aviso) {
    return null;
  }

  return (
    <section
      className={`status-banner status-banner--${aviso.tipo}`}
      aria-live="polite"
      role="status"
    >
      <p>{aviso.mensagem}</p>
      <button
        type="button"
        className="button button--ghost"
        onClick={aoFechar}
        aria-label="Dispensar aviso"
      >
        Fechar
      </button>
    </section>
  );
}
