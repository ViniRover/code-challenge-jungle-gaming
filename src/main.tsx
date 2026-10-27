import "@fontsource/roboto-mono/latin-400.css";
import "@fontsource/roboto-mono/latin-600.css";
import "@fontsource/roboto-mono/latin-700.css";
import "./styles/global.css";

async function bootstrap() {
  // Download application code while MSW starts. Socket.IO is imported only in
  // its effect, after the interception layer is ready.
  const application = import("./app/mount");

  if (import.meta.env.VITE_MOCKS !== "false") {
    const { startMocks } = await import("./mocks/browser");

    await startMocks();
  }

  const { mount } = await application;

  mount();
  document.documentElement.dataset.appReady = "true";
}

bootstrap().catch((error) => {
  console.error(error);

  document.getElementById("root")!.textContent =
    "Não foi possível iniciar a aplicação. Atualize a página.";
});
