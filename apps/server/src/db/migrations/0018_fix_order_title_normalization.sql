-- Fix the normalization mapping used by migration 0011.
-- Its target string was shifted by one character, turning "é" into "c",
-- "ç" into "a", "í" into "e", etc. Recompute every title from itemTitle with
-- the corrected mapping. Lowercasing first also handles uppercase accents.
UPDATE "orders"
SET "nmTitle" = translate(
  lower("itemTitle"),
  'àâäáãåāçéèêëēíìîïīóòôöõúùûüýÿñ',
  'aaaaaaaceeeeeiiiiiooooouuuuyyn'
);
