/*
  Warnings:

  - You are about to drop the column `especialidad` on the `Artesano` table. All the data in the column will be lost.
  - You are about to drop the column `localidad` on the `Artesano` table. All the data in the column will be lost.
  - You are about to drop the column `provincia` on the `Artesano` table. All the data in the column will be lost.
  - You are about to alter the column `precio` on the `Producto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[nombre]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Pabellon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[artesano_id,anio_id]` on the table `Postulacion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre,pabellon_id]` on the table `Sector` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero,sector_id]` on the table `Stand` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `localidad_id` to the `Artesano` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rubro_id` to the `Artesano` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anio_id` to the `Postulacion` table without a default value. This is not possible if the table is not empty.

*/
-- Limpieza preventiva para permitir agregar columnas NOT NULL
TRUNCATE TABLE "Postulacion", "Artesano" CASCADE;

-- DropForeignKey
ALTER TABLE "Postulacion" DROP CONSTRAINT "Postulacion_artesano_id_fkey";

-- DropForeignKey
ALTER TABLE "Producto" DROP CONSTRAINT "Producto_artesano_id_fkey";

-- DropForeignKey
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_pabellon_id_fkey";

-- DropForeignKey
ALTER TABLE "Stand" DROP CONSTRAINT "Stand_sector_id_fkey";

-- AlterTable
ALTER TABLE "Artesano" DROP COLUMN "especialidad",
DROP COLUMN "localidad",
DROP COLUMN "provincia",
ADD COLUMN     "localidad_id" INTEGER NOT NULL,
ADD COLUMN     "rubro_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Postulacion" ADD COLUMN     "anio_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Producto" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "Rubro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provincia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provincia_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnioPostulacion" (
    "id" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnioPostulacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_nombre_key" ON "Rubro"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Provincia_nombre_key" ON "Provincia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Localidad_nombre_provincia_id_key" ON "Localidad"("nombre", "provincia_id");

-- CreateIndex
CREATE UNIQUE INDEX "AnioPostulacion_anio_key" ON "AnioPostulacion"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pabellon_nombre_key" ON "Pabellon"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_artesano_id_anio_id_key" ON "Postulacion"("artesano_id", "anio_id");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_nombre_pabellon_id_key" ON "Sector"("nombre", "pabellon_id");

-- CreateIndex
CREATE UNIQUE INDEX "Stand_numero_sector_id_key" ON "Stand"("numero", "sector_id");

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "Rubro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_localidad_id_fkey" FOREIGN KEY ("localidad_id") REFERENCES "Localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Localidad" ADD CONSTRAINT "Localidad_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "Provincia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_artesano_id_fkey" FOREIGN KEY ("artesano_id") REFERENCES "Artesano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_pabellon_id_fkey" FOREIGN KEY ("pabellon_id") REFERENCES "Pabellon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stand" ADD CONSTRAINT "Stand_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_artesano_id_fkey" FOREIGN KEY ("artesano_id") REFERENCES "Artesano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_anio_id_fkey" FOREIGN KEY ("anio_id") REFERENCES "AnioPostulacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
