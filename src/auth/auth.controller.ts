import { Body, Controller, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {

  constructor(private userService: UsersService) {}
  
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.userService.createUserAndAccount(createUserDto, req);
  }

  @UseGuards(AuthGuard('local')) 
  @Post('login')
  async login(@Request() req) {
    req.session.user = req.user;
    req.session.save();
    return req.user;
  }

  @Post('logout')
  async logout(@Request() req , @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
      return res.status(200).json({ message: 'Déconnexion réussie' });
    });
  }
}