# Ajuste 31 — Heatmap final sem lacunas internas

Correções aplicadas sobre o ajuste 30:

- Zona S10 expandida para a esquerda para eliminar a lacuna ao lado do polígono roxo superior.
- Zona S9 expandida para cima para eliminar a lacuna entre o polígono azul inferior e o polígono vermelho inferior.
- Mantidas as posições calibradas dos balões/sensores.
- Mantida a renderização final sem bordas visíveis entre zonas.
- Heatmap continua baseado em polígonos fixos por área S1–S15, não por proximidade radial.

Arquivo principal alterado:

- `src/routes/index.tsx`
