import { Controller, Post, Body, UseGuards, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/auth.guard';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(AuthenticatedGuard)
  @Post('me')
  async me(@Request() req) {
    return this.userService.findByEmail(req.session.user.email);
  }


}