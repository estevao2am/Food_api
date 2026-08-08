import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

async createProduct(
  data: CreateProductDto,
  userId: number,
) {
  const store =
    await this.prismaService.store.findUnique({
      where: {
        owner_id: userId,
      },
    });

  if (!store) {
    throw new NotFoundException(
      'Você precisa ter uma loja para criar produtos',
    );
  }

  const category =
    await this.prismaService.category.findUnique({
      where: {
        id: data.category_id,
      },
    });

  if (!category) {
    throw new BadRequestException(
      'Categoria não encontrada',
    );
  }

  return this.prismaService.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      image_url: data.image_url,

      store: {
        connect: {
          id: store.id,
        },
      },

      category: {
        connect: {
          id: category.id,
        },
      },
    },
  });
  }

  
  async findAllProducts() {
    return await this.prismaService.product.findMany();
  }

  async findProductById(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    await this.findProductById(id);

    return await this.prismaService.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: number) {
    await this.findProductById(id);

    return await this.prismaService.product.delete({
      where: { id },
    });
  }
}
