# MEMORIES.md: memórias do projeto

Written for: agentes de IA que trabalham no projeto. Fatos que não se deduzem do código nem do git.

Escrito em 2026-11-12.

## Contexto do projeto

- O totem roda em uma TV touch num estande de feira da Essencial Energia. Não há teclado.
- O conteúdo da Home e das telas é em português. O usuário pede respostas em português.
- O usuário testa as mudanças no próprio navegador e no executável, e relata o que vê. Os bugs que ele achou (iframe duplicado, som ruim) vieram desses testes.
- O `genset.html` foi criado pelo usuário, com um kit 3D gerado por ferramenta externa. Ele é tratado como arquivo de origem: mexer só o necessário.

## Servidor de produção

- Host `72.60.251.247`, porta `8084` (container `touchwall-spa-touchwall-1`).
- Projeto em `/home/deploy/projetos/touchwall-spa`, com repositório git e `docker-compose.yml`.
- Acesso por SSH como `root`, com a chave `id_ed25519` da máquina do usuário. A chave `id_ed25519_hostinger` não funciona nesse host.
- A porta 80 desse servidor não serve o touchwall (só a página padrão do nginx). O site fica na 8084.
- O servidor também hospeda outros projetos (agenda, loja de carros, bots, etc.). Não mexer em nada além do touchwall.

## Estado do gerador

- O usuário pediu "Conhecendo um gerador" como botão da Home, com a animação 3D dentro.
- O som do motor foi testado várias vezes e o usuário achou ruim. Foi removido por decisão dele.
- "Simular falha" foi removido a pedido do usuário.
- "Pausar" congela tudo (motor e câmera). O usuário aprovou.

## Verificação

- Para conferir telas no ambiente, o Chrome headless funciona (`google-chrome --headless --screenshot`). O `dist` pode precisar de `?page=` temporário, que foi removido depois.
- Electron testado com um script de main process que clica no botão e tira `capturePage`.

## Relacionados

- [AGENTS.md](AGENTS.md) para especificações.
- [DECISIONS.md](DECISIONS.md) para decisões e motivos.
