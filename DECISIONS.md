# DECISIONS.md: decisões do projeto

Written for: agentes de IA e desenvolvedores que mexem neste projeto. Cada entrada registra o que foi decidido, o motivo e quem decidiu.

Formato: data, decisão, motivo.

## 2026-10 a 2026-11 (histórico recente)

### Gerador 3D embutido por iframe, sem reescrever em React
- **Decisão:** a tela "Conhecendo um gerador" carrega `public/genset.html` num iframe.
- **Motivo:** o arquivo é standalone, com Three.js e um kit 3D próprio. Portar para React exigiria reescrever tudo. O iframe mantém o arquivo do usuário intacto.
- **Quem:** usuário, após sugestão.

### Modo só-3D com `?only3d`, não `?embed`
- **Decisão:** o modo que mostra só o gerador usa o parâmetro `only3d`.
- **Motivo:** o kit 3D do próprio arquivo lê `embed` e esconde os botões de interação. Usar `embed` escondia os botões.
- **Quem:** resolvido em conjunto ao notar que os botões sumiram.

### Service worker ignora `only3d`
- **Decisão:** `ignoreURLParametersMatching` do Workbox inclui `/^only3d$/`.
- **Motivo:** sem isso, o iframe recebia o `index.html` e mostrava a Home duplicada dentro do gerador. O bug só aparecia com o service worker ativo, ou seja, no executável e em navegadores que já visitaram o site.
- **Quem:** correção feita após o usuário relatar o problema no executável.

### Som do motor removido
- **Decisão:** o áudio sintetizado (Web Audio) foi removido, com botões de partida e mudo.
- **Motivo:** o usuário achou o som ruim em três tentativas de ajuste. Ele pediu para remover.
- **Quem:** usuário.

### "Simular falha" removido
- **Decisão:** o botão de falha e a sequência de quebra do modo automático foram removidos.
- **Motivo:** pedido do usuário.
- **Quem:** usuário.

### Botão único "Pausar" / "Dar partida"
- **Decisão:** um botão só. "Pausar" usa `lab.paused` do kit, que congela o gerador inteiro. "Dar partida" retoma.
- **Motivo:** os dois primeiros botões faziam coisas parecidas. O usuário pediu para unificar. A primeira versão só desligava o motor, e o usuário pediu para congelar tudo.
- **Quem:** usuário.

### Ícone de raio (`Zap`) no tile e no cabeçalho do gerador
- **Decisão:** usar o ícone `Zap` da lucide-react.
- **Motivo:** o ícone de gerador desenhado à mão foi considerado ruim. Ícones de energia dão um visual mais limpo. O usuário escolheu.
- **Quem:** usuário.

### Responsividade por breakpoints do Tailwind, sem layouts separados
- **Decisão:** cada componente usa classes `sm:`, `md:` e `lg:`. A TV em paisagem mantém o layout original.
- **Motivo:** o totem continua sendo a prioridade, e o app precisa abrir em celular e tablet também.
- **Quem:** usuário pediu, e a abordagem foi escolhida por nós.

### Grade de 2 colunas em telas menores que 768 px na galeria de Projetos
- **Decisão:** `useIsNarrow` (768 px) troca a grade de fotos para 2 colunas com rolagem.
- **Motivo:** com as colunas calculadas para TV, as fotos ficavam pequenas demais no celular.

### Fluxo de Git: branch, depois fast-forward para `main`
- **Decisão:** mudanças grandes vão para uma branch, que depois é mesclada no `main` com fast-forward e enviada ao GitHub.
- **Motivo:** o `main` foi preservado como histórico linear. O usuário pediu o push e a mesclagem.
- **Quem:** usuário pediu para mesclar.

### Deploy no servidor por `git merge --ff-only` e `docker compose up -d --build`
- **Decisão:** o servidor atualiza pelo próprio repositório git, e a imagem anterior é guardada com tag `rollback-<commit>`.
- **Motivo:** permite voltar rápido se algo der errado. O repositório do servidor estava limpo, sem alterações locais.
- **Quem:** usuário autorizou o deploy.

### Executável Linux (AppImage) como entrega desktop
- **Decisão:** `electron-builder --linux AppImage` gera o executável. Windows fica pendente.
- **Motivo:** o build para Windows exige Wine ou uma máquina Windows, que não estão disponíveis neste ambiente.

### `dist/` antigo preservado em `dist-antigo-root/`
- **Decisão:** a pasta `dist/` com arquivos de outro dono foi renomeada, em vez de apagada.
- **Motivo:** os arquivos pertencem a root (de um build via Docker) e não podem ser removidos sem `sudo`. A pasta antiga fica sem rastreio no git, e pode ser apagada com `sudo rm -rf dist-antigo-root`.

## Decisões em aberto

- Build do executável para Windows.
- Porta 80 do servidor apontando para o touchwall (hoje ela só serve a página padrão do nginx).
- Variáveis `VITE_*` do `.env.example` não são usadas em `src/`. Remover ou implementar.
- `README.md` ainda é o template padrão do Vite.
