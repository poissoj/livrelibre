ALTER TABLE "items" ALTER COLUMN "datebought" SET DATA TYPE date USING to_date("datebought", 'DD/MM/YYYY');
