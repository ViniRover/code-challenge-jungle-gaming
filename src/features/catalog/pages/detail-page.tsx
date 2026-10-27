import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Search,
  Star,
  ShoppingCart,
  Mail,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { catalogApi } from "../api";
import { keys } from "../../../shared/api/keys";
import { eth } from "../../../shared/domain/money";
import type { Edition } from "../../../shared/domain/models";
import { useCart, useCartMutation } from "../../cart/hooks";
import { useIdentity } from "../../auth/hooks";
import { useFavorites, useFavoriteMutation } from "../../account/hooks";
import { Button } from "../../../shared/ui/button";
import { Quantity } from "../../../shared/ui/quantity";
import { ErrorState, Skeleton } from "../../../shared/ui/feedback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../shared/ui/dialog";
import { errorMessage } from "../../../shared/api/client";
import { RelatedNfts } from "../components/related-nfts";
import { usePageTitle } from "../../../shared/hooks/use-page-title";
export default function DetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const query = useQuery({
    queryKey: keys.nft(id),
    queryFn: ({ signal }) => catalogApi.detail(id, signal),
  });
  usePageTitle(query.data?.name || "Detalhes do NFT");
  const [edition, setEdition] = useState<Edition>("1/50");
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [tab, setTab] = useState("details");
  const [gallery, setGallery] = useState(0);
  const { data: cart } = useCart();
  const mutation = useCartMutation();
  const owner = useIdentity();
  const favorites = useFavorites();
  const favorite = useFavoriteMutation();
  const navigate = useNavigate();
  const location = useLocation();
  if (query.isPending)
    return (
      <div
        className="detail-layout"
        role="status"
        aria-label="Carregando detalhe"
      >
        <Skeleton className="detail-skeleton" />
        <Skeleton className="detail-skeleton" />
      </div>
    );
  if (query.isError)
    return (
      <>
        <ErrorState error={query.error} retry={() => query.refetch()} />
        <Link to="/">Voltar ao catálogo</Link>
      </>
    );
  const nft = query.data;
  const stock = nft.editions[edition];
  const selected = favorites.data?.includes(id) || false;
  const toggleFavorite = () => {
    if (owner === "guest") {
      navigate({ to: "/login", search: { redirect: location.href } });
      return;
    }
    favorite.mutate(
      { id, selected: !selected },
      {
        onError: (e) => toast.error(errorMessage(e)),
        onSuccess: () =>
          toast.success(selected ? "Favorito removido." : "Favorito salvo."),
      },
    );
  };
  const add = (checkout: boolean) => {
    if (!cart) return;
    const existing = cart.items.find(
      (i) => i.nftId === id && i.edition === edition,
    );
    if ((existing?.quantity || 0) + quantity > stock) {
      toast.error(
        "A quantidade total ultrapassa a disponibilidade desta edição.",
      );
      return;
    }
    const items = existing
      ? cart.items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...cart.items, { nftId: id, edition, quantity }];
    mutation.mutate(
      { items, version: cart.version },
      {
        onSuccess: () => {
          toast.success("NFT adicionado ao carrinho.");
          if (checkout) navigate({ to: "/cart" });
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };
  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Início</Link> / Mercado
      </div>
      <div className="detail-mobile-header">
        <Link to="/" aria-label="Voltar">
          <ArrowLeft />
        </Link>
        <button
          aria-label="Favoritar NFT"
          aria-pressed={selected}
          disabled={favorite.isPending}
          onClick={toggleFavorite}
        >
          <Heart fill={selected ? "currentColor" : "none"} />
        </button>
      </div>
      <section className="detail-layout">
        <div className="gallery">
          <div className="thumbnails">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                aria-label={`Visualização ${i + 1}`}
                aria-pressed={gallery === i}
                onClick={() => setGallery(i)}
              >
                <img src={nft.image} alt="" width="90" height="90" />
              </button>
            ))}
          </div>
          <button
            className="main-art"
            onClick={() => setZoom(true)}
            aria-label="Ampliar imagem do NFT"
          >
            <img
              src={nft.image}
              alt={nft.name}
              width="450"
              height="450"
              fetchPriority="high"
              style={{
                objectPosition: ["center", "left", "right", "center"][gallery],
              }}
            />
            <Search className="zoom-icon" />
          </button>
        </div>
        <div className="detail-info">
          <div className="detail-title">
            <h1>{nft.name}</h1>
            <span className="mobile-rating">
              <Star size={15} fill="currentColor" />
              4.8(19)
            </span>
          </div>
          <div className="detail-price-row">
            <strong>{eth(nft.price)}</strong>
            <span>
              ★★★★★ <small>19 avaliações de colecionadores</small>
            </span>
          </div>
          <h2>Sobre este NFT:</h2>
          <p>
            Um colecionável digital finalizado à mão da coleção Kurio Editions,
            certificado na {nft.network}, com arte desbloqueável e acesso para
            colecionadores.
          </p>
          <h2>Edição:</h2>
          <div className="edition-options">
            {(Object.keys(nft.editions) as Edition[]).map((e) => (
              <button
                key={e}
                disabled={nft.editions[e] === 0}
                aria-pressed={edition === e}
                onClick={() => {
                  setEdition(e);
                  setQuantity(1);
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="detail-purchase">
            <Quantity value={quantity} max={stock} onChange={setQuantity} />
            <span className="mobile-price">{eth(nft.price)}</span>
            <Button
              disabled={
                !cart || mutation.isPending || stock === 0 || quantity > stock
              }
              onClick={() => add(true)}
            >
              Comprar NFT
            </Button>
            <Button
              variant="outline"
              className="desktop-favorite"
              aria-pressed={selected}
              disabled={favorite.isPending}
              onClick={toggleFavorite}
            >
              <Heart size={20} fill={selected ? "currentColor" : "none"} />
              Favoritar
            </Button>
            <Button
              className="mobile-cart-add"
              size="icon"
              variant="outline"
              aria-label="Adicionar ao carrinho"
              disabled={
                !cart || mutation.isPending || stock === 0 || quantity > stock
              }
              onClick={() => add(false)}
            >
              <ShoppingCart />
            </Button>
          </div>
          {stock === 0 && (
            <p role="alert" className="field-error">
              Edição esgotada. Escolha outra edição.
            </p>
          )}
          <div className="nft-metadata">
            <p>ID do token: #{nft.id}</p>
            <p>Coleção: {nft.collection}</p>
            <p>Atributos: Óculos, Esmeralda, Raro</p>
          </div>
          <div className="share">
            Compartilhar este NFT:{" "}
            <button
              aria-label="Copiar link do NFT"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  location.href.startsWith("http")
                    ? location.href
                    : window.location.href,
                );
                toast.success("Link copiado.");
              }}
            >
              <Link2 size={16} />
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent(nft.name)}&body=${encodeURIComponent(window.location.href)}`}
              aria-label="Compartilhar por e-mail"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </section>
      <section className="detail-description">
        <div role="tablist" aria-label="Informações do NFT">
          <button
            role="tab"
            aria-selected={tab === "details"}
            id="details-tab"
            aria-controls="details-panel"
            onClick={() => setTab("details")}
          >
            Detalhes do NFT
          </button>
          <button
            role="tab"
            aria-selected={tab === "reviews"}
            id="reviews-tab"
            aria-controls="details-panel"
            onClick={() => setTab("reviews")}
          >
            Avaliações de colecionadores (19)
          </button>
        </div>
        <div
          id="details-panel"
          role="tabpanel"
          aria-labelledby={tab === "details" ? "details-tab" : "reviews-tab"}
        >
          {tab === "details" ? (
            <>
              <p>
                {nft.name} é uma obra digital {edition} finalizada à mão da
                coleção Kurio Editions. Cada atributo fica armazenado nos
                metadados do token e verificado na {nft.network}. A obra explora
                identidade, movimento e luz em um mundo digital sem fronteiras.
              </p>
              <p>
                A propriedade inclui a arte em alta resolução, lançamentos
                exclusivos para colecionadores e um registro permanente de
                procedência registrada na rede. Nova Store recebe 5% de direitos
                autorais nas vendas secundárias, apoiando novos trabalhos e
                lançamentos da comunidade.
              </p>
              <b>Rede:</b>
              <p>
                Cunhado na {nft.network} com procedência imutável e metadados
                armazenados no IPFS.
              </p>
              <b>Contrato:</b>
              <p>
                Direitos autorais do criador: 5% nas vendas secundárias, pagos
                automaticamente pelos mercados compatíveis.
              </p>
              <b>Direitos autorais:</b>
              <p>0x7A42...19E8 · Contrato inteligente ERC-721 verificado.</p>
            </>
          ) : (
            <>
              <p>★★★★★ 4,8 de 5 · 19 avaliações demonstrativas</p>
              <p>
                “Uma arte cheia de personalidade. Os detalhes são incríveis.” —
                Luna, colecionadora
              </p>
            </>
          )}
        </div>
      </section>
      <RelatedNfts exclude={id} />
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="zoom-dialog">
          <DialogTitle>{nft.name}</DialogTitle>
          <DialogDescription>Visualização ampliada da arte.</DialogDescription>
          <img src={nft.image} alt={nft.name} width="600" height="600" />
        </DialogContent>
      </Dialog>
    </>
  );
}
