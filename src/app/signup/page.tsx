import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="font-serif text-3xl">
        Votre <em className="italic">goût</em> commence ici.
      </h1>
      <p className="mt-2 text-foreground/60">
        Créez un compte pour sauvegarder votre profil olfactif et vos recommandations.
      </p>
      <div className="mt-8">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
