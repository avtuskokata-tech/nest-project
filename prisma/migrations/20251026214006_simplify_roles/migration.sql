/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRoles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoleToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserRoles" DROP CONSTRAINT "UserRoles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRoles" DROP CONSTRAINT "UserRoles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RoleToUser" DROP CONSTRAINT "_RoleToUser_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" TEXT[];

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."UserRoles";

-- DropTable
DROP TABLE "public"."_RoleToUser";
