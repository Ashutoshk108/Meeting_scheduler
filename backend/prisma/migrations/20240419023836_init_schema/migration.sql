/*
  Warnings:

  - You are about to drop the `Bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_room_id_fkey";

-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_session_id_fkey";

-- DropForeignKey
ALTER TABLE "RoomTags" DROP CONSTRAINT "RoomTags_room_id_fkey";

-- DropForeignKey
ALTER TABLE "RoomTags" DROP CONSTRAINT "RoomTags_tag_id_fkey";

-- DropTable
DROP TABLE "Bookings";

-- DropTable
DROP TABLE "RoomTags";

-- DropTable
DROP TABLE "Rooms";

-- DropTable
DROP TABLE "Sessions";

-- DropTable
DROP TABLE "Tags";
