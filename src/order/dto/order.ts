
import { IsEnum } from 'class-validator';

export enum OrderStatusDto {
  CART = 'CART',
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// =====================================================
// CREATE ORDER
// =====================================================

export class CreateOrderDto {
  // Não precisa de campos.
  //
  // O user_id vem do JWT:
  // req.user.id
  //
  // O status é definido pelo backend:
  // CART
  //
  // O total começa em:
  // 0
  //
  // As lojas e produtos são adicionados
  // posteriormente através do carrinho.
}

// =====================================================
// UPDATE ORDER STATUS
// =====================================================

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusDto)
  status!: OrderStatusDto;
}

