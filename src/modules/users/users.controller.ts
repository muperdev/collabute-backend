import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request as RequestDecorator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import {
  createUserDecorator,
  findAllUsersDecorator,
  findUserByIdDecorator,
  updateUserDecorator,
  deleteUserDecorator,
} from './decorators/response.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  @createUserDecorator()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @findAllUsersDecorator()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @findUserByIdDecorator()
  findOne(@Param('id') id: string, @RequestDecorator() req: any) {
    return this.usersService.findById(id, req.user.id);
  }

  @Patch(':id')
  @updateUserDecorator()
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @RequestDecorator() req: any,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @deleteUserDecorator()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
