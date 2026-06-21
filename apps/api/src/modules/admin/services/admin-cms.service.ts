import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS } from '@sadafgold/shared/admin-rbac';
import type {
  AdminBlogPostDto,
  CmsAboutPageCopy,
  CmsAboutPageDto,
  CmsAboutPageMeta,
  CmsAboutPageValue,
  CmsBannerDto,
  CmsHomepageDto,
  CmsHomepageSections,
  CmsLensHotspot,
  CmsLensVideoDto,
  CmsSeoSettingsDto,
  CmsStaticPageDto,
  MediaAssetDto,
  ProductSummary,
  PublicCmsAboutPage,
  PublicCmsCollection,
  PublicCmsHomepage,
  PublicCmsLensVideo,
  PublicCmsSeo,
} from '@sadafgold/types';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import {
  optionalLibraryImageUrl,
  requireLibraryImageUrl,
} from '@/common/media/require-library-image-url';
import { assertAdminPermission } from '@/common/rbac/assert-admin-permission';
import { CmsBannerLinkType, type Prisma } from '@/generated/prisma';
import type {
  AdminBannersQueryDto,
  AdminBlogQueryDto,
  AdminLensVideosQueryDto,
  AdminMediaQueryDto,
  AdminStaticPagesQueryDto,
  RegisterMediaAssetDto,
  UpdateCmsHomepageDto,
  UpdateCmsAboutPageDto,
  UpdateCmsSeoDto,
  UpdateMediaAssetDto,
  UpsertBlogPostDto,
  UpsertCmsBannerDto,
  UpsertCmsLensVideoDto,
  UpsertCmsStaticPageDto,
  UpsertFaqPostDto,
} from '../dto/admin-cms.dto';
import { AdminCmsRepository, type CmsBannerWithProducts, type CmsLensVideoWithProducts } from '../repositories/admin-cms.repository';
import { CatalogService } from '@/modules/catalog/services/catalog.service';
import {
  MediaStorageService,
  type UploadedImageFile,
} from '@/infrastructure/media/media-storage.service';
import {
  revalidateStorefrontAboutPage,
  revalidateStorefrontBanners,
  revalidateStorefrontFaq,
  revalidateStorefrontHomepage,
  revalidateStorefrontLens,
  revalidateStorefrontSeo,
  revalidateStorefrontStaticPages,
} from '@/infrastructure/storefront/storefront-cache.util';
import {
  DEFAULT_CMS_ABOUT_VALUES,
} from '../cms/cms-defaults';

type BlogPostWithCategory = Prisma.BlogPostGetPayload<{ include: { category: true } }>;

@Injectable()
export class AdminCmsService {
  constructor(
    private readonly cmsRepository: AdminCmsRepository,
    private readonly mediaStorage: MediaStorageService,
    private readonly catalogService: CatalogService,
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
      coverImageUrl: requireLibraryImageUrl(dto.coverImageUrl, 'تصویر کاور'),
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
      coverImageUrl: requireLibraryImageUrl(dto.coverImageUrl, 'تصویر کاور'),
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
    const isFaq = existing.category?.slug === 'faq';
    await this.cmsRepository.deleteBlogPost(id);
    if (isFaq) {
      void revalidateStorefrontFaq();
    }
    return { ok: true };
  }

  async listFaq(query: AdminBlogQueryDto, actor: AuthenticatedUser) {
    return this.listBlogPosts({ ...query, category: 'faq' }, actor);
  }

  async createFaqPost(dto: UpsertFaqPostDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const faqCategory = await this.cmsRepository.ensureFaqCategory();
    const normalized = this.normalizeFaqDto(dto);
    await this.assertUniqueBlogSlug(normalized.slug);

    const post = await this.cmsRepository.createBlogPost({
      title: normalized.title,
      slug: normalized.slug,
      excerpt: normalized.excerpt,
      content: normalized.content,
      coverImageUrl: normalized.coverImageUrl,
      publishedAt: normalized.publishedAt ? new Date(normalized.publishedAt) : new Date(),
      isPublished: normalized.isPublished ?? true,
      sortOrder: normalized.sortOrder ?? 0,
      category: { connect: { id: faqCategory.id } },
    });

    void revalidateStorefrontFaq();
    return this.mapBlogPost(post);
  }

