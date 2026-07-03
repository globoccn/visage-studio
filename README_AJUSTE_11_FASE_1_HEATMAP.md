# Ajuste 11 — Fase 1 Heatmap profissional

Alterações aplicadas na Home/Dashboard:

- Planta reduzida e mantida horizontal, com melhor margem interna.
- Sensores redistribuídos de forma mais aberta sobre a planta.
- Marcadores substituídos por cards circulares/compactos com valor visível, sem depender de hover:
  - Temperatura: `23,4°`
  - Umidade: `58%`
  - CO₂: `762 ppm`
- Tooltip detalhado preservado no hover.
- EM300-TH não aparece na camada CO₂.
- Heatmap recalculado por escala específica de cada métrica.
- Heatmap com manchas radiais mais suaves, maior mistura entre sensores e menos filtro uniforme.
- Legendas atualizadas conforme escalas acordadas.

Escalas aplicadas:

## Temperatura
- `<21,0 °C`: azul escuro
- `21,0–22,9 °C`: azul
- `23,0–24,0 °C`: verde
- `24,1–24,9 °C`: amarelo
- `>=25,0 °C`: vermelho

## Umidade
- `<30%`: vermelho
- `30–39,9%`: laranja
- `40–60%`: verde
- `60,1–70%`: ciano
- `>70%`: azul

## CO₂
- `400–700 ppm`: verde
- `700–900 ppm`: verde claro
- `900–1000 ppm`: amarelo
- `1000–1200 ppm`: laranja
- `>1200 ppm`: vermelho

Validação estrutural:
- ZIP descompactado e componentes localizados.
- `src/routes/index.tsx` revisado após alterações.
- `vite.config.ts` preservado.

Observação:
- A instalação completa das dependências (`npm install`) excedeu o tempo disponível neste ambiente, então não foi possível executar `npm run build` localmente aqui.
