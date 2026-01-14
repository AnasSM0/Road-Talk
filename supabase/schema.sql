-- Enable PostGIS for geospatial queries
create extension if not exists postgis;

-- 1. SESSIONS TABLE
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  plate_number text not null,
  vehicle_type text,
  created_at timestamptz default now(),
  last_active timestamptz default now()
);

-- Enforce unique active plates? 
-- For MVP, we'll just allow re-login or handle duplicates in app logic, 
-- but a unique index on plate_number is good if we want strict 1-session-per-plate.
create unique index idx_sessions_plate on public.sessions(plate_number);

-- 2. LOCATIONS TABLE
create table public.locations (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  geom geography(Point, 4326),
  heading float,         -- 0-360 degrees
  speed float,           -- meters/second
  updated_at timestamptz default now()
);

-- Index for fast spatial queries
create index idx_locations_geom on public.locations using gist(geom);


-- 3. RPC: UPDATE LOCATION
-- call this from client: supabase.rpc('update_location', { lat, long, h, s })
create or replace function public.update_location(
  lat float,
  long float,
  h float,
  s float
)
returns void
language plpgsql
security definer
as $$
begin
  -- Upsert location for the current user's session
  -- Note: We assume RLS or auth.uid() maps to session_id in a real auth scenario.
  -- Since we are using "Plate Auth" (custom), we might need to pass session_id explicitly 
  -- or handle it via a custom header/jwt. 
  -- FOR MVP: We will pass session_id as a parameter for simplicity, 
  -- but ideally this should be inferred from context.
  
  -- Let's refine: The client will call this. We need to know WHO the client is.
  -- Current MVP approach: Client sends their ID. (Insecure but functional for MVP "No Auth")
  -- BETTER: Client sends UUID.
  
  -- SEE UPDATED SIGNATURE NEXT BLOCK
end;
$$;

-- PROPER RPC WITH ID
create or replace function public.update_curr_location(
  p_session_id uuid,
  lat float,
  long float,
  h float,
  s float
)
returns void
language plpgsql
as $$
begin
  insert into public.locations (session_id, geom, heading, speed, updated_at)
  values (
    p_session_id,
    st_point(long, lat)::geography,
    h,
    s,
    now()
  )
  on conflict (session_id) do update
  set 
    geom = excluded.geom,
    heading = excluded.heading,
    speed = excluded.speed,
    updated_at = now();
    
  -- Also keep session alive
  update public.sessions set last_active = now() where id = p_session_id;
end;
$$;

-- 4. RPC: GET NEARBY DRIVERS
create or replace function public.get_nearby_drivers(
  p_session_id uuid,
  radius_meters float
)
returns table (
  id uuid,
  plate_number text,
  vehicle_type text,
  lat float,
  long float,
  heading float,
  speed float,
  distance_meters float,
  relative_bearing float -- Degrees relative to ME (0 = Ahead, 90 = Right, etc)
)
language plpgsql
as $$
declare
  my_geom geography;
  my_heading float;
begin
  -- Get my position
  select geom, heading into my_geom, my_heading
  from public.locations
  where session_id = p_session_id;
  
  if my_geom is null then
    return;
  end if;

  return query
  select 
    s.id,
    s.plate_number,
    s.vehicle_type,
    st_y(l.geom::geometry) as lat,
    st_x(l.geom::geometry) as long,
    l.heading,
    l.speed,
    st_distance(l.geom, my_geom) as dist,
    
    -- Calculate bearing from ME to TARGET
    -- ST_Azimuth returns radians, 0 is North.
    -- We need to convert to degrees and adjust for MY heading.
    -- Formula: (TargetBearing - MyHeading + 360) % 360
    (degrees(st_azimuth(my_geom, l.geom)) - my_heading + 360)::numeric % 360 as rel_bearing
    
  from public.locations l
  join public.sessions s on l.session_id = s.id
  where 
    l.session_id != p_session_id -- exclude self
    and st_dwithin(l.geom, my_geom, radius_meters) -- radius filter
    and s.last_active > now() - interval '1 minute'; -- only active users
end;
$$;

-- 5. REALTIME PUBLICATION
-- Enable realtime for locations so we can listen to "changes" if we want
alter publication supabase_realtime add table public.locations;
alter publication supabase_realtime add table public.sessions;
