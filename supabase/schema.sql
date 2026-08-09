-- NoviDom Immo — Supabase-Schema
-- Im Supabase-Projekt unter "SQL Editor" komplett einfügen und ausführen.
-- Sicher erneut ausführbar (IF NOT EXISTS / DROP POLICY IF EXISTS).

-- ---------------------------------------------------------------------
-- profiles: ein Eintrag pro Auth-User, hält die Rolle (customer/admin)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- security definer: läuft mit Owner-Rechten und umgeht RLS - dadurch keine
-- Endlos-Rekursion, wenn eine profiles-Policy die Admin-Rolle prüfen muss.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

-- Legt automatisch ein profiles-Row an, sobald sich jemand registriert.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- listings: ein Inserat pro verkaufter/verkaufender Immobilie
-- ---------------------------------------------------------------------
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id) on delete set null,
  address text not null,
  city text not null,
  postal_code text,
  lat double precision,
  lng double precision,
  price_chf integer,
  status text not null default 'active' check (status in ('active', 'reserved', 'sold', 'draft')),
  views integer not null default 0,
  tour_views integer not null default 0,
  expose_downloads integer not null default 0,
  viewing_requests integer not null default 0,
  created_at timestamptz not null default now()
);

alter table listings enable row level security;

drop policy if exists "listings_select_own_or_admin" on listings;
create policy "listings_select_own_or_admin" on listings
  for select using (
    owner_id = auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "listings_admin_write" on listings;
create policy "listings_admin_write" on listings
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Öffentliche, nicht-personenbezogene Übersicht für die Karte auf der
-- Startseite (nur Lage + Status, keine Preise/Namen).
drop policy if exists "listings_public_map_view" on listings;
create policy "listings_public_map_view" on listings
  for select using (status in ('active', 'reserved', 'sold'));

-- ---------------------------------------------------------------------
-- listing_documents / listing_activity: Inhalte des Verkaufs-Cockpits
-- ---------------------------------------------------------------------
create table if not exists listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  name text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table listing_documents enable row level security;

drop policy if exists "listing_documents_owner_or_admin" on listing_documents;
create policy "listing_documents_owner_or_admin" on listing_documents
  for select using (
    exists (
      select 1 from listings l
      where l.id = listing_documents.listing_id
        and (l.owner_id = auth.uid() or exists (
          select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

drop policy if exists "listing_documents_admin_write" on listing_documents;
create policy "listing_documents_admin_write" on listing_documents
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create table if not exists listing_activity (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table listing_activity enable row level security;

drop policy if exists "listing_activity_owner_or_admin" on listing_activity;
create policy "listing_activity_owner_or_admin" on listing_activity
  for select using (
    exists (
      select 1 from listings l
      where l.id = listing_activity.listing_id
        and (l.owner_id = auth.uid() or exists (
          select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
        ))
    )
  );

drop policy if exists "listing_activity_admin_write" on listing_activity;
create policy "listing_activity_admin_write" on listing_activity
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------------------------------------------------------------------
-- leads: Formular-Einsendungen (Bewertungsanfrage, Kontakt, Zugang)
-- ---------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'valuation', 'access_request')),
  name text not null,
  email text not null,
  phone text,
  message text,
  listing_id uuid references listings (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- Formulare auf der öffentlichen Website dürfen Leads anlegen, aber nicht lesen.
drop policy if exists "leads_public_insert" on leads;
create policy "leads_public_insert" on leads
  for insert with check (true);

drop policy if exists "leads_admin_select" on leads;
create policy "leads_admin_select" on leads
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ---------------------------------------------------------------------
-- Um dich selbst zum Admin zu machen: nach dem ersten Signup unter
-- /admin/login (der Signup legt automatisch ein Kundenprofil an) hier
-- deine E-Mail eintragen und ausführen:
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'DEINE-EMAIL@example.com');
-- ---------------------------------------------------------------------
