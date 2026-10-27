import { z } from "zod";
const name = z
  .string()
  .trim()
  .min(2, "Informe pelo menos 2 caracteres.")
  .max(80, "Use até 80 caracteres.");
export const email = z.string().trim().email("Informe um e-mail válido.");
export const password = z
  .string()
  .min(8, "Use pelo menos 8 caracteres.")
  .max(128);
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});
export const registerSchema = z
  .object({ name, email, password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem.",
  });
export const profileSchema = z.object({
  name,
  username: name,
  email,
  ens: z.string().max(100),
  walletNickname: z.string().max(80),
  avatar: z.string().max(600000),
});
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem.",
  });
export const walletSchema = z
  .object({
    id: z.string(),
    name,
    address: z.string().min(1, "Informe o endereço."),
    network: z.enum(["Ethereum", "Polygon", "Solana"]),
    type: z.enum(["MetaMask", "WalletConnect", "Coinbase Wallet"]),
    primary: z.boolean(),
    profileName: name,
    email,
    ens: z.string().max(100),
    referral: z.string().min(2, "Informe o código de indicação."),
  })
  .superRefine((v, ctx) => {
    const valid =
      v.network === "Solana"
        ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v.address)
        : /^0x[0-9a-fA-F]{40}$/.test(v.address);
    if (!valid)
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Endereço incompatível com a rede selecionada.",
      });
  });
export const collectorSchema = z.object({
  name,
  email,
  note: z.string().max(500, "Use até 500 caracteres."),
});
