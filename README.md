# WellNex02

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## About WellNex02

WellNex02 is a platform for booking hyperbaric oxygen therapy (HBOT) sessions. The application allows users to create accounts, book sessions at different locations, and manage their appointments.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Scheduling System (ATMOS)

To enable admin-managed availability, create the `schedule_slots` table in Supabase:

```sql
-- Enable uuid extension if not already
create extension if not exists "uuid-ossp";

create table public.schedule_slots (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  time text not null,                -- e.g. '9:00 AM'
  duration integer not null,         -- minutes (60/90/120)
  seats_total integer not null default 4,
  seats_available integer not null,  -- initially = seats_total
  created_at timestamptz default now(),
  unique (date, time)
);

-- Keep seats_available in sync on insert/update
create or replace function public.reset_available()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    NEW.seats_available := NEW.seats_total;
  elsif TG_OP = 'UPDATE' and NEW.seats_total <> OLD.seats_total then
    NEW.seats_available := NEW.seats_total;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_reset_available
before insert or update on public.schedule_slots
for each row execute function public.reset_available();

-- Reduce seats when a booking is made
create or replace function public.decrement_available()
returns trigger as $$
begin
  update public.schedule_slots
  set seats_available = greatest(seats_available - NEW.group_size, 0)
  where date = NEW.date and time = NEW.time;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_decrement_after_booking
after insert on public.bookings
for each row execute function public.decrement_available();

-- RLS examples (adjust to your needs)
alter table public.schedule_slots enable row level security;
create policy "public read" on public.schedule_slots
  for select using (true);
create policy "admin write" on public.schedule_slots
  for all using (auth.role() = 'service_role');
```

Admin endpoints: `/api/admin/schedule` (GET ‑ list, POST ‑ upsert, DELETE) – secured via Server-Role key.

Public endpoint: `/api/schedule?date=YYYY-MM-DD` returns `{ available: ["9:00 AM", ...] }` and the booking form only enables those times.
