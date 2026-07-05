# Ajuste 27 — Relatórios semanal e mensal

## Alterações

- A aba **Relatórios** agora permite gerar PDF para:
  - Relatório diário: `/fleury-report-daily-pdf`
  - Relatório semanal: `/fleury-report-weekly-pdf`
  - Relatório mensal: `/fleury-report-monthly-pdf`
- O texto do cabeçalho foi simplificado para: `Baixe o PDF da análise do período selecionado.`
- Os botões semanal e mensal deixaram de ficar como `Em breve`.
- A validação de PDF continua checando o cabeçalho `%PDF-` antes de baixar o arquivo.

## Variáveis opcionais

Caso queira sobrescrever os caminhos sem alterar código:

```env
VITE_N8N_DAILY_REPORT_PATH=fleury-report-daily-pdf
VITE_N8N_WEEKLY_REPORT_PATH=fleury-report-weekly-pdf
VITE_N8N_MONTHLY_REPORT_PATH=fleury-report-monthly-pdf
```
