import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffRoleGuard } from '@/common/guards/staff-role.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import {
  CreateAdminCatalogCategoryPageDto,
  UpdateAdminCatalogCategoryPageDto,
} from '../dto/admin-catalog-category.dto';
import { AdminCatalogCategoriesService } from '../services/admin-catalog-categories.service';

@ApiTags('admin-catalog-categories')
@ApiProtected()
@UseGuards(StaffRoleGuard)
@Controller('admin/catalog-categories')
export class AdminCatalogCategoriesController {
  constructor(private readonly service: AdminCatalogCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List catalog category pages' })
  list(@CurrentUser() actor: AuthenticatedUser) {
    return this.service.list(actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get catalog category page' })
  getById(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.getById(id, actor);
  }

  @Post()
  @ApiOperation({ summary: 'Create catalog category page' })
  create(
    @Body() dto: CreateAdminCatalogCategoryPageDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update catalog category page' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminCatalogCategoryPageDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete catalog category page' })
  remove(@Param('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.remove(id, actor);
  }
}
