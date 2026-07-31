import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';
import { RedisService } from '../../infrastructure/redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Service health check' })
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      async () => {
        const pong = await this.redis.ping();
        return {
          redis: {
            status: pong === 'PONG' ? ('up' as const) : ('down' as const),
          },
        };
      },
    ]);
  }
}
