import type { Nft, User, Wallet } from "../shared/domain/models";
const names = [
  "Emerald Ape #042",
  "Sage Nomad #009",
  "Neon Vessel #552",
  "Cosmic Bloom #118",
  "Violet Nomad #314",
  "Ivory Baron #088",
  "Golden Beat #207",
  "Golden Frequency #071",
  "Golden Signal #160",
];
const ids = ["042", "009", "552", "118", "314", "088", "207", "071", "160"];
const prices = [
  "1.19",
  "1.69",
  "1.99",
  "1.29",
  "1.39",
  "1.79",
  "0.99",
  "0.59",
  "0.39",
];
const images = [
  "emerald",
  "violet",
  "ivory",
  "violet",
  "violet",
  "ivory",
  "golden",
  "golden",
  "golden",
];
const categories = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];
export const nftFixtures: Nft[] = Array.from({ length: 36 }, (_, index) => {
  const i = index % 9;
  return {
    id: index < 9 ? ids[i] : String(600 + index),
    name: index < 9 ? names[i] : `${names[i].split(" #")[0]} #${600 + index}`,
    image: `/assets/${images[i]}.webp`,
    price: prices[i],
    previousPrice: i === 2 ? "2.29" : undefined,
    category: categories[index % 9],
    network: (["Ethereum", "Polygon", "Solana"] as const)[
      Math.floor(index / 3) % 3
    ],
    collection: "Kurio Apes",
    editions: { "1/1": 1, "1/10": 10, "1/50": 50, ABERTA: 100 },
    version: 1,
    featured: index % 3 === 0,
    createdAt: 36 - index,
  };
});
export const userFixtures: User[] = [
  {
    id: "collector-1",
    name: "Nova Store",
    username: "nova",
    email: "nova@kurio.test",
    ens: "nova.kurio.eth",
    walletNickname: "Principal",
    avatar: "",
  },
  {
    id: "collector-2",
    name: "Luna Silva",
    username: "luna",
    email: "luna@kurio.test",
    ens: "luna.eth",
    walletNickname: "Reserva",
    avatar: "",
  },
];
export const walletFixtures = (user: User): Wallet[] => [
  {
    id: `${user.id}-main`,
    name: "Principal",
    address: "0xA91F" + "1234567890abcdef1234567890abcdef12" + "E82C",
    network: "Ethereum",
    type: "MetaMask",
    primary: true,
    profileName: user.username,
    email: user.email,
    ens: user.ens,
    referral: "KURIO",
  },
  {
    id: `${user.id}-reserve`,
    name: "Reserva",
    address: "0xB92F" + "1234567890abcdef1234567890abcdef12" + "F93D",
    network: "Polygon",
    type: "Coinbase Wallet",
    primary: false,
    profileName: user.username,
    email: user.email,
    ens: user.ens,
    referral: "KURIO",
  },
];
