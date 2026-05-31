import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/common/interfaces/auth-user.interface';
import { ApiProtected } from '@/swagger/decorators/api-protected.decorator';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressesService } from '../services/addresses.service';

@ApiTags('addresses')
@ApiProtected()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List user addresses' })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.addressesService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() payload: CreateAddressDto) {
    return this.addressesService.create(user.id, payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() payload: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.id, id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.addressesService.remove(user.id, id);
  }
}