  async updateFaqPost(id: string, dto: UpsertFaqPostDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findBlogPostById(id);
    if (!existing) {
      throw new NotFoundException('FAQ entry not found');
    }
    if (existing.category?.slug !== 'faq') {
      throw new BadRequestException('Post is not an FAQ entry');
    }

    const normalized = this.normalizeFaqDto(dto);
    if (normalized.slug !== existing.slug) {
      await this.assertUniqueBlogSlug(normalized.slug, id);
    }

    const post = await this.cmsRepository.updateBlogPost(id, {
      title: normalized.title,
      slug: normalized.slug,
      excerpt: normalized.excerpt,
      content: normalized.content,
      coverImageUrl: normalized.coverImageUrl,
      publishedAt: normalized.publishedAt ? new Date(normalized.publishedAt) : undefined,
      isPublished: dto.isPublished ?? existing.isPublished,
      sortOrder: normalized.sortOrder,
    });

    void revalidateStorefrontFaq();
    return this.mapBlogPost(post);
  }

  async listPublicBanners(placement?: string) {
    const items = await this.cmsRepository.findPublishedBanners(placement);
    return items.map((banner) => this.mapPublicBanner(banner));
  }

  async listPublicLensVideos(): Promise<PublicCmsLensVideo[]> {
    const items = await this.cmsRepository.findPublishedLensVideos();
    const productIds = [...new Set(items.flatMap((video) => video.products.map((item) => item.productId)))];
    const products = await this.catalogService.findByIds(productIds);
    const productsById = new Map(products.map((product) => [product.id, product as ProductSummary]));

    return items.map((video) => this.mapPublicLensVideo(video, productsById));
  }

  async getPublicCollection(id: string): Promise<PublicCmsCollection> {
    const banner = await this.cmsRepository.findPublishedBannerById(id);
    if (!banner) {
      throw new NotFoundException('Collection not found');
    }

    const productIds = banner.products.map((item) => item.productId);
    const products = await this.catalogService.findByIds(productIds);

    return {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      products: products as ProductSummary[],
    };
  }

  async listPublicStaticPages() {
    const items = await this.cmsRepository.listPublishedStaticPages();
    return items.map((page) => this.mapPublicStaticPageSummary(page));
  }

  async getPublicStaticPageBySlug(slug: string) {
    const page = await this.cmsRepository.findPublishedStaticPageBySlug(slug);
    if (!page) {
      throw new NotFoundException('Static page not found');
    }
    return this.mapPublicStaticPage(page);
  }

  async getPublicHomepage(): Promise<PublicCmsHomepage> {
    const row = await this.cmsRepository.getOrCreateHomepage();
    const mapped = this.mapHomepage(row);
    const sections = mapped.sections as CmsHomepageSections;
    const [bestsellerProducts, newArrivalsProducts] = await Promise.all([
      this.resolveBestsellerProducts(sections),
      this.resolveNewArrivalsProducts(sections),
    ]);

    return {
      hero: mapped.hero,
      sections,
      bestsellerProducts,
      newArrivalsProducts,
    };
  }

  async getPublicAboutPage(): Promise<PublicCmsAboutPage> {
    const row = await this.cmsRepository.getOrCreateAboutPage();
    return this.mapPublicAboutPage(row);
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

    const link = await this.normalizeBannerLink(dto);

    const banner = await this.cmsRepository.createBanner({
      title: dto.title,
      subtitle: dto.subtitle,
      imageUrl: requireLibraryImageUrl(dto.imageUrl, 'تصویر بنر'),
      linkType: link.linkType,
      linkUrl: link.linkType === CmsBannerLinkType.URL ? link.linkUrl : null,
      placement: dto.placement,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? 'PUBLISHED',
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
    });

    if (link.linkType === CmsBannerLinkType.COLLECTION) {
      await this.cmsRepository.setBannerProducts(banner.id, link.productIds);
      await this.cmsRepository.updateBanner(banner.id, {
        linkUrl: `/collections/${banner.id}`,
      });
    }

    void revalidateStorefrontBanners();
    const saved = await this.cmsRepository.findBannerById(banner.id);
    return this.mapBanner(saved!);
  }

  async updateBanner(id: string, dto: UpsertCmsBannerDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const existing = await this.cmsRepository.findBannerById(id);
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }

    const link = await this.normalizeBannerLink(dto);

