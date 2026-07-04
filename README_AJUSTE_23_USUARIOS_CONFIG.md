# Ajuste 23 - Configurações e Usuários

Alterações aplicadas:

- Configurações em tela única, sem abas superiores.
- Removido card de Monitoramento ambiental.
- Adicionado bloco Usuários e acessos ao lado de Limites ambientais.
- Formulário de criação de usuário com:
  - nome completo;
  - usuário no padrão nome.sobrenome;
  - senha numérica;
  - seleção de perfil por botões, sem select nativo.
- Corrigida visibilidade da seleção de perfil.
- Tabela de usuários com nome, usuário, perfil, status, último acesso e ações.
- Integração com Workflow 07 v2.1:
  - GET /fleury-users;
  - POST /fleury-users;
  - POST /fleury-users-status.
- Botão de ativar/desativar usuário.
- Proteção para não desativar o próprio usuário logado.
- Login com dicas de usuário e senha.

Observação:
Edição de perfil e reset de senha ainda dependem de endpoints adicionais no Workflow 07.
