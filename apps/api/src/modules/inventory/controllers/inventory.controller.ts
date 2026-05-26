import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReserveInventoryDto } from '../dto/reserve-inventory.dto';
import { InventoryService } from '../services/inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productId')
  findByProductId(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Post('reserve')
  reserve(@Body() payload: ReserveInventoryDto) {
    return this.inventoryService.reserve(payload);
  }
}
