-- CreateTable
CREATE TABLE "StaffRolePermission" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffRolePermission_role_permission_key" ON "StaffRolePermission"("role", "permission");

-- CreateIndex
CREATE INDEX "StaffRolePermission_role_idx" ON "StaffRolePermission"("role");
