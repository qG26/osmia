import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="font-serif text-3xl">Bon retour.</h1>
      <p className="mt-2 text-foreground/60">
        Connectez-vous pour retrouver vos recommandations.
      </p>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
