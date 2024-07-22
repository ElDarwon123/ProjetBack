/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  NotFoundException,
  Request,
  UseGuards,
  Response,
  Patch,
} from '@nestjs/common';
//import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from './guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { Request as Requ, Response as Res } from 'express';
// autenticatio
@ApiTags('Autorizaciones, Iniciar Sesión y Ver Perfil')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.singIn(
      createAuthDto.email,
      createAuthDto.contrasena,
    );
  }
  // profile
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Post('logout')
  async logOut(@Request() req: Requ, @Response() res: Res) {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.logOut({ token });
    res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Response() res: Res) {
    await this.authService.sendPassWordResetEmail(email);
    res.status(HttpStatus.OK).json({ message: 'Password reset email sent' });
  }

  @Patch('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
    @Response() res: Res
  ) {
    await this.authService.resetPassword(token, newPassword);
    res.status(HttpStatus.OK).json({ message: 'Password reseted successfully ' })
  }
}
