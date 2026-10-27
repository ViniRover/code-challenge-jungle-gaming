import type { OrderRequest } from "../../shared/domain/models";

export interface CheckoutDraft {
  walletId: string;
  collector: OrderRequest["collector"];
}

const key = (owner: string) => `kurio.checkout.${owner}`;

export const draftStorage = {
  get(owner: string): CheckoutDraft | null {
    try {
      return JSON.parse(sessionStorage.getItem(key(owner)) || "null");
    } catch {
      return null;
    }
  },
  set(owner: string, draft: CheckoutDraft) {
    sessionStorage.setItem(key(owner), JSON.stringify(draft));
  },
  clear(owner: string) {
    sessionStorage.removeItem(key(owner));
  },
};
