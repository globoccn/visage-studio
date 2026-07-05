# Ajuste 35 — Heatmap V3 Visual

Base: `fleury_frontend_ajuste_34_heatmap_v2_visual`.

Escopo aplicado:

- Não altera posições dos balões/sensores.
- Não altera polígonos S1–S15.
- Não altera integrações, endpoints, lógica de dados ou regras de cálculo.
- Altera apenas a renderização visual do heatmap.

Mudanças visuais:

1. Camada térmica contínua baseada nos pontos dos sensores, com blur maior para reduzir aparência de blocos.
2. Polígonos mantidos como zonas de cor, mas com opacidade menor para não parecerem áreas chapadas.
3. Blend ajustado entre heatmap e textura do piso.
4. Gradiente interno suavizado por zona.
5. Luz difusa reduzida para preservar paredes, móveis e profundidade.
6. Planta com leve aumento de contraste, saturação e brilho.

Arquivos alterados:

- `src/routes/index.tsx`

Observação: a aplicação não foi compilada localmente porque o ZIP enviado não contém `node_modules`; a alteração foi feita diretamente no código fonte.
