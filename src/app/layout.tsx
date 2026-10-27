import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { Header } from "../widgets/layout/header";
import { Footer } from "../widgets/layout/footer";
import { Realtime } from "./realtime";
import { keys } from "../shared/api/keys";
export function AppLayout() {
  const qc = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const expire = async () => {
      await qc.cancelQueries();
      qc.removeQueries({ queryKey: ["private"] });
      qc.setQueryData(keys.session, null);
      toast.error("Sua sessão expirou. Entre novamente para retomar.");
      if (!/^\/(login|register)/.test(window.location.pathname))
        navigate({
          to: "/login",
          search: {
            redirect: window.location.pathname + window.location.search,
          },
        });
    };
    window.addEventListener("kurio:session-expired", expire);
    return () => window.removeEventListener("kurio:session-expired", expire);
  }, [qc, navigate]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  const account = /^\/(profile|wallets|favorites)/.test(location.pathname);
  const order = location.pathname.startsWith("/order");
  const purchase = /^\/(nft|cart|checkout)/.test(location.pathname);
  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <div
        className={`site-container ${account ? "account-shell" : ""} ${order ? "order-shell" : ""} ${purchase ? "purchase-shell" : ""}`}
      >
        <Header />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        {!account && !order && <Footer />}
        <div className="site-status">
          <Realtime />
          <a href="/demo">Demonstração</a>
        </div>
      </div>
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{ duration: 4500 }}
      />
    </>
  );
}
