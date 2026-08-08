import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/user';
import { UsersService } from './users.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersServices: UsersService) {}

  @Post('/')
  async createUser(@Body() body: CreateUserDto) {
    return await this.usersServices.createUser(body);
  }

  @Post('/login')
  async loginUser(@Body() body: LoginUserDto) {
    return await this.usersServices.loginUser(body);
  }

  // Endpoint to get the current authenticated user's information
  @UseGuards(AuthGuard)
  @Get('/me')
  async me(@CurrentUser() user: { sub: number }) {
    return await this.usersServices.findById(user.sub);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersServices.findById(id);
  }
}
