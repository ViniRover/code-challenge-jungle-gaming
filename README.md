# Kurio — NFT Marketplace

Implementação do desafio frontend Jungle Gaming, com descoberta, compra e conta do colecionador nas versões desktop/mobile. Integrações de conta, carteiras, pagamento e blockchain são simuladas conforme o [enunciado](docs/CHALLENGE.md).

- Aplicação: https://code-challenge-jungle-gaming.vercel.app
- Repositório: https://github.com/ViniRover/code-challenge-jungle-gaming
- [Arquitetura](ARCHITECTURE.md) · [Contratos](docs/API.md) · [Validação](docs/VALIDATION.md)

## Docker Compose

Requer Docker Desktop/Engine iniciado e Compose v2. Não precisa de Node no host.

```bash
git clone https://github.com/ViniRover/code-challenge-jungle-gaming.git
cd code-challenge-jungle-gaming
docker compose up --build -d
# http://localhost:4173
docker compose ps
docker compose logs -f marketplace
docker compose down
```

Imagem multi-stage Node 22 Alpine, usuário sem privilégios, healthcheck e servidor com gzip/fallback SPA. Os dados persistem no navegador, não no container. Desenvolvimento com hot reload:

```bash
docker compose --profile dev up --build dev
# http://localhost:5173
```

## Node

Node 22.12+ e npm; lockfile versionado.

```bash
npm ci
npm run dev:mocks
# http://localhost:5173
npm run build
npm run preview
# http://localhost:4173
```

`.env.example` documenta os defaults. Copie para `.env.local` antes do build se precisar alterar:

| Variável | Default | Função |
| --- | --- | --- |
| VITE_MOCKS | true | MSW inclusive no build público; false exige backend externo compatível |
| VITE_API_URL | /api | Base do Axios |
| VITE_SOCKET_URL | https://kurio.mock | URL interceptada pelo mock Socket.IO |

MSW e Web Crypto precisam de HTTPS ou localhost. Não abra dist por file://. A execução não depende de serviços privados.

## Credenciais e cenários

Usuários fictícios `nova@kurio.test` e `luna@kurio.test`, senha `Kurio123!` para ambos. Cadastro também funciona. Senhas persistem somente como hashes PBKDF2 com salt. Use dados fictícios. Cupom `KURIO10` dá 10%; `EXPIRADO` é recusado.

Clique no botão flutuante **Demonstração** para abrir os controles sobre a página atual, selecionar cenários, alterar preço/estoque, interromper Socket.IO e resolver pedidos. O painel não bloqueia o restante da página; feche pelo X ou Escape. O endereço `/demo` continua compatível e abre o painel no início. **Restaurar cenário inicial** restaura contas, senhas, catálogo, carrinhos, carteiras, favoritos e pedidos. A simulação é por aba/navegador; não há sincronização transacional entre abas. Para eventos durante o checkout, abra o painel na mesma aba e dispare a alteração sem sair da compra. Os testes usam os mesmos endpoints MSW.

| Cenário | Reprodução |
| --- | --- |
| standard | Adicione NFT, autentique, selecione carteira, autorize conexão, revise e confirme; aguarde recibo. |
| empty | Catálogo vazio. |
| slow | Abra detalhe/carrinho para observar skeletons; atraso de 1,8 s. |
| out-of-order | Busque uma letra e depois uma palavra; resposta anterior não substitui a mais recente. |
| offline / server-error | Falha de conexão / HTTP 503; volte a standard e tente novamente. |
| forbidden | Perfil retorna HTTP 403. |
| favorite-error | Favoritar autenticado produz rollback e erro. |
| expired-session | Expira sessão atual; consulta privada abre login preservando destino. |
| coupon-expired | Validação do cupom é recusada. |
| payment-declined | Pagamento recusado preserva carrinho. |
| order-timeout | Pedido é criado antes do timeout; recuperado pela chave, sem nova compra. |
| pending-order | Aguarda 60 s ou Resolver pedido pendente; refresh recupera estado. |

Eventos de preço/estoque alteram o banco e passam pelo Socket.IO interceptado. O controle de duplicata emite versões repetidas/antigas. Nova cotação exige nova revisão. A carteira oferece autorizar, recusar e desconectar explicitamente.

## Verificação

```bash
npm run check                  # tipos, lint, testes unitários e build
npm run typecheck              # somente TypeScript
npm run lint                   # somente ESLint
npm run lint:fix               # corrige espaçamento e demais regras automáticas
npx playwright install chromium
npm run test:e2e               # inicia preview se necessário
npx playwright show-report
npm run test:visual
npm run test:visual:update     # apenas após revisar uma mudança visual intencional
npm run audit                 # preview em localhost:4173 deve estar ativo
```

Playwright usa dados isolados, relógio fixo nas capturas, screenshot/trace em falhas, Chromium 1440x1000 e 390x844. Teste de overflow também cobre 768 px. Oito baselines Windows são versionadas; outro SO pode precisar de baseline própria devido à rasterização. CI Linux executa fluxos funcionais e publica HTML/traces como artefato, sem comparar baselines Windows.

Lighthouse executa três medições por página/perfil (início/detalhe, mobile/desktop), com imagens, fontes e mocks da entrega. HTML/JSON e mediana em artifacts/lighthouse. AUDIT_URL muda a origem; AUDIT_RUNS muda quantidade (default 3). Ambiente/resultados em docs/VALIDATION.md.

## Stack e arquivos

React, TypeScript, Vite, TanStack Router/Query, Axios/REST, Socket.IO Client, Tailwind CSS, shadcn/ui (Button e Dialog/Radix adaptados), MSW + @mswjs/socket.io-binding, React Hook Form/Zod, Playwright, Vitest e Lighthouse.

```text
src/app/                 bootstrap, rotas, providers, cache e Socket.IO
src/features/            catalog, auth, cart, checkout, account e demo
  <feature>/api.ts       transporte tipado
  <feature>/hooks.ts     consultas, mutations e cache
  <feature>/components/  componentes da funcionalidade
  <feature>/pages/       composição das telas
src/shared/              contratos, dinheiro, validação, HTTP e UI
src/widgets/layout/      header, footer e navegação da conta
src/mocks/               handlers de rede, banco, fixtures e serviços
src/styles/              tokens e estilos responsivos
tests/                   unitários, E2E e snapshots
```

OAuth social, recuperação por e-mail, editoriais e integrações reais estão fora do escopo; ações auxiliares informam sua limitação sem simular sucesso externo.
