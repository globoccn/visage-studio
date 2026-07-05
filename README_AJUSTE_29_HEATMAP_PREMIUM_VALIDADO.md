# Ajuste 29 — Heatmap premium clipado e validado

Base usada: última versão enviada pelo usuário (`fleury_frontend_sensores_s3_s4_corrigidos(3).zip`).

## O que foi alterado

Arquivo principal:

- `src/routes/index.tsx`

Arquivo de estilo:

- `src/styles.css`

## Alterações aplicadas

1. O heatmap global por círculos/radiais livres foi removido da renderização principal da planta.
   - Antes, os radiais podiam vazar para fora da área atendida, atravessando paredes/corredores.
   - Agora, a renderização visual principal do heatmap usa apenas as áreas `heatmapAreas`.

2. Cada área S1...S15 ganhou renderização própria por SVG:
   - `clipPath` por polígono;
   - `radialGradient` interno por área;
   - preenchimento base suave;
   - hotspot a partir da posição real do sensor;
   - feather/falloff até a borda do polígono;
   - borda interna discreta para efeito premium.

3. A mesma lógica é aplicada aos três layers:
   - temperatura;
   - umidade;
   - CO₂.

4. A regra de CO₂ foi preservada:
   - sensores EM300 continuam sem pin visível no layer CO₂;
   - quando uma área atendida por EM300 precisa de cor no CO₂, o valor visual usa o AM103L válido mais próximo, mantendo o mapa preenchido sem quebrar o contrato dos sensores.

5. As posições dos sensores não foram alteradas.
   - O objeto `sensorMapPositions` foi preservado conforme a última versão validada.

6. Foi adicionada animação sutil no CSS:
   - classe `.premium-heatmap-breathe`;
   - respiração visual lenta, discreta e profissional.

## Validação feita

- O arquivo `src/routes/index.tsx` foi parseado/transpilado via TypeScript `transpileModule` sem diagnósticos de sintaxe.
- Foi verificado que a camada principal agora usa SVG com `clipPath` por área.
- Foi verificado que os radiais globais livres não são mais usados na renderização principal do mapa.
- O ajuste não altera `sensorMapPositions`, nem a imagem da planta, nem o contrato dos dados.

