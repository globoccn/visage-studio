# Ajuste 26 — Relatório Diário PDF

- O botão da aba Relatórios agora chama `POST ${VITE_N8N_BASE_URL}/fleury-report-daily-pdf`.
- A resposta é lida com `arrayBuffer()` e validada pelo cabeçalho `%PDF-` antes do download.
- Este endpoint versionado evita colisão com workflows antigos que ainda possam responder HTML em `/fleury-report-daily`.
- Para usar outro endpoint, defina `VITE_N8N_DAILY_REPORT_PATH`.
