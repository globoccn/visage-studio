# Ajuste 46 — Heatmap inspirado na prévia conceitual, preservando o zoneamento

Data: 2026-07-11

## Objetivo
Aproximar o heatmap visual do conceito aprovado nas prévias, mantendo o zoneamento real das áreas atendidas pelos sensores.

## Alterações aplicadas

1. **Heatmap mais próximo da prévia conceitual**
   - Gradientes principais ampliados e suavizados.
   - Núcleo térmico mais vivo.
   - Aura ampla por zona para leitura mais fluida.

2. **Visual premium mais equilibrado**
   - Mais saturação e contraste no SVG do heatmap.
   - Bloom mais rico, porém controlado.
   - Base da planta levemente mais visível para lembrar a prévia aprovada.

3. **Zoneamento preservado**
   - Todas as camadas visuais continuam mascaradas pelas áreas internas dos sensores.
   - Não há vazamento do heatmap para fora das zonas.

4. **Integração com a planta**
   - Redução do escurecimento excessivo da planta.
   - Overlay final refinado para melhorar profundidade sem “lavar” o mapa.

## Arquivos afetados
- `src/routes/index.tsx`
- `src/styles.css`
