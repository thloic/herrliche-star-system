-- Le lieu de naissance n'est plus demandé à l'inscription. À exécuter dans
-- l'éditeur SQL Supabase, comme les migrations précédentes.

alter table players drop column if exists lieu_naissance;
