// Objeto único consumido pelo Renderer e pelo Engine.
// Seu conteúdo é substituído quando o operador escolhe outro cenário.
export const ActiveScenario = {};

export function loadActiveScenario(source) {
  const clone =
    typeof structuredClone === 'function'
      ? structuredClone(source)
      : JSON.parse(JSON.stringify(source));

  Object.keys(ActiveScenario).forEach((key) => {
    delete ActiveScenario[key];
  });

  Object.assign(ActiveScenario, clone);

  return ActiveScenario;
}
