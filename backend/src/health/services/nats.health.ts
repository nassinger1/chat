import type { NatsConnection } from "@nats-io/nats-core";
import { Inject, Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";
import { NATS_CONNECTION } from "@/broker/broker.types.js";

@Injectable()
export class NatsHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(NATS_CONNECTION) private readonly connection: NatsConnection,
  ) {}

  pingCheck(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const isDown = this.connection.isClosed() || this.connection.isDraining();

    return isDown ? indicator.down() : indicator.up();
  }
}
