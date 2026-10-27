import {
  Link,
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../shared/ui/dialog";
import { AuthForm } from "../components/auth-form";
import CatalogPage from "../../catalog/pages/catalog-page";
import { usePageTitle } from "../../../shared/hooks/use-page-title";
export default function AuthPage() {
  const location = useLocation();
  const registerMode = location.pathname === "/register";
  const search = useSearch({ strict: false }) as { redirect?: string };
  const redirect =
    search.redirect?.startsWith("/") &&
    !search.redirect.startsWith("//") &&
    !/^\/(login|register)/.test(search.redirect)
      ? search.redirect
      : "/profile";
  const navigate = useNavigate();
  usePageTitle(registerMode ? "Criar conta" : "Entrar");
  return (
    <>
      <div className="auth-background" aria-hidden="true" inert>
        <CatalogPage />
      </div>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) navigate({ to: "/" });
        }}
      >
        <DialogContent
          className="auth-dialog"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            document.querySelector<HTMLAnchorElement>(".brand")?.focus();
          }}
        >
          <div className="auth-brand">KURIO</div>
          <DialogTitle className="auth-title">
            <span className="desktop-text">
              <Link
                to="/login"
                search={{ redirect }}
                className={!registerMode ? "active" : ""}
              >
                Entrar
              </Link>
              <span className="auth-tab-divider">|</span>
              <Link
                to="/register"
                search={{ redirect }}
                className={registerMode ? "active" : ""}
              >
                Criar conta
              </Link>
            </span>
            <span className="mobile-text">
              {registerMode ? "Criar perfil de colecionador" : "Entrar"}
            </span>
          </DialogTitle>
          <DialogDescription className="auth-description">
            {registerMode
              ? "Crie seu perfil de colecionador e conecte uma carteira quando quiser."
              : "Entre para gerenciar sua carteira, coleção e perfil de criador."}
          </DialogDescription>
          <AuthForm
            key={String(registerMode)}
            registerMode={registerMode}
            redirect={redirect}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
