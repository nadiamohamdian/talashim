import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleWishlistDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  productId!: string;
}
