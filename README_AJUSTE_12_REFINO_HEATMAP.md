# Ajuste 12 — Refinamento do heatmap

Alterações aplicadas na Home:

- Planta reduzida de 88% para 78% da área útil do card.
- Limite máximo visual reduzido para melhorar o enquadramento.
- Planta mantida horizontal e centralizada.
- Heatmap intensificado com maior opacidade, saturação e contraste.
- Raio das manchas aumentado para formar áreas contínuas, menos circulares.
- Blur aumentado para deixar o gradiente mais próximo de um heatmap profissional.
- Mantidos os marcadores com valor visível e as escalas definidas para temperatura, umidade e CO₂.

Validação:

- JSON/estrutura do projeto preservados.
- `vite.config.ts` mantido sem alterações.
- `tsc` foi executado para validação sintática do TSX. A validação acusou apenas dependências ausentes no ambiente (`react`, `vite/client`, aliases `@/`) e um aviso já existente de tipagem em outro componente; não houve erro sintático na alteração realizada.
