# Contratos REST e eventos

Base /api, JSON, Authorization: Bearer <token> para recursos privados. Tipos em src/shared/domain/models.ts; validação em src/shared/domain/validation.ts. ETH em strings, quantidades/versões inteiras, IDs strings e timestamps em milissegundos Unix.

| Método/recurso | Entrada | Resposta |
| --- | --- | --- |
| GET /session | token opcional | Session ou null visitante; 401 expirado |
| POST /session | email,password | Session e merge do carrinho |
| DELETE /session | token | {} e revogação |
| POST /users | name,email,password,confirm | Session; 409 e-mail duplicado |
| GET /nfts | q,category,network,sort,page,min,max,tab | {items,total,page,pageSize} |
| GET /nfts/:id | id | Nft ou 404 |
| GET /favorites | sessão | IDs |
| PUT /favorites/:id | {selected:boolean} | IDs atualizados; false remove |
| GET /cart | token opcional | {items:[{nftId,edition,quantity}],coupon,version} |
| PUT /cart | {items,version} | lista completa adiciona/altera/remove; retorna Cart |
| PUT /cart/coupon | {code} | Cart; string vazia remove |
| POST /quotes | carrinho da identidade atual | Quote válida por 5 min |
| GET /profile | sessão | User público |
| PUT /profile | name,username,email,ens,walletNickname,avatar | User atualizado; avatar data URL PNG/JPG/WebP até 400 KB |
| PUT /profile/password | currentPassword,password,confirm | {} |
| GET /wallets | sessão | Wallet[] |
| PUT /wallets | Wallet completo | Wallet[]; ID novo cria/existente atualiza |
| POST /connections | {walletId,decision:'accept' ou 'reject'} | {connected:true,walletId} ou 422 |
| POST /orders | {quoteId,walletId,collector:{name,email,note}} e header Idempotency-Key | Order; 201 novo, 200 repetição idêntica |
| GET /orders/:id | sessão dona | Order e snapshot |
| GET /order-attempts/:key | sessão dona | Mesmo Order ou 404 |

Nft: id,name,image,category,network,collection,price,previousPrice?,editions,version,featured,createdAt. Edições: 1/1,1/10,1/50,ABERTA com estoques individuais. Redes: Ethereum,Polygon,Solana.

Quote: id,fingerprint,items,coupon,subtotal,discount,fee,total,expiresAt. Itens têm nftId,edition,quantity,name,image,unitPrice,total,network,nftVersion. Order: id,userId,status,version,quote,wallet,collector,transaction,createdAt,resolvesAt,declineReason?. Estado pending segue para confirmed ou declined, terminais.

Erro: {message,code,fields?:Record<string,string>}. 401 sessão, 403 permissão (cenário forbidden), 404 ausente/privado, 409 conflito cadastro/versão/estoque/cotação/carteira/idempotência, 422 validação/credenciais/recusa, 503 transitório. Offline usa HttpResponse.error, sem HTTP. Timeout ocorre após persistência do pedido. Mutations não repetem automaticamente.

## Controles MSW

- GET /__demo: {scenario,latency,paymentDelay}.
- PUT /__demo: configuração parcial; expired-session expira token atual.
- POST /__demo/reset: restaura fixtures/cancela timers/conexões.
- POST /__demo/event: {type,nftId?,price?}; tipos price,stock,duplicate,disconnect,resolve-order. Stock esgota 1/50.

## Socket.IO

WebSocket em https://kurio.mock, sem long-polling. Cliente emite subscribe {token?}. Backend mock autentica e filtra eventos privados.

```ts
interface ResourceEvent<T> {
  id: string;
  resourceId: string;
  version: number;
  userId?: string;
  data: T;
}
// nft.updated: ResourceEvent<Nft>
// order.updated: ResourceEvent<Order>
```

Banco alterado antes de publicar; versões monotônicas permitem ignorar duplicatas/antigas. Reconexão reconcilia por REST sem presumir entrega de eventos intermediários. Transporte MSW + @mswjs/socket.io-binding; componentes não invocam publisher.
