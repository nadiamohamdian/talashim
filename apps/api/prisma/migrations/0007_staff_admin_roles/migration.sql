-- Expand staff roles; migrate legacy ADMIN to SUPER_ADMIN
CREATE TYPE "Role_new" AS ENUM (
  'CUSTOMER',
  'SUPER_ADMIN',
  'SUPPORT',
  'ACCOUNTANT',
  'EDITOR',
  'WAREHOUSE'
);

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"::text
    WHEN 'ADMIN' THEN 'SUPER_ADMIN'::"Role_new"
    WHEN 'CUSTOMER' THEN 'CUSTOMER'::"Role_new"
    ELSE 'CUSTOMER'::"Role_new"
  END
);

ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
