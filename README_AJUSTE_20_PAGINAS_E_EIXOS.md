# Ajuste 20 — Páginas operacionais e eixos

Alterações aplicadas:

- HOME
  - Corrigido o card lateral do sensor selecionado: os gráficos de tendência foram separados por métrica.
  - Temperatura, umidade e CO₂ agora usam escalas independentes, evitando eixo misturado.
  - Mantido EM300-TH sem exibição de CO₂.
  - Verificado que o motor Heatmap V3 por áreas usa a mesma lógica para temperatura, umidade e CO₂; na camada CO₂, sensores EM300-TH são ignorados.

- HISTÓRICO
  - Página repaginada com cards executivos, gráfico consolidado, gráficos por métrica e tabela de últimas leituras.

- ALARMES
  - Página repaginada com KPIs por métrica, fila operacional e painel de limites em vigor.
  - Removida regra de CO₂ baixo da lógica de alarmes.

- INSIGHTS
  - Página repaginada com cards executivos e recomendações operacionais.

- CONFIGURAÇÕES
  - Removido o campo CO₂ baixo da interface.
  - Payload de salvamento envia apenas temperatura baixa/alta, umidade baixa/alta e CO₂ alto.

Observação de validação:
- Foi feita validação estrutural do código.
- A instalação completa das dependências não foi concluída dentro do tempo disponível do ambiente, portanto o build local não pôde ser finalizado aqui.
