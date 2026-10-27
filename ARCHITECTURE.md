# Arquitetura e decisões

## Organização e SOLID

Arquitetura por funcionalidades, inspirada em Feature-Sliced Design sem camadas vazias. app compõe; features implementa casos de uso; widgets compõe navegação; shared oferece contratos e primitivas. Páginas coordenam componentes, hooks e APIs. Regras de cotação/pedido ficam nos serviços da simulação de backend.

SRP: apresentação, formulário, transporte, dinheiro e persistência em arquivos separados. DIP: componentes dependem de APIs tipadas, cujo backend pode mudar sem reescrever a interface. ISP: props/contratos pequenos. OCP: composição React e variantes permitem extensão sem duplicar primitivas. Não há hierarquia artificial de classes; interfaces compartilhadas preservam substituição dos contratos (LSP). Checkout depende intencionalmente de carrinho e conta para compor o fluxo.

## Rede e simulação

Axios centraliza base URL, token, timeout e expiração. MSW inicia antes da montagem e da importação do Socket.IO Client. Componentes/hooks/APIs não contêm fixtures ou caminhos alternativos de negócio. O banco versionado persiste localmente usuários, sessões, catálogo, favoritos, carrinhos, cotações, carteiras e pedidos. São 36 NFTs, nove por página.

A persistência sustenta refresh, mas não é um banco concorrente distribuído: múltiplas abas não sincronizam estado em memória. Reset restaura fixtures, cancela timers, desconecta sockets e limpa tentativas/rascunhos. Os controles da demonstração passam pelos próprios handlers MSW.

## Sessão e cache

Bearer simulado com validade de uma hora, recuperado via GET /session. Backend simulado verifica dono; pedidos de outro usuário retornam 404 para não revelar existência. Senhas PBKDF2/SHA-256, salt individual e 100 mil iterações, sem texto claro. Tokens e dados locais são visíveis ao próprio navegador: este modelo não substitui segurança de backend real.

Router protege checkout, perfil, carteiras, favoritos e pedidos, preservando destino interno após login. Rascunho de checkout em sessionStorage é separado por usuário e removido após confirmação/reset. A carteira exige reconexão. Logout/401 limpa cache privado e subscriptions. Queries incluem usuário/recurso/parâmetros. Atualização tardia de perfil só altera a sessão se o usuário ainda corresponder.

Query: staleTime 15 s, gcTime 5 min, refetch ao focar; uma repetição para rede/5xx, nenhuma para 4xx. Mutations não repetem automaticamente. AbortSignal cancela consultas Axios; query key do catálogo inclui busca completa. URL preserva filtros, ordenação, página e aba; mudar filtros reinicia paginação. Favoritos têm snapshot otimista e rollback. Carrinho/cupom invalidam cotação; conta/carteira invalidam seus recursos. Estado transitório dos diálogos fica local, sem duplicar estado remoto em store global.

## Carrinho, precisão e compra

ETH é string decimal; cálculo BigInt em wei de 18 casas, sem ponto flutuante financeiro. Quantidades inteiras; carrinho versionado detecta concorrência. Login mescla visitante por NFT+edição, soma até estoque e limpa visitante. Cotação da API tem snapshot, desconto, taxa, validade de cinco minutos e fingerprint dos dados relevantes.

Checkout exige conexão simulada e revisão; revalida cotação antes do envio. Alterações exigem nova confirmação. Trava síncrona/estado pendente impedem cliques repetidos. Chave/corpo da tentativa persistem antes do POST; timeout consulta order-attempts em vez de criar nova compra. Reutilizar chave com corpo diferente gera 409. Reserva de estoque e uma compra pendente por usuário evitam duplicação na simulação.

Pedido guarda cotação/carteira independentes do catálogo. Só confirmed mostra recibo de sucesso. Recusa restaura estoque e preserva carrinho; confirmação remove somente quantidades compradas. Estados terminais não regridem. Timers são restaurados ao carregar; GET também resolve pedidos vencidos. Datas, valores e IDs vêm do snapshot. Explorador é um diálogo explicitamente simulado.

## Socket.IO

socket.io-client com transporte WebSocket interceptado por msw.ws e @mswjs/socket.io-binding, na origem fictícia https://kurio.mock. Handshake/protocolo Socket.IO/Engine.IO e heartbeat, sem fallback long-polling e sem servidor externo. Mock autentica subscribe pelo token e filtra eventos privados.

Eventos contêm id,resourceId,version,data,userId quando privado. Cliente rejeita versões antigas/duplicadas e dono incompatível. nft.updated atualiza detalhe e invalida catálogo/cotação. order.updated atualiza pedido e invalida carrinho, sem regredir terminais. Reconexão invalida recursos ativos para reconciliar por REST; cleanup remove listeners, desconecta e bloqueia callbacks tardios. Os testes passam pelo cliente Socket.IO, nunca por setters/cache direto.

## Design e acessibilidade

Referências: 15 PNGs fornecidos. Sem assets individuais ou metadados/fontes do Figma, quatro artes foram recortadas das exportações e convertidas para WebP. Roboto Mono local aproxima a fonte monoespaçada; Lucide substitui ícones não exportados. Não se presume medição pixel-perfect a partir das screenshots.

Preservados fundo marrom escuro, laranja, hierarquia, hero, grid/sidebar desktop, navegação inferior mobile, galeria, cartões e formulários. Perfil/carteiras/recibo adaptados para mobile sem frame próprio; tablet intermediário. Autenticação usa modal desktop/tela mobile. Números e badges vêm da simulação, não de números inconsistentes nos frames.

Adaptações: revisão de compra, autorização/recusa, erros/vazios/pending, títulos acessíveis, ação separada de senha, drawer de filtros, favoritos e indicador de conexão. Checkout deriva campos da carteira cadastrada para evitar contradições; nome/e-mail/observação editáveis. Conteúdos fora do escopo comunicam limitação. Não se abre um explorador real com hash fictício.

Button/Dialog seguem shadcn/ui via cva/Tailwind/Radix. Foco visível, skip link, labels/aria-describedby, erros por campo, focus trap, feedback acessível e alt texts. Shimmer respeita reduced-motion; skeletons reservam espaço. Ajustes de contraste e alvos de interação melhoram legibilidade.

## Operação e limites

Chunks por rota, WebP, fontes locais e gzip. Vercel tem fallback SPA e Service Worker sem cache persistente. Docker produção não inclui node_modules e não roda como root. CI cobre tipos/lint/unidade/build/E2E. Baselines visuais são Windows; relatórios registram condições.

Não há blockchain, OAuth, carteira externa ou pagamento real, conforme escopo. Nenhum dado é enviado a esses serviços. Desativar MSW exige backend compatível. Simulação local não pretende validar economicamente redes/tokens nem funcionar como produto financeiro.
