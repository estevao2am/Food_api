import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product';
import { CurrentUser } from '../users/decorator/current-user.decorator';
import { AuthGuard } from '../users/auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

@UseGuards(AuthGuard)
@Post()
async createProduct(
  @Body() data: CreateProductDto,
  @CurrentUser() user: { sub: number },
) {
  return this.productService.createProduct(
    data,
    user.sub,
  );
}

  @Get()
  async findAllProducts() {
    return await this.productService.findAllProducts();
  }

  @Get(':id')
  async findProductById(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.findProductById(id);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, body);
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.deleteProduct(id);
  }
}
