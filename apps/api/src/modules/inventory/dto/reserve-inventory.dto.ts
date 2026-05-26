import { IsInt, IsString, Min } from 'class-validator';

export class ReserveInventoryDto {
  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
