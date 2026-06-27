import type { PublicCatalogCategoryPage } from '@sadafgold/types';
import { axiosClient } from '@/shared/api/axios-client';
import type {
  AdminCatalogCategoryPageDto,
  CreateCatalogCategoryPageDto,
  UpdateCatalogCategoryPageDto,
} from '@sadafgold/types';

export function fetchAdminCatalogCategories() {
  return axiosClient
    .get<AdminCatalogCategoryPageDto[]>('/admin/catalog-categories')
    .then((response) => response.data);
}

export function fetchAdminCatalogCategory(id: string) {
  return axiosClient
    .get<AdminCatalogCategoryPageDto>(`/admin/catalog-categories/${id}`)
    .then((response) => response.data);
}

export function createAdminCatalogCategory(body: CreateCatalogCategoryPageDto) {
  return axiosClient
    .post<AdminCatalogCategoryPageDto>('/admin/catalog-categories', body)
    .then((response) => response.data);
}

export function updateAdminCatalogCategory(id: string, body: UpdateCatalogCategoryPageDto) {
  return axiosClient
    .patch<AdminCatalogCategoryPageDto>(`/admin/catalog-categories/${id}`, body)
    .then((response) => response.data);
}

export function deleteAdminCatalogCategory(id: string) {
  return axiosClient.delete(`/admin/catalog-categories/${id}`).then((response) => response.data);
}

export function fetchPublicCatalogCategoryPage(slug: string) {
  return axiosClient
    .get<PublicCatalogCategoryPage>(`/catalog/categories/pages/${slug}`)
    .then((response) => response.data);
}
