import { applyFormErrors } from "../../../shared/api/form-errors";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../api";
import { useSessionActions } from "../hooks";
import { loginSchema, registerSchema } from "../../../shared/domain/validation";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/ui/feedback";
export function AuthForm({
  registerMode,
  redirect,
}: {
  registerMode: boolean;
  redirect: string;
}) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { accept } = useSessionActions();
  const schema = registerMode ? registerSchema : loginSchema;
  const form = useForm<{
    name?: string;
    email: string;
    password: string;
    confirm?: string;
  }>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });
  const m = useMutation({
    mutationFn: (data: {
      name?: string;
      email: string;
      password: string;
      confirm?: string;
    }) =>
      registerMode
        ? authApi.register({
            ...data,
            name: data.name || "",
            confirm: data.confirm || "",
          })
        : authApi.login(data),
    onError: (error) => applyFormErrors(error, form.setError),
    onSuccess: async (session) => {
      await accept(session);
      await navigate({ to: redirect });
      toast.success(
        registerMode
          ? "Conta criada. Bem-vindo à Kurio!"
          : "Bem-vindo de volta.",
      );
    },
  });
  const input = (
    name: "name" | "email" | "password" | "confirm",
    placeholder: string,
    type = "text",
  ) => (
    <div className="auth-input">
      <label className="sr-only" htmlFor={`auth-${name}`}>
        {placeholder}
      </label>
      <input
        id={`auth-${name}`}
        placeholder={placeholder}
        type={type}
        autoComplete={
          name === "email"
            ? "email"
            : name === "password"
              ? registerMode
                ? "new-password"
                : "current-password"
              : name === "name"
                ? "username"
                : "new-password"
        }
        aria-invalid={!!form.formState.errors[name]}
        aria-describedby={
          form.formState.errors[name] ? `auth-${name}-error` : undefined
        }
        {...form.register(name)}
      />
      {name === "password" && (
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
      {form.formState.errors[name] && (
        <p id={`auth-${name}-error`} role="alert" className="field-error">
          {form.formState.errors[name]?.message}
        </p>
      )}
    </div>
  );
  return (
    <>
      <form onSubmit={form.handleSubmit((data) => m.mutate(data))} noValidate>
        {registerMode && input("name", "Nome de usuário")}
        {input("email", "E-mail", "email")}
        {input("password", "Senha", visible ? "text" : "password")}
        {registerMode &&
          input("confirm", "Confirmar senha", visible ? "text" : "password")}
        {!registerMode && (
          <button
            type="button"
            className="forgot-password"
            onClick={() =>
              toast.info(
                "Recuperação por e-mail indisponível na demonstração. Use nova@kurio.test com a senha Kurio123! ou crie outra conta.",
              )
            }
          >
            Esqueceu a senha?
          </button>
        )}
        {m.isError && <ErrorState error={m.error} />}
        <Button className="w-full auth-submit" size="lg" disabled={m.isPending}>
          {m.isPending ? "Aguarde…" : registerMode ? "Criar conta" : "Entrar"}
        </Button>
      </form>
      <div className="auth-divider">Ou continue com</div>
      <Button
        variant="outline"
        className="social-login"
        onClick={() =>
          toast.info(
            "Login social não está disponível nesta simulação. Utilize e-mail e senha.",
          )
        }
      >
        <b className="google-mark">G</b>Continuar com Google
      </Button>
      <Button
        variant="outline"
        className="social-login"
        onClick={() =>
          toast.info(
            "Login social não está disponível nesta simulação. Utilize e-mail e senha.",
          )
        }
      >
        <b className="facebook-mark">f</b>Continuar com Facebook
      </Button>
      <p className="mobile-auth-switch">
        {registerMode ? "Já tem uma conta?" : "Novo na Kurio?"}{" "}
        <Link to={registerMode ? "/login" : "/register"} search={{ redirect }}>
          {registerMode ? "Entre" : "Crie uma conta"}
        </Link>
      </p>
      <small className="demo-credentials">
        Demo: nova@kurio.test · Kurio123!
      </small>
    </>
  );
}
