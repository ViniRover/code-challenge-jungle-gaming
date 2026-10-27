import type {
  Cart,
  DemoConfig,
  Nft,
  Order,
  Quote,
  User,
  Wallet,
} from "../shared/domain/models";
import { nftFixtures, userFixtures, walletFixtures } from "./fixtures";
import { hashPassword } from "./password";

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

interface Database {
  schema: 3;
  nfts: Nft[];
  users: StoredUser[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
  carts: Record<string, Cart>;
  favorites: Record<string, string[]>;
  wallets: Record<string, Wallet[]>;
  quotes: Record<string, { owner: string; quote: Quote }>;
  orders: Record<string, Order>;
  attempts: Record<string, { orderId: string; body: string }>;
  demo: DemoConfig;
}

const KEY = "kurio.database.v3";

export let db: Database;

export const persist = () => localStorage.setItem(KEY, JSON.stringify(db));

export async function resetDatabase() {
  const users = await Promise.all(
    userFixtures.map(async (u) => ({
      ...u,
      salt: u.id,
      passwordHash: await hashPassword("Kurio123!", u.id),
    })),
  );

  db = {
    schema: 3,
    nfts: structuredClone(nftFixtures),
    users,
    sessions: {},
    carts: { guest: { items: [], coupon: "", version: 1 } },
    favorites: {},
    wallets: Object.fromEntries(users.map((u) => [u.id, walletFixtures(u)])),
    quotes: {},
    orders: {},
    attempts: {},
    demo: { scenario: "standard", latency: 160, paymentDelay: 1800 },
  };

  persist();
}

export async function initializeDatabase() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "");

    if (stored.schema !== 3) throw Error();

    db = stored;
  } catch {
    await resetDatabase();
  }
}

export function getCart(owner: string): Cart {
  return (
    db.carts[owner] ?? (db.carts[owner] = { items: [], coupon: "", version: 1 })
  );
}

export const publicUser = (u: StoredUser): User => ({
  id: u.id,
  name: u.name,
  username: u.username,
  email: u.email,
  ens: u.ens,
  walletNickname: u.walletNickname,
  avatar: u.avatar,
});

export function sessionFor(token: string | null) {
  const s = token ? db.sessions[token] : null;

  return s && s.expiresAt > Date.now() ? s : null;
}

export const tokenFrom = (request: Request) =>
  request.headers.get("Authorization")?.replace(/^Bearer /, "") || null;

export function ownerFor(request: Request) {
  const token = tokenFrom(request);
  const session = sessionFor(token);

  if (token && !session)
    throw new MockError(
      "Sua sessão expirou. Entre novamente para continuar.",
      401,
      "SESSION_EXPIRED",
    );

  return session?.userId || "guest";
}

export function requireUser(request: Request) {
  const owner = ownerFor(request);

  if (owner === "guest")
    throw new MockError("Entre para continuar.", 401, "UNAUTHORIZED");

  return db.users.find((u) => u.id === owner)!;
}

export class MockError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "VALIDATION",
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
