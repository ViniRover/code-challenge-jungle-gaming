import { applyFormErrors } from "../../../shared/api/form-errors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { profileSchema } from "../../../shared/domain/validation";
import type { Session, User } from "../../../shared/domain/models";
import { Field } from "../../../shared/ui/field";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/ui/feedback";
import { accountApi } from "../api";
import { keys } from "../../../shared/api/keys";
export function ProfileForm({ user }: { user: User }) {
  const qc = useQueryClient();
  const form = useForm<Omit<User, "id">>({
    resolver: zodResolver(profileSchema),
    defaultValues: user,
  });
  const avatar = form.watch("avatar");
  const m = useMutation({
    mutationFn: accountApi.update,
    onError: (error) => applyFormErrors(error, form.setError),
    onSuccess: (data) => {
      qc.setQueryData<Session>(keys.session, (old) =>
        old?.user.id === data.id ? { ...old, user: data } : old,
      );
      toast.success("Perfil atualizado.");
    },
  });
  const fields = [
    ["name", "Nome de exibição"],
    ["username", "Nome de usuário"],
    ["email", "E-mail"],
    ["ens", "Nome ENS"],
    ["walletNickname", "Apelido da carteira"],
  ] as const;
  return (
    <form onSubmit={form.handleSubmit((data) => m.mutate(data))} noValidate>
      <div className="form-grid">
        {fields.map(([key, label]) => (
          <Field
            key={key}
            label={label}
            id={key}
            required={["name", "username", "email"].includes(key)}
            {...form.register(key)}
            error={form.formState.errors[key]?.message}
          />
        ))}
        <div className="avatar-field">
          <label htmlFor="avatar">Avatar</label>
          <div>
            {avatar ? (
              <img src={avatar} alt="Seu avatar" width="50" height="50" />
            ) : (
              <span>
                <ImagePlus />
              </span>
            )}
            <label className="avatar-upload" htmlFor="avatar">
              Alterar
            </label>
            <input
              id="avatar"
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (
                  file.size > 400000 ||
                  !["image/png", "image/jpeg", "image/webp"].includes(file.type)
                ) {
                  toast.error("Escolha PNG, JPG ou WebP de até 400 KB.");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () =>
                  form.setValue("avatar", String(reader.result), {
                    shouldDirty: true,
                  });
                reader.readAsDataURL(file);
              }}
            />
            <button
              type="button"
              onClick={() => form.setValue("avatar", "", { shouldDirty: true })}
            >
              Remover
            </button>
          </div>
        </div>
      </div>
      {m.isError && <ErrorState error={m.error} />}
      <Button type="submit" disabled={m.isPending} className="form-save">
        Salvar perfil
      </Button>
    </form>
  );
}
