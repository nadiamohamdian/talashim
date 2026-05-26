import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertCartItemDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionKey?: string;

  @IsString()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
