# Ajuste 37 — Heatmap V4 Orgânico

Base: ajuste 36.

Alterado apenas o visual da camada térmica no Dashboard.

Mantido sem alteração:
- posições dos sensores;
- polígonos S1–S15;
- lógica de dados;
- endpoints;
- layout geral.

Mudanças:
- renderer V4 com camada térmica contínua clipada pela máscara dos polígonos existentes;
- paleta térmica mais limpa para evitar roxo excessivo em temperaturas frias próximas de 21 °C;
- gradiente por sensor mais suave e orgânico;
- gradiente por zona menos evidente, usado só como referência visual;
- leve textura/noise SVG para remover aspecto de bloco chapado;
- blend ajustado para preservar mais textura do piso;
- vazamento externo controlado via `clipPath`.
