# Ajuste 08 — Planta Fleury real com heatmap

Alterações aplicadas no frontend:

- Substituída a imagem base do mapa pela planta 3D enviada (`fleury top.png`).
- A planta foi recortada e rotacionada para uso horizontal no card principal da home.
- Criado asset `src/assets/floor-plan-fleury-top.png`.
- O heatmap agora é aplicado sobre a área da planta usando máscara da própria imagem, evitando pintar o fundo transparente.
- Mantida a lógica de valores reais por camada:
  - Temperatura: todos os sensores.
  - Umidade: todos os sensores.
  - CO₂: somente AM103L.
- Adicionadas posições provisórias dos 15 sensores no frontend, distribuídas pela planta até o cliente validar as posições reais.
- Os badges continuam clicáveis e atualizam o card lateral do sensor.

Validação realizada:

- Conferido import do novo asset.
- Conferido uso de `mapPosition()` no heatmap e nos badges.
- Conferido balanceamento básico de parênteses/chaves/colchetes do arquivo `src/routes/index.tsx`.
- Tentativa de `tsc --noEmit`: o ambiente não possui `node_modules`/tipos do Vite instalados, então a validação completa de build não pôde ser executada localmente.

Observação:

As coordenadas dos sensores são provisórias e devem ser refinadas depois que o cliente informar a localização física de cada sensor.
