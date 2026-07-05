# Ajuste 24 - Relatório diário via workflow n8n

## Alteração aplicada

Na aba **Relatórios**, o botão **Gerar PDF** do relatório diário chama o endpoint:

```txt
${N8N_BASE}/fleury-report-daily
```

com método `POST`, `Content-Type: application/json` e `Accept: application/pdf`.

## Correção importante

O frontend agora lê a resposta como `arrayBuffer`, valida o cabeçalho `%PDF-` e só então cria um `Blob` com `type: application/pdf`.

Isso evita baixar HTML retornado pelo n8n/Gotenberg como se fosse PDF. Caso o workflow retorne HTML, JSON ou erro textual, a interface mostra uma mensagem com prévia da resposta em vez de salvar um arquivo inválido.

## Workflow esperado

O workflow deve responder o webhook com o binário `data` gerado pelo node Gotenberg e headers:

```txt
Content-Type: application/pdf
Content-Disposition: attachment; filename="...pdf"
```
