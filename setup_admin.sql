DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'medofadel100@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Update password and confirm email
    UPDATE auth.users 
    SET 
      encrypted_password = crypt('11a22b33c', gen_salt('bf')),
      email_confirmed_at = now()
    WHERE id = target_user_id;

    -- Upsert into platform_admins
    INSERT INTO public.platform_admins (auth_user_id, full_name, role, preferred_language, is_active)
    VALUES (target_user_id, 'Ahmed (medofadel100)', 'super_admin', 'ar', true)
    ON CONFLICT (auth_user_id) DO UPDATE SET
      role = 'super_admin',
      is_active = true;
      
    RAISE NOTICE 'Updated user medofadel100@gmail.com and granted super_admin.';
  ELSE
    RAISE EXCEPTION 'User medofadel100@gmail.com not found. Create it in the UI first.';
  END IF;
END $$;
