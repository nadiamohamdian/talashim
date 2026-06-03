import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('media')
@Public()
@Controller('media-files')
export class MediaFilesController {
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  @Get(':folder/:filename')
  @ApiOperation({ summary: 'Serve uploaded media file' })
  serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const absolutePath = join(this.uploadRoot, safeFolder, safeName);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('File not found');
    }

    const ext = safeName.split('.').pop()?.toLowerCase();
    const mime =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'gif'
            ? 'image/gif'
            : ext === 'pdf'
              ? 'application/pdf'
              : 'image/jpeg';

    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Type', mime);

    return new StreamableFile(createReadStream(absolutePath));
  }
}