    await this.cmsRepository.updateBanner(id, {
      title: dto.title,
      subtitle: dto.subtitle,
      imageUrl: requireLibraryImageUrl(dto.imageUrl, 'تصویر بنر'),
      linkType: link.linkType,
      linkUrl:
        link.linkType === CmsBannerLinkType.COLLECTION
          ? `/collections/${id}`
          : link.linkUrl,
      placement: dto.placement,
      sortOrder: dto.sortOrder,
      status: dto.status,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });

    if (link.linkType === CmsBannerLinkType.COLLECTION) {
      await this.cmsRepository.setBannerProducts(id, link.productIds);
    } else {
      await this.cmsRepository.setBannerProducts(id, []);
    }

    void revalidateStorefrontBanners();
    const saved = await this.cmsRepository.findBannerById(id);
    return this.mapBanner(saved!);
  }

  async deleteBanner(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findBannerById(id);
    if (!existing) {
      throw new NotFoundException('Banner not found');
    }
    await this.cmsRepository.deleteBanner(id);
    void revalidateStorefrontBanners();
    return { ok: true };
  }

  async listLensVideos(query: AdminLensVideosQueryDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.cmsRepository.listLensVideos(skip, limit, query.status);

    return {
      page,
      limit,
      total,
      items: items.map((video) => this.mapLensVideo(video)),
    };
  }

  async createLensVideo(dto: UpsertCmsLensVideoDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const productIds = await this.normalizeLensVideoProductIds(dto.productIds);
    const media = this.resolveLensVideoMedia(dto);

    const video = await this.cmsRepository.createLensVideo({
      title: dto.title?.trim() || null,
      videoUrl: media.videoUrl,
      thumbnailUrl: optionalLibraryImageUrl(dto.thumbnailUrl, 'تصویر بندانگشتی') ?? null,
      heroImageUrl: media.heroImageUrl,
      hotspots: media.hotspots as unknown as Prisma.InputJsonValue,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? 'PUBLISHED',
    });

    await this.cmsRepository.setLensVideoProducts(video.id, productIds);

    void revalidateStorefrontLens();
    const saved = await this.cmsRepository.findLensVideoById(video.id);
    return this.mapLensVideo(saved!);
  }

  async updateLensVideo(id: string, dto: UpsertCmsLensVideoDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const existing = await this.cmsRepository.findLensVideoById(id);
    if (!existing) {
      throw new NotFoundException('Lens video not found');
    }

    const media = this.resolveLensVideoMedia(dto, existing);

    await this.cmsRepository.updateLensVideo(id, {
      title: dto.title !== undefined ? dto.title?.trim() || null : undefined,
      videoUrl: dto.videoUrl !== undefined || dto.heroImageUrl !== undefined ? media.videoUrl : undefined,
      thumbnailUrl:
        dto.thumbnailUrl !== undefined
          ? (optionalLibraryImageUrl(dto.thumbnailUrl, 'تصویر بندانگشتی') ?? null)
          : undefined,
      heroImageUrl:
        dto.heroImageUrl !== undefined ? media.heroImageUrl : undefined,
      hotspots:
        dto.hotspots !== undefined
          ? (media.hotspots as unknown as Prisma.InputJsonValue)
          : undefined,
      sortOrder: dto.sortOrder,
      status: dto.status,
    });

    if (dto.productIds !== undefined) {
      const productIds = await this.normalizeLensVideoProductIds(dto.productIds);
      await this.cmsRepository.setLensVideoProducts(id, productIds);
    }

    void revalidateStorefrontLens();
    const saved = await this.cmsRepository.findLensVideoById(id);
    return this.mapLensVideo(saved!);
  }

  async deleteLensVideo(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findLensVideoById(id);
    if (!existing) {
      throw new NotFoundException('Lens video not found');
    }
    await this.cmsRepository.deleteLensVideo(id);
    void revalidateStorefrontLens();
    return { ok: true };
  }

  async getHomepage(actor: AuthenticatedUser): Promise<CmsHomepageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);
    const row = await this.cmsRepository.getOrCreateHomepage();
    return this.mapHomepage(row);
  }

  async updateHomepage(dto: UpdateCmsHomepageDto, actor: AuthenticatedUser): Promise<CmsHomepageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const hero = { ...dto.hero };
    if (hero.imageUrl !== undefined) {
      hero.imageUrl =
        optionalLibraryImageUrl(
          typeof hero.imageUrl === 'string' ? hero.imageUrl : undefined,
          'تصویر هیرو',
        ) ?? '';
    }

    const row = await this.cmsRepository.updateHomepage(
      hero as Prisma.InputJsonValue,
      dto.sections as Prisma.InputJsonValue,
    );

    void revalidateStorefrontHomepage();

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

    void revalidateStorefrontStaticPages(page.slug);
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

    void revalidateStorefrontStaticPages(page.slug, existing.slug);
    return this.mapStaticPage(page);
  }

  async deleteStaticPage(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);
    const existing = await this.cmsRepository.findStaticPageById(id);
    if (!existing) {
      throw new NotFoundException('Static page not found');
    }
    await this.cmsRepository.deleteStaticPage(id);
    void revalidateStorefrontStaticPages(existing.slug);
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
      defaultOgImageUrl:
        dto.defaultOgImageUrl === undefined
          ? undefined
          : optionalLibraryImageUrl(dto.defaultOgImageUrl, 'تصویر OG پیش‌فرض'),
      robotsIndex: dto.robotsIndex,
      googleAnalyticsId: dto.googleAnalyticsId,
      extraMeta: dto.extraMeta as Prisma.InputJsonValue | undefined,
    });

    void revalidateStorefrontSeo();

    return this.mapSeo(row);
  }

  async getAboutPage(actor: AuthenticatedUser): Promise<CmsAboutPageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.read);
    const row = await this.cmsRepository.getOrCreateAboutPage();
    return this.mapAboutPage(row);
  }

  async updateAboutPage(dto: UpdateCmsAboutPageDto, actor: AuthenticatedUser): Promise<CmsAboutPageDto> {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.cms.write);

    const meta = this.normalizeAboutMeta(dto.meta);
    const copy = this.normalizeAboutCopy(dto.copy);
    const decorImageUrl = this.normalizeAboutDecorImageUrl(dto.decorImageUrl);
    const values = this.normalizeAboutValues(dto.values as unknown as CmsAboutPageValue[]);

    const row = await this.cmsRepository.updateAboutPage({
      meta: meta as unknown as Prisma.InputJsonValue,
      copy: copy as unknown as Prisma.InputJsonValue,
      decorImageUrl,
      values: values as unknown as Prisma.InputJsonValue,
    });

    void revalidateStorefrontAboutPage();

    return this.mapAboutPage(row);
  }

  async getPublicSeo(): Promise<PublicCmsSeo> {
    const row = await this.cmsRepository.getOrCreateSeo();
    return this.mapPublicSeo(row);
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
      url: requireLibraryImageUrl(dto.url, 'آدرس فایل'),
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

  async uploadMediaVideo(
    file: UploadedImageFile,
    folder: string | undefined,
    actor: AuthenticatedUser,
  ) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.write);

    try {
      const saved = await this.mediaStorage.saveVideo(file, folder ?? 'lens');
      const asset = await this.cmsRepository.createMedia({
        filename: saved.filename,
        url: saved.url,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        folder: folder ?? 'lens',
        uploader: { connect: { id: actor.id } },
      });

      return this.mapMedia(asset);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'آپلود ویدیو ناموفق بود';
      throw new BadRequestException(message);
    }
  }

  async updateMedia(id: string, dto: UpdateMediaAssetDto, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.write);
    const existing = await this.cmsRepository.findMediaById(id);
    if (!existing) {
      throw new NotFoundException('Media asset not found');
    }

    const asset = await this.cmsRepository.updateMedia(id, {
      alt: dto.alt?.trim() || null,
    });

    return this.mapMedia(asset);
  }

  async deleteMedia(id: string, actor: AuthenticatedUser) {
    assertAdminPermission(actor.role, ADMIN_PERMISSIONS.media.write);
    const existing = await this.cmsRepository.findMediaById(id);
    if (!existing) {
      throw new NotFoundException('Media asset not found');
    }
    await this.mediaStorage.deleteByPublicUrl(existing.url);
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
      coverImageUrl: dto.coverImageUrl?.trim()
        ? (optionalLibraryImageUrl(dto.coverImageUrl, 'تصویر سوال') ?? '')
        : '',
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

  private mapPublicBanner(banner: CmsBannerWithProducts) {
    return {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkType: banner.linkType,
      linkUrl: this.resolveBannerLinkUrl(banner),
      placement: banner.placement,
      sortOrder: banner.sortOrder,
    };
  }

  private mapBanner(banner: CmsBannerWithProducts): CmsBannerDto {
    return {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      linkType: banner.linkType,
      linkUrl: this.resolveBannerLinkUrl(banner),
      productIds: banner.products.map((item) => item.productId),
      placement: banner.placement,
      sortOrder: banner.sortOrder,
      status: banner.status,
      startsAt: banner.startsAt?.toISOString() ?? null,
      endsAt: banner.endsAt?.toISOString() ?? null,
      createdAt: banner.createdAt.toISOString(),
      updatedAt: banner.updatedAt.toISOString(),
    };
  }

  private resolveBannerLinkUrl(banner: Pick<CmsBannerWithProducts, 'id' | 'linkType' | 'linkUrl'>) {
    if (banner.linkType === CmsBannerLinkType.COLLECTION) {
      return `/collections/${banner.id}`;
    }
    return banner.linkUrl;
  }

  private async normalizeBannerLink(dto: UpsertCmsBannerDto): Promise<{
    linkType: CmsBannerLinkType;
    linkUrl: string | null;
    productIds: string[];
  }> {
    const linkType = dto.linkType ?? CmsBannerLinkType.URL;

    if (linkType === CmsBannerLinkType.COLLECTION) {
      const productIds = [...new Set((dto.productIds ?? []).filter(Boolean))];
      if (productIds.length === 0) {
        throw new BadRequestException('برای کالکشن حداقل یک محصول انتخاب کنید');
      }
      if (productIds.length > 48) {
        throw new BadRequestException('حداکثر ۴۸ محصول در هر کالکشن مجاز است');
      }
      const found = await this.cmsRepository.countProductsByIds(productIds);
      if (found !== productIds.length) {
        throw new BadRequestException('برخی محصولات انتخاب‌شده یافت نشد');
      }
      return { linkType, linkUrl: null, productIds };
    }

    return {
      linkType,
      linkUrl: dto.linkUrl?.trim() || null,
      productIds: [],
    };
  }

  private coerceBestsellerProductIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const ids = value
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry) => entry.trim());

    return [...new Set(ids)].slice(0, 12);
  }

  private async resolveBestsellerProducts(sections: CmsHomepageSections): Promise<ProductSummary[]> {
    try {
      const ids = this.coerceBestsellerProductIds(sections.bestsellerProductIds ?? []);

      if (ids.length >= 7) {
        const products = await this.catalogService.findByIds(ids);
        if (products.length >= 7) {
          return products.slice(0, 12) as ProductSummary[];
        }
      }

      return (await this.catalogService.findBestsellers(12)) as ProductSummary[];
    } catch {
      return [];
    }
  }

  private coerceNewArrivalsProductIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const ids = value
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry) => entry.trim());

    return [...new Set(ids)].slice(0, 12);
  }

  private async resolveNewArrivalsProducts(sections: CmsHomepageSections): Promise<ProductSummary[]> {
    try {
      const ids = this.coerceNewArrivalsProductIds(sections.newArrivalsProductIds ?? []);

      if (ids.length >= 1) {
        const products = await this.catalogService.findByIds(ids);
        if (products.length >= 1) {
          return products.slice(0, 12) as ProductSummary[];
        }
      }

      return (await this.catalogService.findNewArrivals(12)) as ProductSummary[];
    } catch {
      return [];
    }
  }

  private mapHomepage(row: Prisma.CmsHomepageGetPayload<object>): CmsHomepageDto {
    return {
      hero: row.hero as unknown as CmsHomepageDto['hero'],
      sections: row.sections as unknown as CmsHomepageDto['sections'],
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapAboutPage(row: Prisma.CmsAboutPageGetPayload<object>): CmsAboutPageDto {
    return {
      meta: row.meta as unknown as CmsAboutPageMeta,
      copy: row.copy as unknown as CmsAboutPageCopy,
      decorImageUrl: row.decorImageUrl,
      values: row.values as unknown as CmsAboutPageValue[],
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapPublicAboutPage(row: Prisma.CmsAboutPageGetPayload<object>): PublicCmsAboutPage {
    const mapped = this.mapAboutPage(row);
    return {
      meta: mapped.meta,
      copy: mapped.copy,
      decorImageUrl: mapped.decorImageUrl,
      values: mapped.values,
    };
  }

  private normalizeAboutMeta(input: Record<string, unknown>): CmsAboutPageMeta {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const description = typeof input.description === 'string' ? input.description.trim() : '';

    if (title.length < 2) {
      throw new BadRequestException('عنوان SEO باید حداقل ۲ کاراکتر باشد');
    }
    if (description.length < 10) {
      throw new BadRequestException('توضیحات SEO باید حداقل ۱۰ کاراکتر باشد');
    }

    return { title, description };
  }

  private normalizeAboutCopy(input: Record<string, unknown>): CmsAboutPageCopy {
    const heroTitle = typeof input.heroTitle === 'string' ? input.heroTitle.trim() : '';
    const intro = typeof input.intro === 'string' ? input.intro.trim() : '';
    const storyTitle = typeof input.storyTitle === 'string' ? input.storyTitle.trim() : '';
    const storyBody = typeof input.storyBody === 'string' ? input.storyBody.trim() : '';
    const valuesTitle = typeof input.valuesTitle === 'string' ? input.valuesTitle.trim() : '';

    if (heroTitle.length < 2) {
      throw new BadRequestException('عنوان صفحه باید حداقل ۲ کاراکتر باشد');
    }
    if (intro.length < 10) {
      throw new BadRequestException('متن معرفی باید حداقل ۱۰ کاراکتر باشد');
    }
    if (storyTitle.length < 2) {
      throw new BadRequestException('عنوان داستان برند باید حداقل ۲ کاراکتر باشد');
    }
    if (storyBody.length < 20) {
      throw new BadRequestException('متن داستان برند باید حداقل ۲۰ کاراکتر باشد');
    }
    if (valuesTitle.length < 2) {
      throw new BadRequestException('عنوان بخش ارزش‌ها باید حداقل ۲ کاراکتر باشد');
    }

    return { heroTitle, intro, storyTitle, storyBody, valuesTitle };
  }

  private normalizeAboutDecorImageUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) {
      throw new BadRequestException('تصویر دکور صفحه درباره ما الزامی است');
    }
    if (trimmed.startsWith('/images/')) {
      return trimmed;
    }
    return requireLibraryImageUrl(trimmed, 'تصویر دکور');
  }

  private normalizeAboutValues(input: CmsAboutPageValue[]): CmsAboutPageValue[] {
    const byKey = new Map(
      (Array.isArray(input) ? input : []).map((value) => [value.key, value]),
    );

    return DEFAULT_CMS_ABOUT_VALUES.map((defaults) => {
      const candidate = byKey.get(defaults.key);
      const label = typeof candidate?.label === 'string' ? candidate.label.trim() : defaults.label;

      if (label.length < 2) {
        throw new BadRequestException(`عنوان ارزش «${defaults.key}» باید حداقل ۲ کاراکتر باشد`);
      }

      return {
        ...defaults,
        label,
      };
    });
  }

  private mapPublicStaticPageSummary(page: { slug: string; title: string }) {
    return {
      slug: page.slug,
      title: page.title,
    };
  }

  private mapPublicStaticPage(page: Prisma.CmsStaticPageGetPayload<object>) {
    return {
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      updatedAt: page.updatedAt.toISOString(),
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

  private mapPublicSeo(row: Prisma.CmsSeoSettingsGetPayload<object>): PublicCmsSeo {
    return {
      siteTitle: row.siteTitle,
      siteDescription: row.siteDescription,
      defaultOgImageUrl: row.defaultOgImageUrl,
      robotsIndex: row.robotsIndex,
      googleAnalyticsId: row.googleAnalyticsId,
      extraMeta: (row.extraMeta as Record<string, string> | null) ?? null,
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

  private async normalizeLensVideoProductIds(productIds: unknown): Promise<string[]> {
    if (!Array.isArray(productIds)) {
      return [];
    }

    const normalized = [...new Set(productIds.filter((id): id is string => typeof id === 'string' && id.length > 0))];
    if (normalized.length > 12) {
      throw new BadRequestException('حداکثر ۱۲ محصول برای هر ویدیو لنز مجاز است');
    }
    if (normalized.length === 0) {
      return [];
    }

    const found = await this.cmsRepository.countProductsByIds(normalized);
    if (found !== normalized.length) {
      throw new BadRequestException('برخی محصولات انتخاب‌شده یافت نشد');
    }

    return normalized;
  }

  private mapLensVideo(video: CmsLensVideoWithProducts): CmsLensVideoDto {
    return {
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      heroImageUrl: video.heroImageUrl,
      hotspots: this.parseLensHotspots(video.hotspots),
      sortOrder: video.sortOrder,
      status: video.status,
      productIds: video.products.map((item) => item.productId),
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    };
  }

  private mapPublicLensVideo(
    video: CmsLensVideoWithProducts,
    productsById: Map<string, ProductSummary>,
  ): PublicCmsLensVideo {
    return {
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      heroImageUrl: video.heroImageUrl,
      hotspots: this.parseLensHotspots(video.hotspots),
      sortOrder: video.sortOrder,
      products: video.products
        .map((item) => productsById.get(item.productId))
        .filter((product): product is ProductSummary => product != null),
    };
  }

  private resolveLensVideoMedia(
    dto: UpsertCmsLensVideoDto,
    existing?: CmsLensVideoWithProducts,
  ): { videoUrl: string; heroImageUrl: string | null; hotspots: CmsLensHotspot[] | null } {
    const videoUrlInput = dto.videoUrl !== undefined ? dto.videoUrl?.trim() : existing?.videoUrl ?? '';
    const heroImageUrlInput =
      dto.heroImageUrl !== undefined
        ? optionalLibraryImageUrl(dto.heroImageUrl, 'تصویر هیرو')
        : existing?.heroImageUrl ?? null;

    const videoUrl = videoUrlInput
      ? requireLibraryImageUrl(videoUrlInput, 'فایل ویدیو')
      : '';
    const heroImageUrl = heroImageUrlInput ?? null;

    if (!videoUrl && !heroImageUrl) {
      throw new BadRequestException('حداقل یکی از تصویر هیرو یا فایل ویدیو الزامی است');
    }

    const hotspots =
      dto.hotspots !== undefined ? this.normalizeLensHotspots(dto.hotspots) : this.parseLensHotspots(existing?.hotspots ?? null);

    return { videoUrl, heroImageUrl, hotspots };
  }

  private normalizeLensHotspots(raw: Record<string, unknown>[] | undefined): CmsLensHotspot[] | null {
    if (!raw || raw.length === 0) {
      return null;
    }

    if (raw.length > 3) {
      throw new BadRequestException('حداکثر ۳ نقطه محصول روی تصویر مجاز است');
    }

    const positionPattern = /^-?\d+(\.\d+)?(%|px)$/;

    return raw.map((item, index) => {
      const top = typeof item.top === 'string' ? item.top.trim() : '';
      const left = typeof item.left === 'string' ? item.left.trim() : '';

      if (!positionPattern.test(top) || !positionPattern.test(left)) {
        throw new BadRequestException(`موقعیت نقطه ${index + 1} نامعتبر است`);
      }

      const hotspot: CmsLensHotspot = { top, left };

      const optionalFields = ['id', 'chipTop', 'chipLeft', 'chipTranslateX', 'chipTranslateY'] as const;
      for (const field of optionalFields) {
        const value = item[field];
        if (typeof value === 'string' && value.trim()) {
          if (field === 'id') {
            hotspot.id = value.trim();
          } else if (field === 'chipTop') {
            hotspot.chipTop = value.trim();
          } else if (field === 'chipLeft') {
            hotspot.chipLeft = value.trim();
          } else if (field === 'chipTranslateX') {
            hotspot.chipTranslateX = value.trim();
          } else if (field === 'chipTranslateY') {
            hotspot.chipTranslateY = value.trim();
          }
        }
      }

      return hotspot;
    });
  }

  private parseLensHotspots(raw: unknown): CmsLensHotspot[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : undefined,
        top: typeof item.top === 'string' ? item.top : '50%',
        left: typeof item.left === 'string' ? item.left : '50%',
        chipTop: typeof item.chipTop === 'string' ? item.chipTop : undefined,
        chipLeft: typeof item.chipLeft === 'string' ? item.chipLeft : undefined,
        chipTranslateX: typeof item.chipTranslateX === 'string' ? item.chipTranslateX : undefined,
        chipTranslateY: typeof item.chipTranslateY === 'string' ? item.chipTranslateY : undefined,
      }));
  }
}
