# AGENTS.md: especificações do touchwall-spa

Written for: agentes de IA e desenvolvedores que mexem neste projeto.

## O que é

Totem interativo da **Essencial Energia** para uma TV touch de estande. Roda em tela cheia, sem teclado, com toque como única entrada. Volta para a Home depois de 90 s sem interação. O conteúdo é estático, empacotado no build. Não há backend nem API.

A interface é toda em **português (pt-BR)**: textos, nomes de botões e comentários no código.

## Stack

- React 19 + TypeScript (`~6.0`) + Vite 8, com alias `@` apontando para `src/`
- Tailwind CSS 4 (`@tailwindcss/vite`) e Framer Motion para transições
- react-leaflet / Leaflet para o mapa, d3-geo para projeções do globo e do mapa do Brasil
- lucide-react para ícones
- `vite-plugin-pwa`: service worker com precache de tudo, para funcionar offline depois do primeiro carregamento
- Electron 33 (`electron/main.cjs`): abre o build em kiosk, com um servidor estático local (`electron/static-server.cjs`). Atalho `Ctrl+Shift+Q` para sair
- Docker (Node 22 para o build, nginx para servir), `docker-compose.yml` na raiz

## Comandos

```bash
npm run dev            # Vite em http://localhost:5173
npm run build          # tsc -b && vite build -> dist/
npm run lint           # oxlint
npm run electron:start # build + abre no Electron
npm run electron:build # build + electron-builder (AppImage e Windows)
```

Checagem antes de commitar: `npx tsc -b && npx oxlint`.

## Estrutura

- `src/App.tsx`: roteamento por estado (sem router). `Page` em `src/types/index.ts` define as telas
- `src/components/`: telas e componentes (`MainMenu`, `BrazilMap`, `RotatingGlobe`, `Projetos`, `NossaOperacao`, `FaleConosco`, `ConhecendoGerador`, ...)
- `src/layouts/`: `MenuLayout`, `ServiceLayout`, `MapLayout`
- `src/hooks/`: `useInactivityReset` (90 s, dispara voltar para a Home), `useBlockPageZoom`
- `src/config/`: animações e textos de cases (`project-cases.ts`)
- `public/data/`: `clients-locations.json` (489 clientes geocodificados), `projetos-fotos.json`, contornos do Brasil e pontos do globo
- `public/assets/`: imagens, logos, fotos de projetos (com miniaturas em `thumbs/`)
- `public/genset.html`: gerador 3D interativo, arquivo standalone com Three.js embutido (~1,3 MB). Ver seção abaixo
- `scripts/`: utilitários offline (otimização de imagens, geocodificação de clientes, ícones). Não fazem parte do build
- `electron/`: processo principal e servidor estático do app desktop
- `vite.config.ts`: PWA e configuração do Workbox

## Telas (Page)

| Page | Tela | Observações |
|---|---|---|
| `menu` | Home | 5 tiles: Onde Estamos, Nossa Operação, Conhecendo um gerador, Projetos, Fale Conosco |
| `onde-estamos` | Mapa de clientes | Globo girando como intro; toque leva ao mapa do Brasil com pinos |
| `nossa-operacao` | COE | Duas fotos, visualizador em tela cheia |
| `conhecendo-gerador` | Gerador 3D | Iframe de `/genset.html?only3d` |
| `projetos` | Galeria | Pastas Data Center (18 fotos) e Outros Projetos (26). Modo Slider. Case detalhado do Data Center |
| `fale-conosco` | Contato | Telefone, site e QR Code do WhatsApp |

## Regras de comportamento (totem)

- Toque é a entrada principal. Não depender de hover nem de teclado.
- Zoom da página bloqueado (`useBlockPageZoom`). Mapa e visualizador têm zoom próprio por pointer events.
- Qualquer `pointerdown`, `touchstart` ou `keydown` reinicia o contador de inatividade. Eventos dentro do iframe do gerador são repassados para a janela (`ConhecendoGerador.tsx`).
- Trocar de página desmonta a página anterior, o que fecha modais e lightboxes.

## Responsividade

- Breakpoints do Tailwind: `sm` 640, `md` 768, `lg` 1024.
- Layouts usam altura dinâmica (`h-dvh`) e rolagem vertical em telas pequenas (`overflow-y-auto`). Em TV (landscape), o layout é o original.
- Home: grade de 2 colunas abaixo de `lg`, com o último tile ocupando as duas colunas.
- Projetos: em telas menores que 768 px (`useIsNarrow`), a grade de fotos usa 2 colunas com rolagem.
- O globo ajusta o tamanho à janela sozinho (`RotatingGlobe`). O mapa é SVG com `viewBox`.

## O gerador 3D (`public/genset.html`)

- Arquivo de origem do usuário, com o kit 3D embutido. Mudanças nele devem ser cirúrgicas.
- Modo só-3D: `?only3d`. Esconde o menu e as seções de baixo. Não usar `?embed`: o kit 3D lê esse parâmetro e esconde os botões de interação.
- Botão único "Pausar" / "Dar partida" usa `lab.paused`, que congela o gerador inteiro.
- O som do motor foi removido por decisão do usuário. Não reintroduzir sem pedido.
- "Simular falha" foi removido por decisão do usuário.

## Service worker

- O iframe do gerador abre `/genset.html?only3d`. `vite.config.ts` tem `ignoreURLParametersMatching` com `only3d`. Sem isso, o service worker devolve o `index.html` dentro do iframe.
- Qualquer parâmetro de URL novo que apareça em um iframe precisa entrar nessa lista.

## Deploy

**Web (servidor):** `72.60.251.247`, porta `8084`. Projeto em `/home/deploy/projetos/touchwall-spa` (repositório git próprio). Atualizar com `git merge --ff-only origin/main` e `docker compose up -d --build touchwall`. Antes, guardar a imagem atual com tag `touchwall-spa-touchwall:rollback-<commit>`.

**Desktop (Linux):** `npm run electron:build` gera `release/TouchWall Essencial Energia-0.0.0.AppImage`.

**Windows:** o `.exe` precisa de Wine ou de uma máquina Windows. Os `.exe` em `release/` são antigos.

## Armadilhas conhecidas

- `ELECTRON_RUN_AS_NODE=1` no ambiente faz o Electron rodar como Node puro e fechar na hora. Use `env -u ELECTRON_RUN_AS_NODE`.
- `dist/` pode ter arquivos de outro dono (Docker). `rm -rf` falha sem `sudo`. Renomear a pasta funciona.
- `README.md` ainda é o template padrão do Vite.
- Variáveis `VITE_*` em `.env.example` não são lidas em `src/`.
- O `.env` não vai para o git. Não commitar segredos.

## Git

- Branch principal: `main`. Usar branch de feature para mudanças maiores e fazer fast-forward para o `main`.
- Mensagens de commit em português, no imperativo ou no presente (ex.: "Adiciona ...", "Corrige ...").
- Arquivos de cache (`scripts/*-cache.json`) ficam fora do commit.
