# Ajuste 28 — Heatmap por polígonos fixos de sensor

## Objetivo
Substituir o heatmap por gradientes/radiais por um overlay SVG de polígonos fixos S1–S15, seguindo a referência manual enviada pelo cliente.

## O que mudou
- Cada área atendida por sensor agora é um polígono fixo em percentual da planta.
- O preenchimento não usa borda/stroke visível.
- O overlay não usa mais raios de proximidade que vazavam para ambientes vizinhos.
- A cor da área é calculada pelo valor do sensor daquela zona.
- Para CO₂, os sensores EM300 continuam excluídos da camada, mantendo apenas sensores AM103L.

## Validação feita
Foi gerada uma simulação com valores extremos artificiais para forçar zonas quentes, frias e ideais. O objetivo foi verificar visualmente se as áreas não vazam para fora dos polígonos definidos.

Arquivos de validação gerados fora do projeto:
- heatmap_poligonos_validacao_extremos.png
- heatmap_poligonos_validacao_debug.png

## Arquivo alterado
- src/routes/index.tsx
