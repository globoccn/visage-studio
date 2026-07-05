# Ajuste 36 — Heatmap V3 clipado na planta

Base: ajuste 35.

Alteração restrita ao visual do heatmap em `src/routes/index.tsx`.

## O que foi ajustado
- Removida a camada térmica global em `div` que podia vazar para fora da planta.
- Adicionada máscara SVG composta pela união dos polígonos S1–S15.
- A camada térmica contínua agora é desenhada por gradientes radiais SVG recortados por essa máscara.
- Mantidos os polígonos e as posições dos sensores da versão estável.
- Mantido o visual mais natural do V3, com blend, gradiente interno e textura do piso.

## O que não foi alterado
- Coordenadas dos polígonos.
- Posição dos balões/sensores.
- Backend, endpoints, relatórios, regras de alarme e contratos de API.
