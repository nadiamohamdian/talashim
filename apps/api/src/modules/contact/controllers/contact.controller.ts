import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@/common/decorators/public.decorator';
import { ApiPublicErrors } from '@/swagger/decorators/api-protected.decorator';
import { ContactDto } from '../dto/contact.dto';
import { ContactService } from '../services/contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit contact form message' })
  @ApiPublicErrors()
  submit(@Body() payload: ContactDto) {
    return this.contactService.submit(payload);
  }
}
