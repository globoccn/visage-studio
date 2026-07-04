# Ajuste 21 — Menu, CO₂ e comunicação

Alterações aplicadas:

- Card superior **CO₂ médio**: texto alterado para `Limite operacional ≤ 1.000 ppm`.
- Card lateral do sensor: removida a exibição técnica `RSSI / SNR`.
- Card lateral do sensor: adicionada exibição amigável de **Comunicação** com status `Online`, `Atenção`, `Offline` ou `Sem leitura`, calculada pelo tempo desde a última leitura.
- Menu lateral: removida a tela **Planta Operacional**.
- Menu lateral: removida a tela **Saúde da Rede**.
- Renderização das views removidas do menu também foi desativada para evitar acesso duplicado.
- `vite.config.ts` preservado sem alterações.
