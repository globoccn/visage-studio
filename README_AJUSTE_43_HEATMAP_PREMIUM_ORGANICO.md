# Ajuste 43 — Heatmap premium orgânico e mais vivo

Data: 2026-07-11

## Objetivo
Refinar o heatmap do dashboard para um visual mais premium, orgânico e vivo, sem alterar o cadastro atual de 6 sensores nem a nova planta aprovada pelo cliente.

## Alterações aplicadas

1. **Camada térmica mais orgânica**
   - Cada sensor passou a gerar múltiplas contribuições visuais:
     - núcleo térmico principal;
     - aura de expansão;
     - ponte térmica em direção ao centro da zona;
     - halo secundário suave.
   - Isso reduz a sensação de manchas rígidas e melhora a leitura contínua do mapa.

2. **Ambiência térmica geral**
   - A ambiência do mapa agora usa duas camadas suaves, criando uma sensação mais integrada com a planta.

3. **Glow e bloom premium**
   - Foram reforçados blur, bloom e color-dodge em baixa intensidade para dar mais profundidade e riqueza visual.

4. **Animação sutil (“mais vivo”)**
   - Criadas animações leves de respiração, deriva e brilho do heatmap.
   - O movimento é discreto, pensado para dar vida sem distrair o operador.

5. **Preservações**
   - Mantidos os 6 sensores atuais.
   - Mantida a nova planta.
   - Mantida a lógica de CO₂ sem interpolar zonas EM300.
   - Mantido o restante do frontend corrigido.

## Arquivos afetados

- `src/routes/index.tsx`
- `src/styles.css`
