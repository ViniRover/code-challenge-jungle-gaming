import { useSession } from "../../auth/hooks";
import { AccountLayout } from "../../../widgets/layout/account-layout";
import { ProfileForm } from "../components/profile-form";
import { PasswordForm } from "../components/password-form";
import { usePageTitle } from "../../../shared/hooks/use-page-title";
export default function ProfilePage() {
  usePageTitle("Perfil do colecionador");
  const { data } = useSession();
  if (!data) return null;
  return (
    <AccountLayout>
      <h1>Perfil do colecionador</h1>
      <ProfileForm key={data.user.id} user={data.user} />
      <PasswordForm />
    </AccountLayout>
  );
}
