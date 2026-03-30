// Cria o bloco visual usado nas secoes principais da tela.
export function PainelSecao({ sobretitulo, titulo, descricao, acoes, children }) {
  return (
    <section className="panel-frame">
      <header className="panel-frame__header">
        <div>
          {sobretitulo ? <p className="panel-frame__eyebrow">{sobretitulo}</p> : null}
          <h2 className="panel-frame__title">{titulo}</h2>
          {descricao ? <p className="panel-frame__description">{descricao}</p> : null}
        </div>
        {acoes ? <div className="panel-frame__actions">{acoes}</div> : null}
      </header>
      {children}
    </section>
  );
}
