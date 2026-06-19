import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Exibe um modal simples para formularios de criacao e edicao.
export function ModalFormulario({ aberto, titulo, descricao, aoFechar, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    const focoInicial =
      modalRef.current?.querySelector(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])',
      ) ?? modalRef.current?.querySelector('button:not([disabled])');
    focoInicial?.focus();

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function tratarTecla(evento) {
      if (evento.key === 'Escape') {
        aoFechar();
      }
    }

    window.addEventListener('keydown', tratarTecla);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener('keydown', tratarTecla);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  if (!aberto) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={aoFechar}>
      <section
        ref={modalRef}
        className="modal-sheet modal-sheet--form"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="modal-sheet__header">
          <div>
            <h2 className="modal-sheet__title">{titulo}</h2>
            {descricao ? <p className="modal-sheet__description">{descricao}</p> : null}
          </div>
          <button
            type="button"
            className="button button--ghost"
            onClick={aoFechar}
            aria-label="Fechar formulário"
          >
            Fechar
          </button>
        </header>
        <div className="modal-sheet__body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
