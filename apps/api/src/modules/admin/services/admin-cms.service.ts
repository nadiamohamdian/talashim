import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@talashim/shared/admin-rbac';
import type {
  AdminBlogPostDto,
  CmsBannerDto,
  CmsHomepageDto,
  CmsSeoSettingsDto,
  CmsStaticPageDto,
  MediaAssetDto,
} from '@talashim/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import type { Prisma } from '@/generated/prisma';
import type {
  AdminBannersQueryDto,
  AdminBlogQueryDto,
  AdminMediaQueryDto,
  AdminStaticPagesQueryDto,
  RegisterMediaAssetDto,
  UpdateCmsHomepageDto,
  UpdateCmsSeoDto,
  UpsertBlogPostDto,
  UpsertCmsBannerDto,
  UpsertCmsStaticPageDto,
  UpsertFaqPostDto,
} from '../dto/admin-cms.dto';
import { AdminCmsRepository } from '../repositories/admin-cms.repository';
import {
  MediaStorageService,
  type UploadedImageFile,
} from '@/infrastructure/media/media-storage.service';

type BlogPostWithCategory = Prisma.BlogPostGetPayload<{ include: { category: true } }>;

const DEFAULT_FAQ_COVER =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80';

@Injectable()
export class AdminCmsService {
  constructor(
    private readonly cmsRepository: AdminCmsRepository,
    private readonly mediaStorage: MediaStorageService,
  ) {}

