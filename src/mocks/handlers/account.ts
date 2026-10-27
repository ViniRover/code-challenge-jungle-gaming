import { http } from "msw";
import { db, MockError, persist, publicUser, requireUser } from "../database";
import { endpoint } from "./endpoint";
import {
  passwordSchema,
  profileSchema,
  walletSchema,
} from "../../shared/domain/validation";
import { hashPassword } from "../password";

export const connectionHandlers = [
  http.post(
    "/api/connections",
    endpoint(async (request) => {
      const user = requireUser(request);

      const { walletId, decision } = (await request.json()) as {
        walletId: string;
        decision: string;
      };

      if (!db.wallets[user.id]?.some((w) => w.id === walletId))
        throw new MockError("Carteira não encontrada.", 404, "NOT_FOUND");

      if (decision !== "accept")
        throw new MockError(
          "Conexão recusada pela carteira.",
          422,
          "CONNECTION_DECLINED",
        );

      return { connected: true, walletId };
    }),
  ),
];

export const accountHandlers = [
  http.get(
    "/api/profile",
    endpoint((request) => publicUser(requireUser(request))),
  ),
  http.put(
    "/api/profile",
    endpoint(async (request) => {
      const user = requireUser(request);
      const data = profileSchema.parse(await request.json());

      if (
        db.users.some(
          (u) =>
            u.id !== user.id &&
            u.email.toLowerCase() === data.email.toLowerCase(),
        )
      )
        throw new MockError(
          "Este e-mail já está em uso.",
          409,
          "EMAIL_CONFLICT",
          { email: "E-mail já utilizado." },
        );

      Object.assign(user, data);
      persist();

      return publicUser(user);
    }),
  ),
  http.put(
    "/api/profile/password",
    endpoint(async (request) => {
      const user = requireUser(request);
      const data = passwordSchema.parse(await request.json());

      if (
        (await hashPassword(data.currentPassword, user.salt)) !==
        user.passwordHash
      )
        throw new MockError(
          "A senha atual está incorreta.",
          422,
          "INVALID_PASSWORD",
          { currentPassword: "Senha atual incorreta." },
        );

      user.passwordHash = await hashPassword(data.password, user.salt);
      persist();

      return {};
    }),
  ),
  http.get(
    "/api/wallets",
    endpoint((request) => db.wallets[requireUser(request).id] || []),
  ),
  http.put(
    "/api/wallets",
    endpoint(async (request) => {
      const user = requireUser(request);
      const data = walletSchema.parse(await request.json());
      const wallets = db.wallets[user.id] || [];

      if (
        wallets.some(
          (w) =>
            w.id !== data.id &&
            w.address === data.address &&
            w.network === data.network,
        )
      )
        throw new MockError(
          "Esta carteira já está cadastrada.",
          409,
          "WALLET_CONFLICT",
        );

      if (data.primary) wallets.forEach((w) => (w.primary = false));

      db.wallets[user.id] = [...wallets.filter((w) => w.id !== data.id), data];
      persist();

      return db.wallets[user.id];
    }),
  ),
  http.get(
    "/api/favorites",
    endpoint((request) => db.favorites[requireUser(request).id] || []),
  ),
  http.put(
    "/api/favorites/:id",
    endpoint(async (request, { id }) => {
      const user = requireUser(request);

      if (!db.nfts.some((n) => n.id === id))
        throw new MockError("NFT não encontrado.", 404, "NOT_FOUND");

      const { selected } = (await request.json()) as { selected: boolean };
      const items = db.favorites[user.id] || [];

      db.favorites[user.id] = selected
        ? [...new Set([...items, String(id)])]
        : items.filter((i) => i !== id);

      persist();

      return db.favorites[user.id];
    }),
  ),
];
