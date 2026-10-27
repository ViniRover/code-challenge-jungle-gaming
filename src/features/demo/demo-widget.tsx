import { lazy, Suspense, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FlaskConical, X } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { Button } from "../../shared/ui/button";

const DemoControls = lazy(() => import("./demo-controls"));

export function DemoWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (location.hash === "demo") setOpen(true);
  }, [location.hash]);

  if (import.meta.env.VITE_MOCKS === "false") return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
      <Dialog.Trigger asChild>
        <Button className="demo-launcher" aria-label="Abrir demonstração">
          <FlaskConical size={20} aria-hidden="true" />
          <span>Demonstração</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          className="demo-panel"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <header className="demo-panel-header">
            <div>
              <Dialog.Title>Cenários da demonstração</Dialog.Title>
              <Dialog.Description>
                Teste o marketplace sem sair desta tela.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar demonstração"
              >
                <X size={20} />
              </Button>
            </Dialog.Close>
          </header>
          <div className="demo-panel-body">
            <Suspense fallback={<p role="status">Carregando controles…</p>}>
              <DemoControls />
            </Suspense>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
