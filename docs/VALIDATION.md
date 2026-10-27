# Validação da entrega

Execução em 27/10/2026, Windows, Node 24.18.0 no host e Node 22 Alpine no container. Versões exatas no package-lock.json. Chromium instalado pelo Playwright; testes de produção com MSW ativo.

## Resultado funcional

- TypeScript, ESLint, build Vite: aprovados.
- Vitest: 9 testes aprovados (dinheiro preciso, idempotência, conflito de chave/cotação, snapshot e preservação do carrinho).
- Playwright local: 40 testes aprovados em 3,6 minutos, Chromium desktop 1440x1000 e mobile 390x844, incluindo regressão visual de quatro telas em cada viewport.
- Produção pública Vercel: 4 testes aprovados em 39,1 s, catálogo/acesso direto/persistência e compra completa/recibo em ambos os viewports. Navegador novo sem sessão Vercel. Rota /nft/042 respondeu HTTP 200.
- Docker: docker compose up --build -d concluído, container healthy em localhost:4173. Build Linux usa npm ci e executa TypeScript/Vite.
- Capturas adicionais de início/detalhe em 390, 768 e 1440 px em artifacts/preview. Teste de teclado verifica foco preso no diálogo e ausência de overflow nessas larguras.

Relatórios completos: [Playwright local](../artifacts/playwright-report.zip), [produção](../artifacts/deployment-report.zip). Extraia e abra index.html ou use npx playwright show-report com a pasta extraída. [Traces das falhas iniciais corrigidas](../artifacts/playwright-initial-failures.zip) preservam a investigação; não representam o resultado final. Não houve falhas na execução funcional final.

## Cobertura

Busca/filtros combinados/ordenação/paginação/histórico; detalhe direto e 404; cadastro/conflito/login/logout/troca/expiração; favoritos otimistas/rollback/isolamento; carrinho/quantidades/remoção/cupom/refresh/merge; compra confirmada/recusada; duplo clique e privacidade do pedido; timeout recuperado; perfil/avatar/senha/carteiras; Socket.IO preço/estoque/duplicata/evento antigo; pedido pendente/desconexão/refresh; latência/resposta fora de ordem/offline/erro 503/recuperação; teclado/foco e skeleton.

Oito baselines versionadas em tests/e2e/visual.spec.ts-snapshots. Relógio fixo em 29/07/2026; dados resetados; animações desativadas; indicador de conexão mascarado e toasts transitórios ocultos apenas na captura. As telas, imagens, fontes e regras permanecem iguais às da aplicação. Baselines Windows podem diferir em outro SO; CI Linux executa os 38 testes funcionais.

## Lighthouse

Configuração reproduzível em scripts/lighthouse.mjs. Build de produção servido com gzip pelo Docker em localhost:4173, cenário standard, cache limpo a cada execução, sem alterações exclusivas para auditoria. Três execuções por página/perfil. Mobile: 390x844 e throttling simulado padrão Lighthouse; desktop: 1440x1000, RTT 40 ms, 10.240 Kbps, CPU 1x. Sem testes Playwright concorrentes durante a medição.

Resultados e metadados finais das doze medições: Os arquivos HTML/JSON completos acompanham a entrega compactados em artifacts/lighthouse/reports.zip; summary.json contém cada execução e as medianas.

| Página | Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP (ms) | CLS | TBT (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| home | mobile | 90 | 100 | 100 | 92 | 3295.3 | 0 | 46 |
| home | desktop | 99 | 100 | 100 | 92 | 862.6 | 0.00012 | 0 |
| detail | mobile | 90 | 100 | 100 | 92 | 3364.1 | 0 | 17.5 |
| detail | desktop | 99 | 100 | 100 | 92 | 800.4 | 0.00791 | 0 |
Todas as medianas atingiram as metas do enunciado (90/95/95/90). Lighthouse 13.5.0, Chromium 156.0.8078.4, CPU Intel(R) Core(TM) i9-10900F CPU @ 2.80GHz. Performance mobile é limitada principalmente pelo custo inicial de carregar React, MSW e a arte principal sob throttling; as funcionalidades de demonstração foram mantidas. CLS mobile foi zero. Otimizações usadas: WebP, fontes locais, importação paralela do app/MSW, chunks por rota, gzip e reserva de espaço de skeletons.
