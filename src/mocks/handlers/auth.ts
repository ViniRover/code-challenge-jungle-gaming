import { http } from "msw";
import {
  db,
  getCart,
  MockError,
  ownerFor,
  persist,
  publicUser,
  sessionFor,
  tokenFrom,
} from "../database";
import { endpoint } from "./endpoint";
import { hashPassword } from "../password";
import { loginSchema, registerSchema } from "../../shared/domain/validation";

function signIn(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 3600000;

  db.sessions[token] = { userId, expiresAt };

  const target = getCart(userId),
    guest = getCart("guest");

  for (const line of guest.items) {
    const item = target.items.find(
      (i) => i.nftId === line.nftId && i.edition === line.edition,
    );

    const stock =
      db.nfts.find((n) => n.id === line.nftId)?.editions[line.edition] || 0;

    if (item) item.quantity = Math.min(stock, item.quantity + line.quantity);
    else
      target.items.push({ ...line, quantity: Math.min(stock, line.quantity) });
  }

  target.items = target.items.filter((i) => i.quantity > 0);

  if (!target.coupon) target.coupon = guest.coupon;

  target.version++;
  db.carts.guest = { items: [], coupon: "", version: guest.version + 1 };
  persist();

  return {
    user: publicUser(db.users.find((u) => u.id === userId)!),
    token,
    expiresAt,
  };
}

export const authHandlers = [
  http.get(
    "/api/session",
    endpoint((request) => {
      const token = tokenFrom(request);

      if (!token) return null;

      ownerFor(request);

      const session = sessionFor(token)!;

      return {
        token,
        expiresAt: session.expiresAt,
        user: publicUser(db.users.find((u) => u.id === session.userId)!),
      };
    }),
  ),
  http.post(
    "/api/session",
    endpoint(async (request) => {
      const data = loginSchema.parse(await request.json());

      const user = db.users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase(),
      );

      if (
        !user ||
        user.passwordHash !== (await hashPassword(data.password, user.salt))
      )
        throw new MockError(
          "E-mail ou senha inválidos.",
          422,
          "INVALID_CREDENTIALS",
        );

      return signIn(user.id);
    }),
  ),
  http.post(
    "/api/users",
    endpoint(async (request) => {
      const data = registerSchema.parse(await request.json());

      if (
        db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())
      )
        throw new MockError(
          "Este e-mail já está cadastrado.",
          409,
          "EMAIL_CONFLICT",
          { email: "Este e-mail já está cadastrado." },
        );

      const salt = crypto.randomUUID();

      const user = {
        id: crypto.randomUUID(),
        name: data.name,
        username: data.name,
        email: data.email,
        ens: "",
        walletNickname: "",
        avatar: "",
        salt,
        passwordHash: await hashPassword(data.password, salt),
      };

      db.users.push(user);

      return signIn(user.id);
    }),
  ),
  http.delete(
    "/api/session",
    endpoint((request) => {
      const token = tokenFrom(request);

      if (token) delete db.sessions[token];

      persist();

      return {};
    }),
  ),
];
