# Ajuste 44 — Heatmap premium respeitando as áreas dos sensores

Data: 2026-07-11

## Problema identificado
A versão premium anterior deixou o heatmap mais bonito e vivo, porém parte da ambiência térmica foi aplicada como camada global sobre a planta. Isso fazia o efeito visual ultrapassar as áreas de atendimento dos sensores.

## Correção aplicada
O heatmap foi reestruturado para que **todo o efeito visual fique contido nas zonas internas** da planta:

- glow ambiente por zona;
- campo térmico principal por zona;
- preenchimento suave interno por zona;
- brilho de núcleo por zona.

Todas essas camadas agora usam **máscaras baseadas nos polígonos das áreas dos sensores**, evitando vazamento visual entre setores.

## Resultado
- mantém o visual premium;
- mantém o aspecto mais orgânico e vivo;
- respeita as delimitações internas da planta;
- preserva os 6 sensores e a nova planta.

## Arquivos afetados
- `src/routes/index.tsx`
- `src/styles.css`
