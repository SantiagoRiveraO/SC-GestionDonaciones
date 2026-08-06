-- Seeds sintéticos de QA (NO son datos reales de la fundación).
-- Solo usar en ambiente de desarrollo/pruebas.

-- Ejemplo (ajustar UUIDs a usuarios de Auth creados en el proyecto):
-- insert into public.donors (full_name, email, phone)
-- values ('Donante Demo', 'demo@example.com', '+580000000000');

-- insert into public.donations (donor_id, amount, currency, donated_at, method, concept)
-- select id, 50.00, 'USD', current_date, 'transfer', 'Aporte de prueba'
-- from public.donors
-- where email = 'demo@example.com'
-- limit 1;
