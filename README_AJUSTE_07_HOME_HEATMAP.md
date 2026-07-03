# Ajuste 07 — Home, heatmap e painel lateral

Alterações aplicadas no frontend:

- Heatmap da home agora é calculado a partir dos valores reais dos sensores na camada selecionada.
- Badges dos sensores adicionados dentro da planta, mostrando valor atual da camada e métrica complementar.
- EM300-TH não exibe CO₂ nos badges, no painel lateral e na tela de sensores.
- Gráficos do painel lateral usam histórico real do sensor selecionado, sem tooltip genérico de amostra/valor estranho.
- Logo CCN reposicionado para fora do card de sensores online, maior e sem contorno próprio.
- Mantida atualização silenciosa dos dados a cada 5 minutos.
- `vite.config.ts` mantido sem alteração.

Validação realizada:

- Verificação textual dos trechos alterados em `src/routes/index.tsx`.
- Remoção de referências ao componente antigo `Pin`.
- Checagem para evitar duplicidade do estado `layer`.
- Projeto não foi compilado localmente porque o ZIP não contém `node_modules`/`vite` instalado no ambiente.
