export type Network = "Ethereum" | "Polygon" | "Solana";
export type Edition = "1/1" | "1/10" | "1/50" | "ABERTA";
export interface Nft {
  id: string;
  name: string;
  image: string;
  category: string;
  network: Network;
  collection: string;
  price: string;
  previousPrice?: string;
  editions: Record<Edition, number>;
  version: number;
  featured: boolean;
  createdAt: number;
}
export interface CatalogSearch {
  q?: string;
  category?: string;
  network?: string;
  sort?: string;
  page?: number;
  min?: string;
  max?: string;
  tab?: string;
}
export interface CatalogPage {
  items: Nft[];
  total: number;
  page: number;
  pageSize: number;
}
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  ens: string;
  walletNickname: string;
  avatar: string;
}
export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}
export interface CartLine {
  nftId: string;
  edition: Edition;
  quantity: number;
}
export interface Cart {
  items: CartLine[];
  coupon: string;
  version: number;
}
export interface QuoteLine extends CartLine {
  name: string;
  image: string;
  unitPrice: string;
  total: string;
  network: Network;
  nftVersion: number;
}
export interface Quote {
  id: string;
  fingerprint: string;
  items: QuoteLine[];
  coupon: string;
  subtotal: string;
  discount: string;
  fee: string;
  total: string;
  expiresAt: number;
}
export interface Wallet {
  id: string;
  name: string;
  address: string;
  network: Network;
  type: "MetaMask" | "WalletConnect" | "Coinbase Wallet";
  primary: boolean;
  profileName: string;
  email: string;
  ens: string;
  referral: string;
}
export interface OrderRequest {
  quoteId: string;
  walletId: string;
  collector: { name: string; email: string; note: string };
}
export interface Order {
  id: string;
  userId: string;
  status: "pending" | "confirmed" | "declined";
  version: number;
  quote: Quote;
  wallet: Wallet;
  collector: OrderRequest["collector"];
  transaction: string;
  createdAt: number;
  resolvesAt: number;
  declineReason?: string;
}
export interface ResourceEvent<T> {
  id: string;
  resourceId: string;
  version: number;
  userId?: string;
  data: T;
}
export interface ApiError {
  message: string;
  code: string;
  fields?: Record<string, string>;
}
export type Scenario =
  | "standard"
  | "empty"
  | "slow"
  | "out-of-order"
  | "offline"
  | "server-error"
  | "forbidden"
  | "favorite-error"
  | "expired-session"
  | "coupon-expired"
  | "payment-declined"
  | "order-timeout"
  | "pending-order";
export interface DemoConfig {
  scenario: Scenario;
  latency: number;
  paymentDelay: number;
}
