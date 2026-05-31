import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Public } from '@/common/decorators/public.decorator';
import type { LiveGoldPriceDto } from '../dto/gold-price.dto';
import { PricingEngineService } from '../services/pricing-engine.service';

@Public()
@WebSocketGateway({
  namespace: '/pricing',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class PricingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(PricingGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly pricingEngine: PricingEngineService) {}

  async handleConnection(client: Socket) {
    try {
      const latest = await this.pricingEngine.getLivePrice();
      client.emit('price.update', latest);
    } catch (error) {
      this.logger.warn(
        `Failed to send initial price: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  broadcastPriceUpdate(price: LiveGoldPriceDto) {
    if (!this.server) return;
    this.server.emit('price.update', price);
  }
}
