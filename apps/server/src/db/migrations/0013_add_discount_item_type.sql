INSERT INTO "itemTypes" ("code", "label", "position", "active", "isDefault")
VALUES ('discount', 'Remise', 100, false, false)
ON CONFLICT ("code") DO NOTHING;
