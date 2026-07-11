# Ajuste 42 — Refino do heatmap, redução da planta e limpeza do login

Data: 2026-07-11

## Alterações aplicadas

1. **Tela de login**
   - Removido o valor inicial `"admin"` do campo de usuário.
   - O formulário agora abre com o campo de usuário vazio.

2. **Mapa / planta**
   - Reduzido o tamanho visual da planta no dashboard para abrir mais respiro lateral.
   - Ajustada também a altura do bloco principal da planta para um enquadramento mais compacto.

3. **Heatmap**
   - Aumentada a suavidade das bordas das áreas térmicas.
   - Reforçada a intensidade do gradiente nas zonas.
   - Adicionada uma camada ambiente suave para integrar melhor o heatmap com a textura da planta.
   - Mantidos os 6 sensores instalados e a nova planta do cliente.

## Arquivo afetado

- `src/routes/index.tsx`
