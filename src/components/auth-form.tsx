"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        setError(traduireErreur(error.message));
        return;
      }
      setMessage(
        "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(traduireErreur(error.message));
      return;
    }
    router.push("/quiz");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-accent">{message}</p>}

      <Button type="submit" disabled={loading} className="mt-2">
        {loading
          ? "Un instant…"
          : mode === "login"
            ? "Se connecter"
            : "Créer mon compte"}
      </Button>

      <p className="text-center text-sm text-foreground/60">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Créer un compte
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function traduireErreur(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return "Un compte existe déjà avec cette adresse.";
  }
  if (message.includes("Password should be")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  return message;
}
