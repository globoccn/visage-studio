# Ajuste 14 — rotação da planta

Alterações aplicadas:

- Planta do heatmap rotacionada em -15 graus.
- Transformação aplicada no grupo da planta, mantendo imagem, heatmap e marcadores alinhados.
- Adicionado recorte inferior (`clip-path`) no container da planta para ocultar a linha branca que fazia parte do asset/base visual.
- Mantido o tamanho geral definido no Ajuste 13.
- Mantidas as escalas, cores e intensidade do heatmap.
- `vite.config.ts` preservado sem alterações.

Validação executada:

- Conferência estrutural do JSX alterado.
- Conferência de imports/assets existentes.
- Tentativa de instalação/build realizada, mas o ambiente excedeu o tempo disponível durante `npm install`; por isso não foi possível concluir build local neste ambiente.
