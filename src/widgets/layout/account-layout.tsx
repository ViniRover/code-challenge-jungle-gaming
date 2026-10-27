import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  UserRound,
  MapPin,
  ShoppingCart,
  Heart,
  ChartNoAxesCombined,
  Download,
  TriangleAlert,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useSessionActions } from "../../features/auth/hooks";

export function AccountLayout({ children }: { children: ReactNode }) {
  const { logout } = useSessionActions();
  const navigate = useNavigate();

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <h2>Meu perfil</h2>
        <Link to="/profile" activeProps={{ className: "active" }}>
          <UserRound />
          Dados do perfil
        </Link>
        <Link to="/wallets" activeProps={{ className: "active" }}>
          <MapPin />
          Carteiras
        </Link>
        <button
          onClick={() =>
            toast.info("Atividade fora do escopo desta demonstração.")
          }
        >
          <ShoppingCart />
          Atividade
        </button>
        <Link to="/favorites" activeProps={{ className: "active" }}>
          <Heart />
          Lista de interesse
        </Link>
        {[
          [ChartNoAxesCombined, "Ofertas"],
          [Download, "Arquivos baixados"],
          [TriangleAlert, "Suporte"],
        ].map(([Icon, label]) => {
          const Component = Icon as typeof Heart;

          return (
            <button
              key={String(label)}
              onClick={() =>
                toast.info("Função fora do escopo desta demonstração.")
              }
            >
              <Component />
              {String(label)}
            </button>
          );
        })}
        <button
          className="logout"
          onClick={async () => {
            await logout();
            navigate({ to: "/" });
            toast.success("Você saiu da sua conta.");
          }}
        >
          <LogOut />
          Sair
        </button>
      </aside>
      <section className="account-content">{children}</section>
    </div>
  );
}
