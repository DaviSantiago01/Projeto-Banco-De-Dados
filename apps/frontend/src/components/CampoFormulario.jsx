// Padroniza o rotulo, a ajuda e o campo de cada formulario.
export function CampoFormulario({ htmlFor, rotulo, ajuda, children }) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={htmlFor}>
        {rotulo}
      </label>
      {children}
      {ajuda ? (
        <p className="form-field__hint" id={`${htmlFor}-hint`}>
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}
