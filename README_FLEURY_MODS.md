# Alterações manuais - Fleury Supervisório Ambiental

Este ZIP foi ajustado manualmente a partir da versão Lovable.

## Home / Dashboard
- Botão de período configurado: Hoje, Semana, Mês.
- Atualização silenciosa dos dados a cada 5 minutos, sem reload visual da tela.
- Hoje: usa endpoint `/webhook/fleury-dashboard-latest` para estado atual e `/webhook/fleury-history` para gráficos.
- Semana/Mês: usa PostgreSQL via endpoint `/webhook/fleury-history`, inclusive para gráficos e médias do heatmap.
- Se API/n8n não responder, a tela usa mock fallback para continuar apresentável.

## Planta
- Mantida somente como “Modelo 3D Operacional”.
- Removidos controles visuais de 2D/3D, zoom +/-, ampliar.
- Camada ativa agora alterna entre Temperatura, Umidade e CO₂.
- Escala muda automaticamente conforme a camada.
- Heatmap visual muda conforme a camada selecionada.

## Abas adicionadas no frontend
- Planta Operacional
- Sensores
- Histórico
- Alarmes
- Insights
- Relatórios
- Saúde da Rede
- Configurações

## Integração esperada
Variável opcional:

```env
VITE_N8N_BASE_URL=https://ancar-n8n.gpfgqx.easypanel.host/webhook
```

Endpoints usados:
- GET `/fleury-dashboard-latest`
- GET `/fleury-history?period=24 hours&sensor=all&limit=5000`
- GET `/fleury-history?period=7 days&sensor=all&limit=5000`
- GET `/fleury-history?period=30 days&sensor=all&limit=5000`

## Próximos ajustes esperados
- Trocar devEUIs pendente01...pendente15 pelos reais.
- Ajustar coordenadas x/y dos sensores na planta real.
- Substituir imagem de planta por render/planta 3D final.
- Ajustar payload da API caso o n8n retorne nomes diferentes.

## Ajuste Home - insights e alarmes

- Card Insights Inteligentes agora mostra apenas um insight na Home, com link direto para a aba Insights.
- Sino de alertas no topo usa a contagem atual de alarmes ativos e navega para a aba Alarmes ao clicar.
- Removida a seta extra do seletor de período.
- Mantido vite.config.ts com allowedHosts fleury-bh.2see.io.