  listBlogCategories(actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);
    return this.cmsRepository.listBlogCategories();
  }

  async listBlogPosts(query: AdminBlogQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.cmsRepository.listBlogPosts(
      skip,
      limit,
      query.search,
      query.category,
      query.published ?? 'all',
    );

    return {
      page,
      limit,
      total,
      items: items.map((post) => this.mapBlogPost(post)),
    };
  }

  async getBlogPost(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);
    const post = await this.cmsRepository.findBlogPostById(id);
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    return this.mapBlogPost(post);
  }

  async createBlogPost(dto: UpsertBlogPostDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    await this.assertUniqueBlogSlug(dto.slug);

    const post = await this.cmsRepository.createBlogPost({
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      isPublished: dto.isPublished ?? true,
      sortOrder: dto.sortOrder ?? 0,
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
    });

    return this.mapBlogPost(post);
  }

  async updateBlogPost(id: string, dto: UpsertBlogPostDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const existing = await this.cmsRepository.findBlogPostById(id);
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    if (dto.slug !== existing.slug) {
      await this.assertUniqueBlogSlug(dto.slug, id);
    }

    const post = await this.cmsRepository.updateBlogPost(id, {
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      isPublished: dto.isPublished,
      sortOrder: dto.sortOrder,
      ...(dto.categoryId !== undefined
        ? {
            category: dto.categoryId
              ? { connect: { id: dto.categoryId } }
              : { disconnect: true },
          }
        : {}),
    });

    return this.mapBlogPost(post);
  }

  async deleteBlogPost(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findBlogPostById(id);
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }
    await this.cmsRepository.deleteBlogPost(id);
    return { ok: true };
  }

  async listFaq(query: AdminBlogQueryDto, actor: AuthenticatedUser) {
    return this.listBlogPosts({ ...query, category: 'faq' }, actor);
  }

  async createFaqPost(dto: UpsertFaqPostDto, actor: AuthenticatedUser) {
    const faqCategory = await this.cmsRepository.ensureFaqCategory();
    return this.createBlogPost(
      { ...this.normalizeFaqDto(dto), categoryId: faqCategory.id },
      actor,
    );
  }

  async updateFaqPost(id: string, dto: UpsertFaqPostDto, actor: AuthenticatedUser) {
    const existing = await this.cmsRepository.findBlogPostById(id);
    if (!existing) {
      throw new NotFoundException('FAQ entry not found');
    }
    if (existing.category?.slug !== 'faq') {
      throw new BadRequestException('Post is not an FAQ entry');
    }
    return this.updateBlogPost(id, this.normalizeFaqDto(dto), actor);
  }

  async listBanners(query: AdminBannersQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.cmsRepository.listBanners(
      skip,
      limit,
      query.status,
      query.placement,
    );

    return {
      page,
      limit,
      total,
      items: items.map((banner) => this.mapBanner(banner)),
    };
  }

  async createBanner(dto: UpsertCmsBannerDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const banner = await this.cmsRepository.createBanner({
      title: dto.title,
      subtitle: dto.subtitle,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      placement: dto.placement,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });

    return this.mapBanner(banner);
  }

  async updateBanner(id: string, dto: UpsertCmsBannerDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const existing = await this.cmsRepository.findBannerById(id);
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }

    const banner = await this.cmsRepository.updateBanner(id, {
      title: dto.title,
      subtitle: dto.subtitle,
      imageUrl: dto.imageUrl,
      linkUrl: dto.linkUrl,
      placement: dto.placement,
      sortOrder: dto.sortOrder,
      status: dto.status,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    return this.mapBanner(banner);
  }

  async deleteBanner(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findBannerById(id);
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }
    await this.cmsRepository.deleteBanner(id);
    return { ok: true };
  }

  async getHomepage(actor: AuthenticatedUser): Promise<CmsHomepageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);
    const row = await this.cmsRepository.getOrCreateHomepage();
    return this.mapHomepage(row);
  }

  async updateHomepage(dto: UpdateCmsHomepageDto, actor: AuthenticatedUser): Promise<CmsHomepageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const row = await this.cmsRepository.updateHomepage(
      dto.hero as Prisma.InputJsonValue,
      dto.sections as Prisma.InputJsonValue,
    );

    return this.mapHomepage(row);
  }

  async listStaticPages(query: AdminStaticPagesQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.cmsRepository.listStaticPages(
      skip,
      limit,
      query.search,
      query.published ?? 'all',
    );

    return {
      page,
      limit,
      total,
      items: items.map((row) => this.mapStaticPage(row)),
    };
  }

  async createStaticPage(dto: UpsertCmsStaticPageDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    await this.assertUniquePageSlug(dto.slug);

    const page = await this.cmsRepository.createStaticPage({
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      isPublished: dto.isPublished ?? false,
    });

    return this.mapStaticPage(page);
  }

  async updateStaticPage(id: string, dto: UpsertCmsStaticPageDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const existing = await this.cmsRepository.findStaticPageById(id);
    if (!existing) {
      throw new NotFoundException('Static page not found');
    }

    if (dto.slug !== existing.slug) {
      await this.assertUniquePageSlug(dto.slug, id);
    }

    const page = await this.cmsRepository.updateStaticPage(id, {
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      isPublished: dto.isPublished,
    });

    return this.mapStaticPage(page);
  }

  async deleteStaticPage(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findStaticPageById(id);
    if (!existing) {
      throw new NotFoundException('Static page not found');
    }
    await this.cmsRepository.deleteStaticPage(id);
    return { ok: true };
  }

  async getSeo(actor: AuthenticatedUser): Promise<CmsSeoSettingsDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);
    const row = await this.cmsRepository.getOrCreateSeo();
    return this.mapSeo(row);
  }

  async updateSeo(dto: UpdateCmsSeoDto, actor: AuthenticatedUser): Promise<CmsSeoSettingsDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const row = await this.cmsRepository.updateSeo({
      siteTitle: dto.siteTitle,
      siteDescription: dto.siteDescription,
      defaultOgImageUrl: dto.defaultOgImageUrl,
      robotsIndex: dto.robotsIndex,
      googleAnalyticsId: dto.googleAnalyticsId,
      extraMeta: dto.extraMeta as Prisma.InputJsonValue | undefined,
    });

    return this.mapSeo(row);
  }

  async listMedia(query: AdminMediaQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const skip = (page - 1) * limit;

    const [items, total] = await this.cmsRepository.listMedia(
      skip,
      limit,
      query.search,
      query.folder,
      query.mimeType,
    );

    return {
      page,
      limit,
      total,
      items: items.map((asset) => this.mapMedia(asset)),
    };
  }

  async registerMedia(dto: RegisterMediaAssetDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.write);

    const asset = await this.cmsRepository.createMedia({
      filename: dto.filename,
      url: dto.url,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      alt: dto.alt,
      folder: dto.folder ?? 'general',
      uploader: { connect: { id: actor.id } },
    });

    return this.mapMedia(asset);
  }

  async uploadMedia(
    file: UploadedImageFile,
    folder: string | undefined,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.write);

    const saved = await this.mediaStorage.saveImage(file, folder ?? 'general');
    const asset = await this.cmsRepository.createMedia({
      filename: saved.filename,
      url: saved.url,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
      folder: folder ?? 'general',
      uploader: { connect: { id: actor.id } },
    });

    return this.mapMedia(asset);
  }

  async deleteMedia(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.write);
    const existing = await this.cmsRepository.findMediaById(id);
    if (!existing) {
      throw new NotFoundException('Media asset not found');
    }
    await this.cmsRepository.deleteMedia(id);
    return { ok: true };
  }

  private async assertUniqueBlogSlug(slug: string, excludeId?: string) {
    const existing = await this.cmsRepository.findBlogPostBySlug(slug);
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Blog slug already exists');
    }
  }

  private async assertUniquePageSlug(slug: string, excludeId?: string) {
    const existing = await this.cmsRepository.findStaticPageBySlug(slug);
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Page slug already exists');
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private normalizeFaqDto(dto: UpsertFaqPostDto): UpsertBlogPostDto {
    const plain = this.stripHtml(dto.content);
    if (plain.length < 2) {
      throw new BadRequestException('Answer must be at least 2 characters');
    }

    return {
      title: dto.title.trim(),
      slug: dto.slug.trim(),
      content: dto.content,
      excerpt: dto.excerpt?.trim() || plain.slice(0, 400),
      coverImageUrl: dto.coverImageUrl ?? DEFAULT_FAQ_COVER,
      publishedAt: dto.publishedAt,
      isPublished: dto.isPublished ?? true,
      sortOrder: dto.sortOrder ?? 0,
    };
  }

  private mapBlogPost(post: BlogPostWithCategory): AdminBlogPostDto {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt.toISOString(),
      isPublished: post.isPublished,
      sortOrder: post.sortOrder,
      categoryId: post.categoryId,
      categorySlug: post.category?.slug ?? null,
      categoryTitle: post.category?.title ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  private mapBanner(banner: Prisma.CmsBannerGetPayload<object>): CmsBannerDto {
    return {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      placement: banner.placement,
      sortOrder: banner.sortOrder,
      status: banner.status,
      startsAt: banner.startsAt?.toISOString() ?? null,
      endsAt: banner.endsAt?.toISOString() ?? null,
      createdAt: banner.createdAt.toISOString(),
      updatedAt: banner.updatedAt.toISOString(),
    };
  }

  private mapHomepage(row: Prisma.CmsHomepageGetPayload<object>): CmsHomepageDto {
    return {
      hero: row.hero as unknown as CmsHomepageDto['hero'],
      sections: row.sections as unknown as CmsHomepageDto['sections'],
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapStaticPage(page: Prisma.CmsStaticPageGetPayload<object>): CmsStaticPageDto {
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      isPublished: page.isPublished,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };
  }

  private mapSeo(row: Prisma.CmsSeoSettingsGetPayload<object>): CmsSeoSettingsDto {
    return {
      siteTitle: row.siteTitle,
      siteDescription: row.siteDescription,
      defaultOgImageUrl: row.defaultOgImageUrl,
      robotsIndex: row.robotsIndex,
      googleAnalyticsId: row.googleAnalyticsId,
      extraMeta: (row.extraMeta as Record<string, string> | null) ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapMedia(asset: Prisma.MediaAssetGetPayload<object>): MediaAssetDto {
    return {
      id: asset.id,
      filename: asset.filename,
      url: asset.url,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      alt: asset.alt,
      folder: asset.folder,
      uploadedBy: asset.uploadedBy,
      createdAt: asset.createdAt.toISOString(),
    };
  }
}
