
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

}



