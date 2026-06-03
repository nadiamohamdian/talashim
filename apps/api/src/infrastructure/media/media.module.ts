import { Module } from '@nestjs/common';
import { MediaFilesController } from './media-files.controller';
import { MediaStorageService } from './media-storage.service';

@Module({
  controllers: [MediaFilesController],
  providers: [MediaStorageService],
  exports: [MediaStorageService],
})
export class MediaModule {}
