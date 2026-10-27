import { AlertCircle, SearchX } from "lucide-react";
import { errorMessage } from "../api/client";
import { Button } from "./button";
export function ErrorState({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={20} />
      <p>{errorMessage(error)}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <SearchX size={32} />
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}
export function LoadingGrid() {
  return (
    <div role="status" aria-label="Carregando NFTs">
      <span className="sr-only">Carregando NFTs</span>
      <div className="nft-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i}>
            <Skeleton className="art-skeleton" />
            <Skeleton className="text-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
