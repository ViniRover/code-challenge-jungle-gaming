import { applyFormErrors } from "../../../shared/api/form-errors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { passwordSchema } from "../../../shared/domain/validation";
import { accountApi } from "../api";
import { Field } from "../../../shared/ui/field";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/ui/feedback";

export function PasswordForm() {
  const form = useForm<{
    currentPassword: string;
    password: string;
    confirm: string;
  }>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", password: "", confirm: "" },
  });

  const m = useMutation({
    mutationFn: accountApi.password,
    onError: (error) => applyFormErrors(error, form.setError),
    onSuccess: () => {
      form.reset();
      toast.success("Senha alterada.");
    },
  });

  return (
    <form
      className="password-form"
      onSubmit={form.handleSubmit((data) => m.mutate(data))}
      noValidate
    >
      <h2>Alterar senha</h2>
      {(
        [
          ["currentPassword", "Senha atual"],
          ["password", "Nova senha"],
          ["confirm", "Confirmar nova senha"],
        ] as const
      ).map(([key, label]) => (
        <Field
          key={key}
          label={label}
          id={key}
          type="password"
          autoComplete={
            key === "currentPassword" ? "current-password" : "new-password"
          }
          {...form.register(key)}
          error={form.formState.errors[key]?.message}
        />
      ))}
      {m.isError && <ErrorState error={m.error} />}
      <Button type="submit" disabled={m.isPending}>
        Alterar senha
      </Button>
    </form>
  );
}
