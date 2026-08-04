import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-xl tracking-tight">
          OSMIA
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-foreground/70 md:flex">
          <Link href="/decouverte" className="hover:text-foreground">
            Découverte
          </Link>
          <Link href="/quiz" className="hover:text-foreground">
            Le quiz
          </Link>
          {user && (
            <>
              <Link href="/resultats" className="hover:text-foreground">
                Recommandations
              </Link>
              <Link href="/collection" className="hover:text-foreground">
                Ma collection
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/profil" className="hidden text-sm text-foreground/70 hover:text-foreground sm:inline">
                Mon profil
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
