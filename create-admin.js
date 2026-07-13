const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = "medofadel100@gmail.com";
  const password = "11a22b33c";
  
  console.log(`Creating user ${email}...`);
  const { data: userRes, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError) {
    console.error("Auth creation failed:", userError.message);
    if (!userError.message.includes("already registered")) {
      return;
    }
  }

  let userId;
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = usersData?.users.find(u => u.email === email);
  if (existingUser) {
    userId = existingUser.id;
    console.log(`Found user ${userId}, updating password...`);
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
    if (updateErr) console.error("Update password failed:", updateErr.message);
  } else {
    console.error("User really not found!");
    return;
  }

  console.log(`User created/found with ID: ${userId}`);

  console.log("Upserting into platform_admins...");
  const { error: adminError } = await supabase.from("platform_admins").upsert({
    auth_user_id: userId,
    full_name: "Ahmed (medofadel100)",
    role: "super_admin",
    preferred_language: "ar",
    is_active: true,
  }, { onConflict: "auth_user_id" });

  if (adminError) {
    console.error("Failed to insert platform_admin:", adminError.message);
    return;
  }

  console.log("Success! You can now log in with medofadel100@gmail.com.");
}

main().catch(console.error);
