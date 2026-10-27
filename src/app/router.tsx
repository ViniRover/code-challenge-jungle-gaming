import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
  Link,
} from "@tanstack/react-router";
import { AppLayout } from "./layout";
import { queryClient } from "./query-client";
import { authApi } from "../features/auth/api";
import { keys } from "../shared/api/keys";
import type { CatalogSearch } from "../shared/domain/models";

const root = createRootRoute({
  component: AppLayout,
  errorComponent: ({ error }) => (
    <div role="alert">
      <h1>Não foi possível abrir esta página</h1>
      <p>{error instanceof Error ? error.message : "Erro inesperado."}</p>
      <a href="/">Voltar ao início</a>
    </div>
  ),
});

const privateGuard = async ({ location }: { location: { href: string } }) => {
  let session;

  try {
    session = await queryClient.fetchQuery({
      queryKey: keys.session,
      queryFn: () => authApi.session(),
      staleTime: 10000,
    });
  } catch {
    session = null;
  }

  if (!session)
    throw redirect({ to: "/login", search: { redirect: location.href } });
};

const home = createRoute({
  getParentRoute: () => root,
  path: "/",
  validateSearch: (s: Record<string, unknown>): CatalogSearch => ({
    q: typeof s.q === "string" ? s.q : "",
    category: typeof s.category === "string" ? s.category : "",
    network: typeof s.network === "string" ? s.network : "",
    sort: ["recent", "price-asc", "price-desc"].includes(String(s.sort))
      ? String(s.sort)
      : "recent",
    page: Math.max(1, Math.floor(Number(s.page) || 1)),
    min: /^\d+(\.\d{1,18})?$/.test(String(s.min)) ? String(s.min) : "",
    max: /^\d+(\.\d{1,18})?$/.test(String(s.max)) ? String(s.max) : "",
    tab: ["all", "new", "trending"].includes(String(s.tab))
      ? String(s.tab)
      : "all",
  }),
  component: lazyRouteComponent(
    () => import("../features/catalog/pages/catalog-page"),
  ),
});

const detail = createRoute({
  getParentRoute: () => root,
  path: "/nft/$id",
  component: lazyRouteComponent(
    () => import("../features/catalog/pages/detail-page"),
  ),
});

const cart = createRoute({
  getParentRoute: () => root,
  path: "/cart",
  component: lazyRouteComponent(
    () => import("../features/cart/pages/cart-page"),
  ),
});

const authSearch = (s: Record<string, unknown>): { redirect?: string } => ({
  redirect: typeof s.redirect === "string" ? s.redirect : undefined,
});

const login = createRoute({
  getParentRoute: () => root,
  path: "/login",
  validateSearch: authSearch,
  component: lazyRouteComponent(
    () => import("../features/auth/pages/auth-page"),
  ),
});

const register = createRoute({
  getParentRoute: () => root,
  path: "/register",
  validateSearch: authSearch,
  component: lazyRouteComponent(
    () => import("../features/auth/pages/auth-page"),
  ),
});

const profile = createRoute({
  getParentRoute: () => root,
  path: "/profile",
  beforeLoad: privateGuard,
  component: lazyRouteComponent(
    () => import("../features/account/pages/profile-page"),
  ),
});

const wallets = createRoute({
  getParentRoute: () => root,
  path: "/wallets",
  beforeLoad: privateGuard,
  component: lazyRouteComponent(
    () => import("../features/account/pages/wallets-page"),
  ),
});

const favorites = createRoute({
  getParentRoute: () => root,
  path: "/favorites",
  beforeLoad: privateGuard,
  component: lazyRouteComponent(
    () => import("../features/account/pages/favorites-page"),
  ),
});

const checkout = createRoute({
  getParentRoute: () => root,
  path: "/checkout",
  beforeLoad: privateGuard,
  component: lazyRouteComponent(
    () => import("../features/checkout/pages/checkout-page"),
  ),
});

const order = createRoute({
  getParentRoute: () => root,
  path: "/order/$id",
  beforeLoad: privateGuard,
  component: lazyRouteComponent(
    () => import("../features/checkout/pages/order-page"),
  ),
});

const demo = createRoute({
  getParentRoute: () => root,
  path: "/demo",
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "demo" });
  },
});

export const router = createRouter({
  routeTree: root.addChildren([
    home,
    detail,
    cart,
    login,
    register,
    profile,
    wallets,
    favorites,
    checkout,
    order,
    demo,
  ]),
  defaultPendingComponent: () => (
    <div className="route-loading" role="status">
      Carregando…
    </div>
  ),
  defaultNotFoundComponent: () => (
    <div className="empty-state">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </div>
  ),
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
