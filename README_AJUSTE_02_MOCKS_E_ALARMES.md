# Ajuste 02 — Integração real n8n, mocks controlados e alarmes configuráveis

Este ajuste complementa o cadastro real dos 15 sensores feito no Ajuste 01.

## Alterações realizadas

1. O frontend deixou de usar dados mockados automaticamente em produção.
   - Quando o n8n falhar, a tela mostra um aviso de integração e mantém os cards vazios/sem dados falsos.
   - Mock só é usado se `VITE_ENABLE_MOCKS=true` estiver configurado explicitamente.

2. As chamadas reais foram mantidas nos endpoints:
   - `GET /webhook/fleury-dashboard-latest`
   - `GET /webhook/fleury-history`
   - `GET /webhook/fleury-settings`
   - `POST /webhook/fleury-settings`

3. Os alarmes agora são calculados com os limites configurados:
   - temperatura baixa/alta;
   - umidade baixa/alta;
   - CO₂ baixo/alto.

4. A tela de Alarmes deixou de usar apenas os limites fixos `21.5 °C` e `25 °C`.

5. A lista de alertas recentes deixou de exibir exemplos fictícios quando não há alarmes.

6. A saúde da rede deixou de mostrar bateria média fixa em `100%`.

7. Os gráficos e mini tendências deixaram de buscar histórico mockado automaticamente quando não houver dados do PostgreSQL.

## Próximo ajuste necessário nos workflows

O próximo passo é ajustar o workflow `fleury-dashboard-latest` para retornar os cards de Hoje a partir do Redis `latest`, pois o frontend já está preparado para consumir esse endpoint como fonte de tempo real.
