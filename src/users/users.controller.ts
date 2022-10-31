import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Session, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorators';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from './user.entity';

@Controller('auth')
@Serialize(UserDto)

export class UsersController {
    constructor(
        private usersService: UsersService,
        private authService: AuthService) { }
    @Get('/whoami')
    @UseGuards(AuthGuard)
    whoAmI(@CurrentUser() user: User) {
        return user;
    }
    @Post('/signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.signup(body.email, body.password);
        session.userId = user.id;
        return user;
    }

    @Post('/signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any) {
        const user = await this.authService.signin(body.email, body.password);
        session.userId = user.id;
        return user;
    }
    @Post('/signout')
    async signout(@Session() session: any) {
        session.userId = null
    }
    // @UseInterceptors(new SerializerInterceptor(UserDto))
    @Get('/:id')
    findUser(@Param('id') id: string) {
        const user = this.usersService.findOne(parseInt(id))
        if (!user) {
            throw new NotFoundException("user not found")
        }
        return user
    }
    @Get()
    findAlluser(@Query('email') email: string) {
        return this.usersService.find(email)
    }
    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.usersService.remove(parseInt(id))
    }
    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(parseInt(id), body)
    }
}
