# Ajuste 34 — Heatmap V2 Visual

Base: `fleury_frontend_ajuste_31_heatmap_final_sem_lacunas`.

Escopo deste ajuste:
- Não altera posições dos sensores.
- Não altera polígonos S1–S15.
- Não altera endpoints, dados, regras, limites ou backend.
- Ajusta somente a renderização visual do heatmap.

Alterações aplicadas:
- Paleta de calor mais viva e saturada.
- Opacidade normalizada para reduzir aspecto lavado.
- Gradiente radial interno por zona para reduzir aparência de bloco chapado.
- Camadas com blend `multiply`, `soft-light` e `screen` para misturar melhor a cor com a textura da planta.
- Brilho ambiente global mais sutil e saturado.
- Transição visual mantida suave.

Arquivos alterados:
- `src/routes/index.tsx`
