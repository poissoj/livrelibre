DO $mig$
DECLARE
  fn text := $fn$
    (txt text) RETURNS date LANGUAGE plpgsql AS $body$
    DECLARE
      parts text[];
      d int; m int; y int;
    BEGIN
      IF txt IS NULL THEN RETURN NULL; END IF;

      IF txt ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
        BEGIN RETURN txt::date; EXCEPTION WHEN others THEN RETURN NULL; END;
      END IF;

      parts := string_to_array(replace(txt, '.', '/'), '/');
      IF COALESCE(array_length(parts, 1), 0) <> 3 THEN RETURN NULL; END IF;
      IF parts[1] !~ '^[0-9]{1,2}$'
         OR parts[2] !~ '^[0-9]{1,2}$'
         OR parts[3] !~ '^[0-9]{2}([0-9]{2})?$' THEN
        RETURN NULL;
      END IF;

      d := parts[1]::int; m := parts[2]::int; y := parts[3]::int;
      IF length(parts[3]) = 2 THEN
        y := CASE WHEN y < 70 THEN 2000 + y ELSE 1900 + y END;
      END IF;

      BEGIN RETURN make_date(y, m, d);
      EXCEPTION WHEN others THEN RETURN NULL; END;
    END $body$;
  $fn$;
BEGIN
  EXECUTE 'CREATE OR REPLACE FUNCTION pg_temp.ll_parse_date' || fn;
  EXECUTE 'ALTER TABLE "purchases" ALTER COLUMN "date" SET DATA TYPE date USING COALESCE(pg_temp.ll_parse_date("date"::text), DATE ''2000-01-01'')';
END $mig$;
