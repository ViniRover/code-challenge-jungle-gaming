import type { OrderRequest } from "../../shared/domain/models";
export interface Attempt {
  key: string;
  request: OrderRequest;
}
const key = (owner: string) => `kurio.attempt.${owner}`;
export const attemptStorage = {
  get(owner: string): Attempt | null {
    try {
      return JSON.parse(localStorage.getItem(key(owner)) || "null");
    } catch {
      return null;
    }
  },
  set(owner: string, attempt: Attempt) {
    localStorage.setItem(key(owner), JSON.stringify(attempt));
  },
  clear(owner: string) {
    localStorage.removeItem(key(owner));
  },
};
