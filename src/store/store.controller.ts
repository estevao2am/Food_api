
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './store.service';
import { AuthGuard } from '../users/auth.guard';
import { CurrentUser } from '../users/decorator/current-user.decorator';
import { CreateStoreDto } from './dto/store';


@Controller('store')
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
  ) {}

  /**
   * Criar loja para o usuário autenticado
   */
  @UseGuards(AuthGuard)
  @Post()
  async createStore(
    @Body() data: CreateStoreDto,
    @CurrentUser() user: { sub: number },
  ) {
    return this.storesService.createStore(
      data,
      user.sub,
    );
  }

  /**
   * Buscar a loja do usuário autenticado
   */
  @UseGuards(AuthGuard)
  @Get('me')
  async myStore(
    @CurrentUser() user: { sub: number },
  ) {
    return this.storesService.findMyStore(user.sub);
  }

  /**
   * Buscar uma loja pelo ID
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.storesService.findById(id);
  }
}
