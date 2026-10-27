import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <small>Bem-vindo à Kurio</small>
        <h1>
          <span className="desktop-text">
            SEJA DONO DO FUTURO
            <br /> DA ARTE DIGITAL
          </span>
          <span className="mobile-text">
            SEJA DONO DA
            <br /> CULTURA DIGITAL
          </span>
        </h1>
        <p>
          Descubra NFTs selecionados de criadores emergentes e consagrados.
          Colecione arte digital rara, apoie artistas e tenha uma parte da
          cultura da internet.
        </p>
        <a href="#catalogo" className="hero-cta">
          EXPLORAR <ArrowRight size={18} />
        </a>
      </div>
      <img
        className="hero-art"
        src="/assets/emerald.webp"
        width="450"
        height="450"
        alt="Emerald Ape, arte digital com jaqueta verde e óculos"
        fetchPriority="high"
      />
      <div className="hero-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
