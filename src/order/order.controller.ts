import {
    Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
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

  @Get()
  async getAllOrders(@Query('page') page = '1') {
    return this.orderService.getAllOrders(Number(page));
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

  @Get(':id')
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOrderById(id);}
}
