import { Body, Controller, Get, Post } from '@nestjs/common';
import { HttpUser } from '../auth/decorators/http-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPlan } from './enums/subscription-plan.enum';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Public()
  @Get('plans')
  plans() {
    return this.subscriptionsService.getPlanCatalog();
  }

  @Get('me')
  me(@HttpUser() user: JwtPayload) {
    return this.subscriptionsService.getByUserId(user.userId);
  }

  @Get('me/entitlements')
  entitlements(@HttpUser() user: JwtPayload) {
    return this.subscriptionsService.getEntitlementsForUser(user.userId);
  }

  @Post('mock-checkout')
  mockCheckout(
    @HttpUser() user: JwtPayload,
    @Body() body: { plan: SubscriptionPlan },
  ) {
    return this.subscriptionsService.updatePlan(
      user.userId,
      body.plan,
    );
  }

  @Post('cancel')
  cancel(@HttpUser() user: JwtPayload) {
    return this.subscriptionsService.cancel(user.userId);
  }
}
