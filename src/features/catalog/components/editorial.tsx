import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export function Editorial() {
  return (
    <>
      <section className="promotions">
        {[
          ["emerald", "Lançamentos gênesis de edição limitada"],
          ["ivory", "Arte digital selecionada e muito mais"],
        ].map(([image, title]) => (
          <div key={image}>
            <img
              src={`/assets/${image}.webp`}
              alt=""
              width="280"
              height="240"
              loading="lazy"
            />
            <div>
              <h3>{title}</h3>
              <p>
                Colecione edições escassas diretamente dos criadores e descubra
                obras digitais.
              </p>
              <Link to="/" hash="catalogo">
                Explorar →
              </Link>
            </div>
          </div>
        ))}
      </section>
      <section className="editorial">
        <h2>Diário da Cunhagem</h2>
        <p>
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
        <div>
          {[
            ["ivory", "Como funciona a propriedade de NFTs"],
            ["emerald", "10 artistas digitais para acompanhar"],
            ["violet", "Raridade, atributos e procedência"],
            ["golden", "Como proteger sua carteira"],
          ].map(([image, title]) => (
            <article key={image}>
              <img
                src={`/assets/${image}.webp`}
                alt=""
                width="300"
                height="220"
                loading="lazy"
              />
              <div>
                <small>12 de setembro | Leitura de 3 min</small>
                <h3>{title}</h3>
                <p>Conheça o universo da arte digital.</p>
                <button
                  onClick={() =>
                    toast.info(
                      "Conteúdo editorial fora do escopo da demonstração.",
                    )
                  }
                >
                  Ler mais →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
