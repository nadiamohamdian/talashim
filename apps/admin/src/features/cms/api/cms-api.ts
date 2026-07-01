import { axiosClient } from '@/shared/api/axios-client';
import type {
  AdminBlogCategoryDto,
  AdminBlogPostDto,
  CmsBannerDto,
  CmsAboutPageDto,
  CmsHomepageDto,
  CmsLensVideoDto,
  CmsSeoSettingsDto,
  CmsStaticPageDto,
  MediaAssetDto,
  PaginatedResponse,
} from '@talashim/types';

export type UpsertFaqPayload = {
  question: string;
  answer: string;
  slug: string;
  coverImageUrl?: string;
  isPublished?: boolean;
  sortOrder?: number;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function faqPayloadToApiBody(payload: UpsertFaqPayload) {
  const plain = stripHtml(payload.answer);
  const coverImageUrl = payload.coverImageUrl?.trim();
  return {
    title: payload.question.trim(),
    slug: payload.slug.trim(),
    content: payload.answer,
    excerpt: plain.slice(0, 400),
    ...(coverImageUrl ? { coverImageUrl } : {}),
    isPublished: payload.isPublished ?? true,
    sortOrder: payload.sortOrder ?? 0,
    publishedAt: new Date().toISOString(),
  };
}

export type UpsertBlogPostPayload = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  categoryId?: string;
  publishedAt?: string;
  isPublished?: boolean;
  sortOrder?: number;
};

export type UpsertBannerPayload = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType?: CmsBannerDto['linkType'];
  linkUrl?: string;
  productIds?: string[];
  placement?: CmsBannerDto['placement'];
  sortOrder?: number;
  status?: CmsBannerDto['status'];
  startsAt?: string;
  endsAt?: string;
};

export type UpsertStaticPagePayload = {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished?: boolean;
};

export type RegisterMediaPayload = {
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  alt?: string;
  folder?: string;
};

export function fetchBlogCategories() {
  return axiosClient.get<AdminBlogCategoryDto[]>('/admin/cms/blog/categories').then((r) => r.data);
}

export function fetchAdminBlogPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  published?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<AdminBlogPostDto>>('/admin/cms/blog', { params })
    .then((r) => r.data);
}

export function createBlogPost(payload: UpsertBlogPostPayload) {
  return axiosClient.post<AdminBlogPostDto>('/admin/cms/blog', payload).then((r) => r.data);
}

export function updateBlogPost(id: string, payload: UpsertBlogPostPayload) {
  return axiosClient.patch<AdminBlogPostDto>(`/admin/cms/blog/${id}`, payload).then((r) => r.data);
}

export function deleteBlogPost(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/cms/blog/${id}`).then((r) => r.data);
}

export function fetchAdminFaq(params?: { page?: number; limit?: number; search?: string }) {
  return axiosClient
    .get<PaginatedResponse<AdminBlogPostDto>>('/admin/cms/faq', { params })
    .then((r) => r.data);
}

export function createFaqEntry(payload: UpsertFaqPayload) {
  return axiosClient
    .post<AdminBlogPostDto>('/admin/cms/faq', faqPayloadToApiBody(payload))
    .then((r) => r.data);
}

export function updateFaqEntry(id: string, payload: UpsertFaqPayload) {
  return axiosClient
    .patch<AdminBlogPostDto>(`/admin/cms/faq/${id}`, faqPayloadToApiBody(payload))
    .then((r) => r.data);
}

export function deleteFaqEntry(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/cms/faq/${id}`).then((r) => r.data);
}

export function fetchHomepageCms() {
  return axiosClient.get<CmsHomepageDto>('/admin/cms/homepage').then((r) => r.data);
}

export function updateHomepageCms(payload: Pick<CmsHomepageDto, 'hero' | 'sections'>) {
  return axiosClient.patch<CmsHomepageDto>('/admin/cms/homepage', payload).then((r) => r.data);
}

export function fetchAboutPageCms() {
  return axiosClient.get<CmsAboutPageDto>('/admin/cms/about').then((r) => r.data);
}

export type UpdateAboutPagePayload = Omit<CmsAboutPageDto, 'updatedAt'>;

export function updateAboutPageCms(payload: UpdateAboutPagePayload) {
  return axiosClient.patch<CmsAboutPageDto>('/admin/cms/about', payload).then((r) => r.data);
}

