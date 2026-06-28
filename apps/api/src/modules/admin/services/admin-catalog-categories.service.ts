import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type {
  AdminCatalogCategoryPageDto,
} from '@sadafgold/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { requireLibraryImageUrl } from '@/common/media/require-library-image-url';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type { CatalogCategoryPage, Prisma } from '@/generated/prisma';
import { CatalogCategoryPageRepository } from '@/modules/catalog/repositories/catalog-category-page.repository';
import {
  parseCatalogCategoryFilterConfig,
  slugifyCatalogCategory,
  validateCatalogCategoryFilterConfig,
} from '@/modules/catalog/lib/catalog-category-page.util';
import { AdminRepository } from '../repositories/admin.repository';
import type {
  CreateAdminCatalogCategoryPageDto,
  UpdateAdminCatalogCategoryPageDto,
} from '../dto/admin-catalog-category.dto';

@Injectable()
export class AdminCatalogCategoriesService {
  constructor(
    private readonly repository: CatalogCategoryPageRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  async list(actor: AuthenticatedUser): Promise<AdminCatalogCategoryPageDto[]> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);
    const rows = await this.repository.findAll();
    return rows.map((row) => this.toAdminDto(row));
  }

  async getById(id: string, actor: AuthenticatedUser): Promise<AdminCatalogCategoryPageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.read);
    const row = await this.repository.findById(id);
    if (!row) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }
    return this.toAdminDto(row);
  }

  async create(
    dto: CreateAdminCatalogCategoryPageDto,
    actor: AuthenticatedUser,
  ): Promise<AdminCatalogCategoryPageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const slug = slugifyCatalogCategory(dto.slug);
    if (!slug) {
      throw new BadRequestException('شناسه دسته‌بندی معتبر نیست');
    }

    const slugCount = await this.repository.countBySlug(slug);
    if (slugCount > 0) {
      throw new ConflictException('شناسه دسته‌بندی تکراری است');
    }

    const filterConfig = validateCatalogCategoryFilterConfig(dto.filterConfig);
    const heroImageUrls = this.sanitizeHeroImageUrls(dto.heroImageUrls ?? []);
    const productCategory = this.repository.resolveProductCategory(dto.productCategory);

    const row = await this.repository.create({
      slug,
      title: dto.title.trim(),
      subtitle: dto.subtitle?.trim() || null,
      heroImageUrls,
      filterConfig: filterConfig as unknown as Prisma.InputJsonValue,
      productCategory: productCategory ?? undefined,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      seoTitle: dto.seoTitle?.trim() || null,
      seoDescription: dto.seoDescription?.trim() || null,
    });

    await this.adminRepository.createAuditLog('admin.catalog_category.created', actor.id, {
      entity: 'CatalogCategoryPage',
      entityId: row.id,
      after: { slug: row.slug, title: row.title },
    });

    return this.toAdminDto(row);
  }

  async update(
    id: string,
    dto: UpdateAdminCatalogCategoryPageDto,
    actor: AuthenticatedUser,
  ): Promise<AdminCatalogCategoryPageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    const nextSlug = dto.slug ? slugifyCatalogCategory(dto.slug) : existing.slug;
    if (!nextSlug) {
      throw new BadRequestException('شناسه دسته‌بندی معتبر نیست');
    }

    if (nextSlug !== existing.slug) {
      const slugCount = await this.repository.countBySlug(nextSlug, id);
      if (slugCount > 0) {
        throw new ConflictException('شناسه دسته‌بندی تکراری است');
      }
    }

    const row = await this.repository.update(id, {
      slug: nextSlug,
      title: dto.title?.trim(),
      subtitle: dto.subtitle === undefined ? undefined : dto.subtitle?.trim() || null,
      heroImageUrls:
        dto.heroImageUrls === undefined
          ? undefined
          : this.sanitizeHeroImageUrls(dto.heroImageUrls),
      filterConfig:
        dto.filterConfig === undefined
          ? undefined
          : (validateCatalogCategoryFilterConfig(dto.filterConfig) as unknown as Prisma.InputJsonValue),
      productCategory:
        dto.productCategory === undefined
          ? undefined
          : this.repository.resolveProductCategory(dto.productCategory) ?? null,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      seoTitle: dto.seoTitle === undefined ? undefined : dto.seoTitle?.trim() || null,
      seoDescription:
        dto.seoDescription === undefined ? undefined : dto.seoDescription?.trim() || null,
    });

    await this.adminRepository.createAuditLog('admin.catalog_category.updated', actor.id, {
      entity: 'CatalogCategoryPage',
      entityId: row.id,
      before: { slug: existing.slug, title: existing.title },
      after: { slug: row.slug, title: row.title },
    });

    return this.toAdminDto(row);
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<void> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.products.write);

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    await this.repository.delete(id);

    await this.adminRepository.createAuditLog('admin.catalog_category.deleted', actor.id, {
      entity: 'CatalogCategoryPage',
      entityId: id,
      before: { slug: existing.slug, title: existing.title },
    });
  }

  private sanitizeHeroImageUrls(urls: string[]): string[] {
    return urls
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => requireLibraryImageUrl(url));
  }

  private toAdminDto(row: CatalogCategoryPage): AdminCatalogCategoryPageDto {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      heroImageUrls: row.heroImageUrls,
      filterConfig: parseCatalogCategoryFilterConfig(row.filterConfig, row.slug),
      productCategory: row.productCategory,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
