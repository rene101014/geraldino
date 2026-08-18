update public.services set order_index = 11 where slug = 'asesoria-creativa';

insert into public.services (slug, title, description, is_addon, order_index) values
  ('cobertura-de-eventos', 'Cobertura de eventos', 'Cobertura audiovisual de eventos: recaps, momentos clave y contenido para redes.', false, 9),
  ('contenido-inmobiliario', 'Contenido inmobiliario', 'Fotografía y video de propiedades para inmobiliarias y desarrollos.', false, 10);
