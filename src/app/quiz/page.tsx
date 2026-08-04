import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuizWizard } from "@/components/quiz/quiz-wizard";

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/quiz");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <QuizWizard initialProfile={profile} />
    </div>
  );
}
