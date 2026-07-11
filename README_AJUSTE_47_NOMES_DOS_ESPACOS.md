# Ajuste 47 — Renomeação dos espaços dos sensores

Data: 2026-07-11

## Objetivo
Atualizar os nomes dos espaços dos 6 sensores e refletir essa alteração em todas as telas do dashboard.

## Mapeamento aplicado
- Sensor 02: `Área inferior esquerda` → `PREPARO - Passagem material`
- Sensor 01: `Área central inferior` → `PREPARO - Prox. a porta`
- Sensor 04: `Área superior esquerda` → `PREPARO - Coordenação`
- Sensor 15: `Mesa central` → `PREPARO - Bancada`
- Sensor 08: `Sala direita superior` → `ARSENAL - Superior`
- Sensor 03: `Sala direita inferior` → `ARSENAL - Inferior`

## Observação
Os nomes foram atualizados no cadastro base dos sensores, de modo que a mudança se propague para os componentes que consomem `area`, incluindo detalhes do sensor, listas, cards, insights e demais telas do dashboard.

## Arquivo afetado
- `src/routes/index.tsx`
