import {
    Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { AuthGuard } from '../users/auth.guard';
import { CurrentUser } from '../users/decorator/current-user.decorator';
import { AddOrderItemDto } from './dto/add-order-item.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrder(
    @CurrentUser() user: { sub: number },
  ) {
    return this.orderService.createOrder(user.sub);
  }

@UseGuards(AuthGuard)
  @Get('cart')
  async getMyCart(
    @CurrentUser() user: { sub: number },
  ) {
    return this.orderService.getMyCart(user.sub);
  }

    // ============================================
  // ADICIONAR PRODUTO AO CARRINHO
  // ============================================

  @UseGuards(AuthGuard)
  @Post('cart/item')
  async addProductToCart(
    @CurrentUser() user: { sub: number },
    @Body() data: AddOrderItemDto,
  ) {
    return this.orderService.addItem(
      user.sub,
      data.product_id,
      data.quantity,
    );
  }
}
