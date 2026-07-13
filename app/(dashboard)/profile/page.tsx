import { createClient } from "@/lib/supabase/server";
import { ProfileForms } from "./_components/profile-forms";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!admin) {
    return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">My Profile</h1>
        <p className="text-slate-600">Update your account settings and password.</p>
      </div>

      <ProfileForms 
        initialName={admin.full_name} 
        initialLanguage={admin.preferred_language} 
        email={user.email || ""}
        role={admin.role}
      />
    </div>
  );
}
