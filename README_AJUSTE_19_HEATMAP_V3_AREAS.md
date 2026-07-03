# Ajuste 19 — Heatmap V3 por áreas

## Objetivo
Transformar o heatmap de manchas sobrepostas em um mapa visual por áreas, mais adequado para apresentação ao cliente final.

## Alterações
- Novo motor visual de heatmap por zonas/áreas da planta.
- Sensores passam a influenciar áreas provisórias, não apenas círculos individuais.
- Núcleos locais dos sensores são desenhados por cima das zonas para preservar a leitura do sensor.
- Ajuste de potência visual: amarelo menos dominante e verde/ideal com maior presença.
- Mantidas as escalas aprovadas de temperatura, umidade e CO₂.
- CO₂ continua ocultando EM300-TH.

## Observação
As áreas e vínculos de sensores são provisórios para apresentação comercial. Quando o cliente confirmar a posição real dos sensores, basta ajustar `heatmapZones` e `sensorMapPositions`.
