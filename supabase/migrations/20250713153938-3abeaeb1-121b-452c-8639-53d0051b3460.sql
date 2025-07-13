-- Create admin profiles with specific UUIDs for testing
INSERT INTO public.profiles (id, email, minecraft_username, full_name, grade, is_admin, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@test.com', 'TestAdmin', 'Test Admin', 'Admin', TRUE, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'avivm0900@gmail.com', 'AviAdmin', 'Avi Admin', 'Admin', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  minecraft_username = EXCLUDED.minecraft_username,
  full_name = EXCLUDED.full_name,
  grade = EXCLUDED.grade,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();