import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "../../shared/ui/button";

const notice = () =>
  toast.info("Esta seção editorial não faz parte da demonstração.");

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-features">
        {[
          [
            "W",
            "Segurança da carteira",
            "Proteja sua carteira e colecione arte digital verificada com confiança.",
          ],
          [
            "C",
            "Criadores em destaque",
            "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
          ],
          [
            "D",
            "Alertas de lançamentos",
            "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
          ],
        ].map(([icon, title, text]) => (
          <div key={icon}>
            <span className="feature-circle">{icon}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
        <div>
          <h3>Antecipe-se ao próximo lançamento</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              toast.info(
                "A newsletter não está disponível nesta demonstração. Nenhum e-mail foi enviado.",
              );
            }}
            className="newsletter"
          >
            <input
              type="email"
              aria-label="E-mail para newsletter"
              placeholder="digite seu e-mail..."
              required
            />
            <Button type="submit">Enviar</Button>
          </form>
          <p>
            Receba lançamentos selecionados, histórias de criadores e novidades
            do mercado.
          </p>
        </div>
      </div>
      <div className="footer-contact">
        <Link to="/" className="brand">
          KURIO
        </Link>
        <p>
          Feito para colecionadores,
          <br />
          criadores e cultura
        </p>
        <span>contato@email.com</span>
        <span>+55 11 4002 8922</span>
      </div>
      <div className="footer-links">
        <div>
          <h3>Meu perfil</h3>
          <Link to="/profile">Meu perfil</Link>
          <Link to="/favorites">Minha coleção</Link>
          <button onClick={notice}>Atividade</button>
          <button onClick={notice}>Estúdio do criador</button>
          <Link to="/favorites">Lista de interesse</Link>
        </div>
        <div>
          <h3>Central de ajuda</h3>
          {[
            "Central de ajuda",
            "Como comprar NFTs",
            "Carteira e segurança",
            "Política do mercado",
            "Denunciar item",
          ].map((t) => (
            <button key={t} onClick={notice}>
              {t}
            </button>
          ))}
        </div>
        <div>
          <h3>Coleções</h3>
          {["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"].map(
            (t) => (
              <Link key={t} to="/" search={{ category: t, page: 1 }}>
                {t}
              </Link>
            ),
          )}
        </div>
        <div>
          <h3>Redes sociais</h3>
          <div className="social-links">
            {["f", "◎", "𝕏", "in", "▶"].map((t) => (
              <button key={t} onClick={notice} aria-label={`Rede social ${t}`}>
                {t}
              </button>
            ))}
          </div>
          <h3>Carteiras compatíveis</h3>
          <small className="wallet-badge">
            METAMASK · WALLETCONNECT · COINBASE
          </small>
        </div>
      </div>
      <p className="copyright">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  );
}
