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
    or public.is_admin()
  );

drop policy if exists "listings_admin_write" on listings;
create policy "listings_admin_write" on listings
  for all using (
    public.is_admin()
  );

-- Öffentliche, nicht-personenbezogene Übersicht für die Karte auf der
-- Startseite (nur Lage + Status, keine Preise/Namen).
drop policy if exists "listings_public_map_view" on listings;
create policy "listings_public_map_view" on listings
  for select using (status in ('active', 'reserved', 'sold'));

-- V2: erweiterte Objektfelder (sicher mehrfach ausführbar)
alter table listings add column if not exists title text;
alter table listings add column if not exists property_type text not null default 'Haus';
alter table listings add column if not exists rooms numeric;
alter table listings add column if not exists living_area integer;
alter table listings add column if not exists description text;

-- ---------------------------------------------------------------------
-- listing_photos: Objektfotos (Dateien liegen im Storage-Bucket
-- "listing-photos", hier nur die öffentlichen URLs + Reihenfolge)
-- ---------------------------------------------------------------------
create table if not exists listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table listing_photos enable row level security;

drop policy if exists "listing_photos_public_read" on listing_photos;
create policy "listing_photos_public_read" on listing_photos
  for select using (true);

drop policy if exists "listing_photos_admin_write" on listing_photos;
create policy "listing_photos_admin_write" on listing_photos
  for all using (public.is_admin());

-- ---------------------------------------------------------------------
-- user_documents: vom Kunden selbst hochgeladene Unterlagen (Dateien im
-- privaten Bucket "kunden-dokumente" unter <user_id>/<dateiname>)
-- ---------------------------------------------------------------------
create table if not exists user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table user_documents enable row level security;

drop policy if exists "user_documents_own_or_admin" on user_documents;
create policy "user_documents_own_or_admin" on user_documents
  for all using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- Storage-Buckets + Zugriffsregeln
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('kunden-dokumente', 'kunden-dokumente', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listing-dokumente', 'listing-dokumente', false)
on conflict (id) do nothing;

-- Objektfotos: alle dürfen lesen, nur Admin lädt hoch/löscht
drop policy if exists "storage_listing_photos_read" on storage.objects;
create policy "storage_listing_photos_read" on storage.objects
  for select using (bucket_id = 'listing-photos');

drop policy if exists "storage_listing_photos_insert" on storage.objects;
create policy "storage_listing_photos_insert" on storage.objects
  for insert with check (bucket_id = 'listing-photos' and public.is_admin());

drop policy if exists "storage_listing_photos_delete" on storage.objects;
create policy "storage_listing_photos_delete" on storage.objects
  for delete using (bucket_id = 'listing-photos' and public.is_admin());

-- Kundendokumente: Kunde nur im eigenen Ordner (<user_id>/...), Admin überall
drop policy if exists "storage_kunden_docs_select" on storage.objects;
create policy "storage_kunden_docs_select" on storage.objects
  for select using (
    bucket_id = 'kunden-dokumente'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "storage_kunden_docs_insert" on storage.objects;
create policy "storage_kunden_docs_insert" on storage.objects
  for insert with check (
    bucket_id = 'kunden-dokumente'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "storage_kunden_docs_delete" on storage.objects;
create policy "storage_kunden_docs_delete" on storage.objects
  for delete using (
    bucket_id = 'kunden-dokumente'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- Verkaufsdossiers etc.: Dateien liegen im privaten Bucket
-- "listing-dokumente" unter <listing_id>/<dateiname>. Admin lädt hoch/
-- löscht, der verknüpfte Kunde darf seine eigenen Objektdokumente nur lesen.
drop policy if exists "storage_listing_dokumente_select" on storage.objects;
create policy "storage_listing_dokumente_select" on storage.objects
  for select using (
    bucket_id = 'listing-dokumente'
    and (
      public.is_admin()
      or exists (
        select 1 from listings l
        where l.id::text = (storage.foldername(name))[1]
          and l.owner_id = auth.uid()
      )
    )
  );

drop policy if exists "storage_listing_dokumente_insert" on storage.objects;
create policy "storage_listing_dokumente_insert" on storage.objects
  for insert with check (bucket_id = 'listing-dokumente' and public.is_admin());

drop policy if exists "storage_listing_dokumente_delete" on storage.objects;
create policy "storage_listing_dokumente_delete" on storage.objects
  for delete using (bucket_id = 'listing-dokumente' and public.is_admin());

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
    public.is_admin()
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
    public.is_admin()
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
    public.is_admin()
  );

drop policy if exists "leads_admin_update" on leads;
create policy "leads_admin_update" on leads
  for update using (
    public.is_admin()
  );

-- CRM-Erweiterung: Status-Pipeline, Finanzierungs-Flag (interne Weiterleitung
-- an hypotheken-analyse.ch), Newsletter-Opt-in, freies Admin-Notizfeld.
alter table leads add column if not exists status text not null default 'neu'
  check (status in ('neu', 'kontaktiert', 'termin', 'abgeschlossen', 'irrelevant'));
alter table leads add column if not exists wants_financing boolean not null default false;
alter table leads add column if not exists newsletter_opt_in boolean not null default false;
alter table leads add column if not exists admin_note text;

-- ---------------------------------------------------------------------
-- newsletter_subscribers: eigenständige Newsletter-Anmeldungen (Footer etc.)
-- ---------------------------------------------------------------------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

drop policy if exists "newsletter_subscribers_public_insert" on newsletter_subscribers;
create policy "newsletter_subscribers_public_insert" on newsletter_subscribers
  for insert with check (true);

drop policy if exists "newsletter_subscribers_admin_select" on newsletter_subscribers;
create policy "newsletter_subscribers_admin_select" on newsletter_subscribers
  for select using (
    public.is_admin()
  );

-- ---------------------------------------------------------------------
-- Admin: Inserat per E-Mail direkt einem Kundenkonto zuweisen, ohne den
-- Supabase Table Editor zu öffnen. SECURITY DEFINER, weil auth.users sonst
-- nicht über die normale Client-API abfragbar ist - die Funktion prüft
-- selbst is_admin(), bevor sie etwas tut.
-- ---------------------------------------------------------------------
create or replace function public.admin_assign_listing_owner(p_listing_id uuid, p_customer_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Nicht berechtigt.';
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_customer_email) limit 1;

  if v_user_id is null then
    raise exception 'Kein Kundenkonto mit dieser E-Mail-Adresse gefunden. Der Kunde muss sich zuerst unter /login registrieren.';
  end if;

  update listings set owner_id = v_user_id where id = p_listing_id;
end;
$$;

grant execute on function public.admin_assign_listing_owner(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- Um dich selbst zum Admin zu machen: nach dem ersten Signup unter
-- /admin/login (der Signup legt automatisch ein Kundenprofil an) hier
-- deine E-Mail eintragen und ausführen:
--
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'DEINE-EMAIL@example.com');
-- ---------------------------------------------------------------------
