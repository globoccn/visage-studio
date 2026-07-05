# Ajuste 33 — Heatmap definitivo com máscara de piso

Alterações aplicadas:

- Mantida a base da v31, considerada a mais estável.
- Recuados os polígonos que geravam as duas sobreposições visíveis:
  - junção vertical entre a área superior e a sala grande esquerda;
  - junção horizontal entre a área verde/azul e a área vermelha inferior direita.
- Adicionado `floor-plan-heatmap-mask.png` para limitar a coloração às áreas de piso/superfície útil da planta.
- A máscara reduz vazamento visual sobre paredes e divisórias sem alterar os balões.
- A intensidade do heatmap foi aumentada com mais opacidade e normalização visual menos lavada.
- As posições dos balões permanecem as posições calibradas do projeto atual.

Validação gerada em `/mnt/data/heatmap_v33_validacao_mascara.png` usando valores extremos/mistos para evidenciar encaixe dos polígonos.
