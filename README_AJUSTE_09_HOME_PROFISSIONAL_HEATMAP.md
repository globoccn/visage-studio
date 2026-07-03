# Ajuste 09 — Home profissional e heatmap limpo

Alterações aplicadas no frontend:

- Mantida a planta real 3D como base da home.
- Ajustada a visualização da planta para ocupar melhor o card, com zoom interno controlado.
- Removidos os badges grandes dos sensores sobre a planta.
- Substituídos por marcadores pequenos com glow e tooltip no hover.
- Heatmap suavizado e refinado com manchas radiais por sensor, reduzindo o aspecto de filtro uniforme.
- Escala de cor ajustada para evidenciar melhor pequenas variações sem perder a coerência dos limites.
- Mantido CO₂ indisponível para EM300-TH.
- Mantida atualização silenciosa de dados sem reload visual da tela.
- A imagem da planta já possui transparência e foi mantida sem fundo adicional no frontend.

Validação realizada:

- Conferência manual do componente principal da home.
- Conferência do JSX/TSX alterado.
- Tentativa de build local não pôde ser concluída porque o ambiente não possui Bun disponível e a instalação via npm não completou dentro do tempo disponível.
- O arquivo `vite.config.ts` foi mantido inalterado.
