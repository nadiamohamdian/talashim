import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  DEFAULT_CMS_HERO,
  DEFAULT_CMS_SECTIONS,
  DEFAULT_CMS_SEO,
} from '../cms/cms-defaults';

@Injectable()
export class AdminCmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listBlogCategories() {
    return this.prisma.blogCategory.findMany({ orderBy: { title: 'asc' } });
  }

  findBlogCategoryBySlug(slug: string) {
    return this.prisma.blogCategory.findUnique({ where: { slug } });
  }

  listBlogPosts(
    skip: number,
    take: number,
    search?: string,
    categorySlug?: string,
    publishedFilter?: 'true' | 'false' | 'all',
  ) {
    const where: Prisma.BlogPostWhereInput = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    } else {
      where.NOT = { category: { slug: 'faq' } };
    }

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (publishedFilter === 'true') {
      where.isPublished = true;
    } else if (publishedFilter === 'false') {
      where.isPublished = false;
    }

    return this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
        include: { category: true },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
  }

  findBlogPostById(id: string) {
    return this.prisma.blogPost.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  findBlogPostBySlug(slug: string) {
    return this.prisma.blogPost.findUnique({ where: { slug } });
  }

  findStaticPageBySlug(slug: string) {
    return this.prisma.cmsStaticPage.findUnique({ where: { slug } });
  }

  createBlogPost(data: Prisma.BlogPostCreateInput) {
    return this.prisma.blogPost.create({
      data,
      include: { category: true },
    });
  }

  updateBlogPost(id: string, data: Prisma.BlogPostUpdateInput) {
    return this.prisma.blogPost.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  deleteBlogPost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  listBanners(skip: number, take: number, status?: string, placement?: string) {
    const where: Prisma.CmsBannerWhereInput = {};
    if (status) {
      where.status = status as Prisma.EnumCmsBannerStatusFilter['equals'];
    }
    if (placement) {
      where.placement =
        placement as Prisma.EnumCmsBannerPlacementFilter['equals'];
    }

    return this.prisma.$transaction([
      this.prisma.cmsBanner.findMany({
        where,
        skip,
        take,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.cmsBanner.count({ where }),
    ]);
  }

  findBannerById(id: string) {
    return this.prisma.cmsBanner.findUnique({ where: { id } });
  }

  createBanner(data: Prisma.CmsBannerCreateInput) {
    return this.prisma.cmsBanner.create({ data });
  }

  updateBanner(id: string, data: Prisma.CmsBannerUpdateInput) {
    return this.prisma.cmsBanner.update({ where: { id }, data });
  }

  deleteBanner(id: string) {
    return this.prisma.cmsBanner.delete({ where: { id } });
  }

  async getOrCreateHomepage() {
    const existing = await this.prisma.cmsHomepage.findUnique({
      where: { id: 'default' },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.cmsHomepage.create({
      data: {
        id: 'default',
        hero: DEFAULT_CMS_HERO as unknown as Prisma.InputJsonValue,
        sections: DEFAULT_CMS_SECTIONS as unknown as Prisma.InputJsonValue,
      },
    });
  }

  updateHomepage(hero: Prisma.InputJsonValue, sections: Prisma.InputJsonValue) {
    return this.prisma.cmsHomepage.upsert({
      where: { id: 'default' },
      create: { id: 'default', hero, sections },
      update: { hero, sections },
    });
  }

  listStaticPages(
    skip: number,
    take: number,
    search?: string,
    publishedFilter?: string,
  ) {
    const where: Prisma.CmsStaticPageWhereInput = {};

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (publishedFilter === 'true') {
      where.isPublished = true;
    } else if (publishedFilter === 'false') {
      where.isPublished = false;
    }

    return this.prisma.$transaction([
      this.prisma.cmsStaticPage.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.cmsStaticPage.count({ where }),
    ]);
  }

  findStaticPageById(id: string) {
    return this.prisma.cmsStaticPage.findUnique({ where: { id } });
  }

  createStaticPage(data: Prisma.CmsStaticPageCreateInput) {
    return this.prisma.cmsStaticPage.create({ data });
  }

  updateStaticPage(id: string, data: Prisma.CmsStaticPageUpdateInput) {
    return this.prisma.cmsStaticPage.update({ where: { id }, data });
  }

  deleteStaticPage(id: string) {
    return this.prisma.cmsStaticPage.delete({ where: { id } });
  }

  async getOrCreateSeo() {
    const existing = await this.prisma.cmsSeoSettings.findUnique({
      where: { id: 'default' },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.cmsSeoSettings.create({
      data: {
        id: 'default',
        siteTitle: DEFAULT_CMS_SEO.siteTitle,
        siteDescription: DEFAULT_CMS_SEO.siteDescription,
        defaultOgImageUrl: DEFAULT_CMS_SEO.defaultOgImageUrl,
        robotsIndex: DEFAULT_CMS_SEO.robotsIndex,
        googleAnalyticsId: DEFAULT_CMS_SEO.googleAnalyticsId,
        extraMeta: DEFAULT_CMS_SEO.extraMeta ?? undefined,
      },
    });
  }

  updateSeo(data: Prisma.CmsSeoSettingsUpdateInput) {
    return this.prisma.cmsSeoSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        siteTitle: DEFAULT_CMS_SEO.siteTitle,
        siteDescription: DEFAULT_CMS_SEO.siteDescription,
        defaultOgImageUrl: DEFAULT_CMS_SEO.defaultOgImageUrl,
        robotsIndex: DEFAULT_CMS_SEO.robotsIndex,
      },
      update: data,
    });
  }

  listMedia(
    skip: number,
    take: number,
    search?: string,
    folder?: string,
    mimeType?: string,
  ) {
    const where: Prisma.MediaAssetWhereInput = {};

    if (folder) {
      where.folder = folder;
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    if (search?.trim()) {
      where.OR = [
        { filename: { contains: search.trim(), mode: 'insensitive' } },
        { alt: { contains: search.trim(), mode: 'insensitive' } },
        { url: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    return this.prisma.$transaction([
      this.prisma.mediaAsset.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);
  }

  findMediaById(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }

  createMedia(data: Prisma.MediaAssetCreateInput) {
    return this.prisma.mediaAsset.create({ data });
  }

  deleteMedia(id: string) {
    return this.prisma.mediaAsset.delete({ where: { id } });
  }
}
