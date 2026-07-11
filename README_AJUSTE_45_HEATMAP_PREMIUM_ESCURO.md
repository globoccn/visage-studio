# Ajuste 45 — Heatmap mais escuro e premium

Data: 2026-07-11

## Objetivo
Refinar o heatmap para reduzir o aspecto claro/lavado e reforçar uma estética mais premium, mantendo as áreas dos sensores corretamente respeitadas.

## Alterações aplicadas

1. **Base da planta escurecida**
   - A planta recebeu um tratamento mais escuro e menos saturado.
   - Foi adicionada uma camada de sombreamento premium para criar profundidade.

2. **Heatmap menos lavado**
   - Reduzida a intensidade das camadas em `screen`.
   - Ajustados contraste e saturação do SVG do heatmap.

3. **Mais profundidade por zona**
   - Adicionada uma camada `multiply` por zona para dar corpo e profundidade cromática.
   - Mantidas as máscaras por área, sem vazamento entre sensores.

4. **Glow mais controlado**
   - O brilho de núcleo e a pulsação foram mantidos, mas agora com leitura mais sofisticada e menos “estourada”.

## Resultado esperado
- visual mais escuro;
- sensação mais premium;
- heatmap com mais contraste e profundidade;
- áreas dos sensores preservadas.

## Arquivos afetados
- `src/routes/index.tsx`
- `src/styles.css`
