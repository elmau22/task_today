-- ==============================================================================
-- SKEMA BASIS DATA SUPABASE UNTUK TASK TODAY (v2.0)
-- Buka dashboard Supabase -> Masuk ke "SQL Editor" -> Tempel seluruh kode ini -> Klik "Run"
-- ==============================================================================

-- 1. Tabel Profil & Peran Pengguna (Admin, Dosen, Mahasiswa)
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text,
  identity_number text,
  role text not null default 'mahasiswa' check (role in ('admin', 'dosen', 'mahasiswa')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Tugas Perkuliahan
create table if not exists public.assignments (
  id text primary key default gen_random_uuid()::text,
  owner_id text,
  title text not null,
  student_name text,
  description text default '',
  file_type text default 'pdf',
  file_url text default '#',
  cover_url text default '',
  mata_kuliah text,
  dosen_pengampu text,
  prodi text,
  universitas text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel Modul Materi Perkuliahan
create table if not exists public.materials (
  id text primary key default gen_random_uuid()::text,
  owner_id text,
  meeting_number integer default 1,
  title text not null,
  description text default '',
  file_type text default 'pdf',
  file_url text default '#',
  cover_url text default '',
  mata_kuliah text,
  dosen_pengampu text,
  prodi text,
  universitas text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Artikel Blog
create table if not exists public.blogs (
  id text primary key default gen_random_uuid()::text,
  owner_id text,
  title text not null,
  slug text,
  category text,
  author text,
  date text,
  read_time text,
  cover_url text default '',
  summary text default '',
  content text default '',
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Publikasi Jurnal Ilmiah
create table if not exists public.journals (
  id text primary key default gen_random_uuid()::text,
  owner_id text,
  title text not null,
  authors text not null,
  abstract text default '',
  keywords text default '',
  category text default '',
  year integer default extract(year from now()),
  volume text default '',
  issue text default '',
  doi text default '',
  file_url text default '',
  cover_url text default '',
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  review_note text default '',
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone
);

-- 6. Tabel Profil Pendiri
create table if not exists public.founders (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  position text default '',
  bio text default '',
  photo_url text default '',
  email text default '',
  linkedin_url text default '',
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabel Pesan Masuk Formulir Kontak (ke info@lokalkreatif.com)
create table if not exists public.contact_messages (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  subject text default '',
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Tabel Audit Log Penghapusan Berkas
create table if not exists public.deletion_logs (
  id text primary key default gen_random_uuid()::text,
  item_type text,
  item_title text,
  deleted_by text,
  reason text,
  deleted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- PENGATURAN HAK AKSES PERMISIF (RLS)
-- Memungkinkan akses baca publik dan akses tulis bagi aplikasi web
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.assignments enable row level security;
alter table public.materials enable row level security;
alter table public.blogs enable row level security;
alter table public.journals enable row level security;
alter table public.founders enable row level security;
alter table public.contact_messages enable row level security;
alter table public.deletion_logs enable row level security;

-- Kebijakan Akses: Akses Publik Bebas Baca, Tulis Diizinkan
create policy "Allow all read profiles" on public.profiles for select using (true);
create policy "Allow all modify profiles" on public.profiles for all using (true);

create policy "Allow all read assignments" on public.assignments for select using (true);
create policy "Allow all modify assignments" on public.assignments for all using (true);

create policy "Allow all read materials" on public.materials for select using (true);
create policy "Allow all modify materials" on public.materials for all using (true);

create policy "Allow all read blogs" on public.blogs for select using (true);
create policy "Allow all modify blogs" on public.blogs for all using (true);

create policy "Allow all read journals" on public.journals for select using (true);
create policy "Allow all modify journals" on public.journals for all using (true);

create policy "Allow all read founders" on public.founders for select using (true);
create policy "Allow all modify founders" on public.founders for all using (true);

create policy "Allow all read contact_messages" on public.contact_messages for select using (true);
create policy "Allow all modify contact_messages" on public.contact_messages for all using (true);

create policy "Allow all read deletion_logs" on public.deletion_logs for select using (true);
create policy "Allow all modify deletion_logs" on public.deletion_logs for all using (true);

-- Insert Akun Admin Default di profiles (jika belum ada)
insert into public.profiles (id, name, email, identity_number, role)
values 
  ('admin_root', 'Administrator Task Today', 'admin@lokalkreatif.com', 'ADMIN01', 'admin'),
  ('admin_farael', 'Mohamad Farael Maulana (Admin)', 'faraelmaulana22@gmail.com', '240511086', 'admin')
on conflict (id) do update set role = 'admin', email = excluded.email;
