
import {
    BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/store';
import { AddOrderItemDto } from '../order/dto/add-order-item.dto';

@Injectable()
export class StoresService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

 async createStore(
  data: CreateStoreDto,
  userId: number,
) {
  const existingStore =
    await this.prismaService.store.findUnique({
      where: {
        owner_id: userId,
      },
    });

  if (existingStore) {
    throw new ConflictException(
      'O usuário já possui uma loja',
    );
  }

  return this.prismaService.store.create({
    data: {
      ...data,

      owner: {
        connect: {
          id: userId,
        },
      },
    },

    include: {
      owner: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        
        },
      },
      products: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image_url: true,
          stock: true,
        },
      },
    },
  });
}

  async findById(id: number) {
    const store = await this.prismaService.store.findUnique({
      where: {
        id,
      },

      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(
        'Loja não encontrada',
      );
    }

    return store;
  }

  async findMyStore(userId: number) {
    const store = await this.prismaService.store.findUnique({
      where: {
        owner_id: userId,
      },

      include: {
        owner: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image_url: true,
            stock: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(
        'Você ainda não possui uma loja',
      );
    }

    return store;
  }

    async addItemToCart(
    userId: number,
    dto: AddOrderItemDto,
  ) {
    // =====================================================
    // 1. Procurar produto
    // =====================================================

    const product =
      await this.prismaService.product.findUnique({
        where: {
          id: dto.product_id,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Produto não encontrado.',
      );
    }

    // =====================================================
    // 2. Validar stock
    // =====================================================

    if (product.stock <= 0) {
      throw new BadRequestException(
        'Produto sem stock.',
      );
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException(
        `Stock insuficiente. Stock disponível: ${product.stock}.`,
      );
    }

    // =====================================================
    // 3. Procurar o carrinho do utilizador
    // =====================================================

    const order =
      await this.prismaService.order.findFirst({
        where: {
          user_id: userId,
          status: 'CART',
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Carrinho não encontrado.',
      );
    }

    // =====================================================
    // 4. Procurar OrderStore
    //
    // O store_id vem do Product
    // =====================================================

    let orderStore =
      await this.prismaService.orderStore.findUnique({
        where: {
          order_id_store_id: {
            order_id: order.id,
            store_id: product.store_id,
          },
        },
      });

    // =====================================================
    // 5. Se a loja ainda não está no pedido,
    //    criar OrderStore
    // =====================================================

    if (!orderStore) {
      orderStore =
        await this.prismaService.orderStore.create({
          data: {
            order_id: order.id,
            store_id: product.store_id,
            subtotal: 0,
          },
        });
    }

    // =====================================================
    // 6. Verificar se o produto já está no carrinho
    // =====================================================

    const existingItem =
      await this.prismaService.orderItem.findUnique({
        where: {
          order_store_id_product_id: {
            order_store_id: orderStore.id,
            product_id: product.id,
          },
        },
      });

    // =====================================================
    // 7. Se já existe, aumentar quantidade
    // =====================================================

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + dto.quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Stock insuficiente. Já existem ${existingItem.quantity} unidades no carrinho. Stock disponível: ${product.stock}.`,
        );
      }

      await this.prismaService.orderItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
      });
    }

    // =====================================================
    // 8. Caso contrário, criar OrderItem
    // =====================================================

    else {
      await this.prismaService.orderItem.create({
        data: {
          order_store_id: orderStore.id,
          product_id: product.id,
          quantity: dto.quantity,

          // O preço vem da BD
          unit_price: product.price,
        },
      });
    }

    // =====================================================
    // 9. Recalcular valores
    // =====================================================

    await this.recalculateOrder(order.id);

    // =====================================================
    // 10. Devolver carrinho atualizado
    // =====================================================

    return this.getCart(userId);
  }

  // =======================================================
  // OBTER CARRINHO
  // =======================================================

  async getCart(userId: number) {
    const order =
      await this.prismaService.order.findFirst({
        where: {
          user_id: userId,
          status: 'CART',
        },

        include: {
          order_stores: {
            include: {
              store: true,

              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!order) {
      return {
        id: null,
        user_id: userId,
        total: 0,
        status: 'CART',
        order_stores: [],
      };
    }

    return order;
  }

  // =======================================================
  // RECALCULAR ORDER
  // =======================================================

  private async recalculateOrder(
    orderId: number,
  ) {
    const orderStores =
      await this.prismaService.orderStore.findMany({
        where: {
          order_id: orderId,
        },

        include: {
          items: true,
        },
      });

    let orderTotal = 0;

    // -----------------------------------------------------
    // Calcular subtotal de cada loja
    // -----------------------------------------------------

    for (const orderStore of orderStores) {
      const subtotal =
        orderStore.items.reduce(
          (total, item) => {
            return (
              total +
              item.quantity *
                item.unit_price
            );
          },
          0,
        );

      await this.prismaService.orderStore.update({
        where: {
          id: orderStore.id,
        },

        data: {
          subtotal,
        },
      });

      orderTotal += subtotal;
    }

    // -----------------------------------------------------
    // Atualizar total do pedido
    // -----------------------------------------------------

    await this.prismaService.order.update({
      where: {
        id: orderId,
      },

      data: {
        total: orderTotal,
      },
    });
  }
}



