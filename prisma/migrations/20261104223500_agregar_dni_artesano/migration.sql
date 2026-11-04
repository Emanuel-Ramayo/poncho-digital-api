/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Artesano` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dni` to the `Artesano` table.

*/
-- AlterTable
ALTER TABLE "Artesano" ADD COLUMN "dni" TEXT;

-- Asignar DNI único temporal a registros previos si existieran
UPDATE "Artesano"
SET "dni" = LPAD((10000000 + "id")::TEXT, 8, '0')
WHERE "dni" IS NULL;

ALTER TABLE "Artesano" ALTER COLUMN "dni" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Artesano_dni_key" ON "Artesano"("dni");

