# Ajuste 06 — Frontend cliente

Alterações aplicadas:

- Atualização silenciosa dos dados a cada 5 minutos.
- Dashboard hoje mantém indicadores atuais vindos da API de dados atuais.
- Históricos continuam independentes e atualizam no mesmo ciclo sem recarregar a tela.
- Adicionado logo da CCN no card lateral de sensores online.
- Removido texto "15 previstos" do card lateral.
- Removidas menções visíveis a n8n, Redis, PostgreSQL, endpoint e gateway.
- Card de CO₂ médio agora mostra faixa ideal conforme limites configurados.
- Sensores EM300-TH não exibem CO₂ no painel lateral nem na tela de sensores.
- Tela de sensores usa imagem específica para EM300-TH e imagem específica para AM103L.
- Mantido vite.config.ts exatamente conforme configuração acordada.

Validações realizadas:

- Assets novos copiados para src/assets.
- Código TypeScript/TSX parseado pelo compilador disponível no ambiente; dependências não estavam instaladas no sandbox, portanto não foi possível executar build completo local.
- Busca textual confirmou que menções técnicas não aparecem mais em textos de interface.
