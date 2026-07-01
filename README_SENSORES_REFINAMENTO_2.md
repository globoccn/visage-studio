# Refinamento aba Sensores

Alterações aplicadas:

- Removido cabeçalho superior da aba Sensores com busca e filtros.
- Removido bloco de exibição/ordenação.
- Card de bateria média removido.
- Adicionados cards de temperatura mínima e temperatura máxima registrada no dia.
- KPIs da aba Sensores preparados para usar leituras do dia.
- Mini gráficos dos cards preparados para usar registros das últimas 24h vindos do histórico/PostgreSQL.
- Cards mantidos com imagem AM103, métricas de temperatura, umidade, CO2 e bateria.

Observação: se a API de histórico ainda não responder, o frontend usa fallback mockado para manter a tela apresentável.