export function fetchBanners(params?: {
  page?: number;
  status?: string;
  placement?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<CmsBannerDto>>('/admin/cms/banners', { params })
    .then((r) => r.data);
}

export function createBanner(payload: UpsertBannerPayload) {
  return axiosClient.post<CmsBannerDto>('/admin/cms/banners', payload).then((r) => r.data);
}

export function updateBanner(id: string, payload: UpsertBannerPayload) {
  return axiosClient.patch<CmsBannerDto>(`/admin/cms/banners/${id}`, payload).then((r) => r.data);
}

export function deleteBanner(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/cms/banners/${id}`).then((r) => r.data);
}

export type UpsertLensVideoPayload = {
  title?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  heroImageUrl?: string;
  hotspots?: Array<{
    id?: string;
    top: string;
    left: string;
    chipTop?: string;
    chipLeft?: string;
    chipTopMobile?: string;
    chipLeftMobile?: string;
    chipTranslateX?: string;
    chipTranslateY?: string;
  }>;
  sortOrder?: number;
  status?: CmsBannerDto['status'];
  productIds?: string[];
};

export function fetchLensVideos(params?: { page?: number; status?: string }) {
  return axiosClient
    .get<PaginatedResponse<CmsLensVideoDto>>('/admin/cms/lens-videos', { params })
    .then((r) => r.data);
}

export function createLensVideo(payload: UpsertLensVideoPayload) {
  return axiosClient.post<CmsLensVideoDto>('/admin/cms/lens-videos', payload).then((r) => r.data);
}

export function updateLensVideo(id: string, payload: UpsertLensVideoPayload) {
  return axiosClient
    .patch<CmsLensVideoDto>(`/admin/cms/lens-videos/${id}`, payload)
    .then((r) => r.data);
}

export function deleteLensVideo(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/cms/lens-videos/${id}`).then((r) => r.data);
}

export function fetchStaticPages(params?: {
  page?: number;
  search?: string;
  published?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<CmsStaticPageDto>>('/admin/cms/pages', { params })
    .then((r) => r.data);
}

export function createStaticPage(payload: UpsertStaticPagePayload) {
  return axiosClient.post<CmsStaticPageDto>('/admin/cms/pages', payload).then((r) => r.data);
}

export function updateStaticPage(id: string, payload: UpsertStaticPagePayload) {
  return axiosClient
    .patch<CmsStaticPageDto>(`/admin/cms/pages/${id}`, payload)
    .then((r) => r.data);
}

export function deleteStaticPage(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/cms/pages/${id}`).then((r) => r.data);
}

export function fetchSeoSettings() {
  return axiosClient.get<CmsSeoSettingsDto>('/admin/cms/seo').then((r) => r.data);
}

export function updateSeoSettings(payload: Omit<CmsSeoSettingsDto, 'updatedAt'>) {
  return axiosClient.put<CmsSeoSettingsDto>('/admin/cms/seo', payload).then((r) => r.data);
}

export function fetchMediaAssets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
  mimeType?: string;
}) {
  return axiosClient
    .get<PaginatedResponse<MediaAssetDto>>('/admin/media', { params })
    .then((r) => r.data);
}

export function registerMediaAsset(payload: RegisterMediaPayload) {
  return axiosClient.post<MediaAssetDto>('/admin/media', payload).then((r) => r.data);
}

export function updateMediaAsset(id: string, payload: { alt?: string }) {
  return axiosClient.patch<MediaAssetDto>(`/admin/media/${id}`, payload).then((r) => r.data);
}

export function deleteMediaAsset(id: string) {
  return axiosClient.delete<{ ok: boolean }>(`/admin/media/${id}`).then((r) => r.data);
}

export function uploadMediaImage(file: File, options?: { folder?: string }) {
  const form = new FormData();
  form.append('file', file);
  const folder = options?.folder ?? 'general';
  return axiosClient
    .post<MediaAssetDto>(`/admin/media/upload?folder=${encodeURIComponent(folder)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function uploadMediaVideo(file: File, options?: { folder?: string }) {
  const form = new FormData();
  form.append('file', file);
  const folder = options?.folder ?? 'lens';
  return axiosClient
    .post<MediaAssetDto>(`/admin/media/upload-video?folder=${encodeURIComponent(folder)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export function fetchBlogPostReviews(params?: {
  page?: number;
  status?: string;
  search?: string;
  groupByBlogPost?: boolean;
}) {
  const { groupByBlogPost, ...rest } = params ?? {};

  return axiosClient
    .get<
      PaginatedResponse<import('@talashim/types').AdminBlogPostReviewItem> |
        import('@talashim/types').AdminBlogPostReviewsGroupedResponse
    >('/admin/blog-post-reviews', {
      params: {
        ...rest,
        ...(groupByBlogPost ? { groupByBlogPost: true } : {}),
      },
    })
    .then((r) => r.data);
}

export function reviewBlogPostReview(
  id: string,
  payload: { status: 'APPROVED' | 'REJECTED' },
) {
  return axiosClient
    .patch<import('@talashim/types').AdminBlogPostReviewItem>(
      `/admin/blog-post-reviews/${id}/review`,
      payload,
    )
    .then((r) => r.data);
}

export function createAdminBlogPostReview(body: {
  blogPostSlug: string;
  body: string;
  rating: number;
  authorName?: string;
  phone?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  return axiosClient
    .post<import('@talashim/types').AdminBlogPostReviewItem>('/admin/blog-post-reviews', body)
    .then((r) => r.data);
}

export function updateAdminBlogPostReview(
  id: string,
  body: {
    body?: string;
    rating?: number;
    authorName?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  },
) {
  return axiosClient
    .patch<import('@talashim/types').AdminBlogPostReviewItem>(`/admin/blog-post-reviews/${id}`, body)
    .then((r) => r.data);
}

export function deleteAdminBlogPostReview(id: string) {
  return axiosClient.delete(`/admin/blog-post-reviews/${id}`).then((r) => r.data);
}
