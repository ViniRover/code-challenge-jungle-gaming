import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  LogIn,
  UserRound,
  Heart,
  House,
} from "lucide-react";
import { useSession } from "../../features/auth/hooks";
import { useCart } from "../../features/cart/hooks";
import { buttonVariants } from "../../shared/ui/button";
import { toast } from "sonner";
export function Header() {
  const { data: session } = useSession();
  const { data: cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const marketplace = /nft|cart|checkout|order/.test(location.pathname);
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          KURIO
        </Link>
        <nav aria-label="Navegação principal">
          <Link
            to="/"
            activeProps={{ className: "" }}
            className={!marketplace ? "active" : ""}
          >
            Início
          </Link>
          <Link
            to="/"
            activeProps={{ className: "" }}
            hash="catalogo"
            className={marketplace ? "active" : ""}
          >
            Mercado
          </Link>
          <button
            onClick={() =>
              toast.info("Conheça os criadores nas informações de cada NFT.")
            }
          >
            Criadores
          </button>
          <button
            onClick={() =>
              toast.info(
                "Conteúdo editorial fora do escopo desta demonstração.",
              )
            }
          >
            Aprenda
          </button>
        </nav>
        <div className="header-actions">
          <button
            aria-label="Buscar NFTs"
            onClick={() => {
              navigate({ to: "/", hash: "catalogo" });
              setTimeout(
                () => document.getElementById("catalog-search")?.focus(),
                100,
              );
            }}
          >
            <Search size={23} />
          </button>
          <Link
            to="/cart"
            aria-label={`Abrir carrinho, ${cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0} itens`}
            className="cart-icon"
          >
            <ShoppingCart size={25} />
            <span>
              {cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0}
            </span>
          </Link>
          {session ? (
            <Link to="/profile" className={buttonVariants({ size: "sm" })}>
              <UserRound size={18} />
              <span>Meu perfil</span>
            </Link>
          ) : (
            <Link
              to="/login"
              search={{ redirect: location.href }}
              className={buttonVariants({ size: "sm" })}
            >
              <LogIn size={18} />
              Entrar
            </Link>
          )}
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Navegação mobile">
        <Link to="/" aria-label="Início">
          <House size={20} />
        </Link>
        <Link to="/favorites" aria-label="Favoritos">
          <Heart size={20} />
        </Link>
        <Link
          to="/"
          hash="catalogo"
          aria-label="Explorar NFTs"
          className="mobile-center"
        >
          <Search size={26} />
        </Link>
        <Link to="/cart" aria-label="Carrinho">
          <ShoppingCart size={20} />
        </Link>
        <Link to="/profile" aria-label="Meu perfil">
          <UserRound size={20} />
        </Link>
      </nav>
    </>
  );
}
