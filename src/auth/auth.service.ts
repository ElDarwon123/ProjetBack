import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UsuarioService } from 'src/usuario/usuario.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { BlackList } from './schema/auth.entity';
import { Model } from 'mongoose';
import { CreateBlackList } from './dto/create-blackList.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateUsuarioDto } from 'src/usuario/dto/update-usuario.dto';
import { Usuario } from 'src/usuario/schema/usuario.schema';
import { Proyecto } from 'src/proyecto/schema/proyecto.shema';
import { ProyectoService } from 'src/proyecto/proyecto.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsuarioService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private projectService: ProyectoService,
    private configService: ConfigService,
    @InjectModel(BlackList.name) private readonly blackList: Model<BlackList>,
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
  ) {}

  async singIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(email);

    try {
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isMatch = await bcrypt.compare(pass, user.contrasena);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      console.log('pasate');
      const payLoad = { sub: user, role: user.role };
      return {
        access_token: await this.jwtService.signAsync(payLoad, { secret: this.configService.get<string>('JWT_SECRET')}),
      };
    } catch (err) {
      throw new NotFoundException('Invalid Credentials');
    }
  }

  async logOut(token: CreateBlackList) {
    const tokenInBl = new this.blackList(token);
    await tokenInBl.save();
    return tokenInBl;
  }

  async validateToken(token: string): Promise<boolean> {
    const tokenInBlackList = await this.blackList.findOne({ token });
    if (tokenInBlackList) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  async sendPassWordResetEmail(email: string): Promise<{ pass_token: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.jwtService.signAsync(
      { email: user.email, id: user._id },
      { expiresIn: '1h', secret: this.configService.get<string>('JWT_SECRET') },
    );

    const resetUrl = `https://project-wizzard-react-1ea9hjmqv-neukkkens-projects.vercel.app/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password reset',
        template: 'reset-password',
        context: {
          name: user.nombre,
          resetUrl,
          token: token,
        },
      });
      return {
        pass_token: token,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenExpiredError('Token Expired', new Date());
      }
      throw new JsonWebTokenError(error);
    }
  }

  async resetPassword(token: string, newPassword: UpdateUsuarioDto) {
    let email: string;
    let id: string;
    try {
      const decoded = await this.jwtService.verifyAsync(token, {secret: this.configService.get<string>('JWT_SECRET')});
      email = decoded.email;
      id = decoded.id;
      const user = this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const newPP = this.usuarioModel.findByIdAndUpdate(id, newPassword);
      return newPP;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async sendNotificationEmail(
    email: string,
    project: string,
  ): Promise<{ pass_token: string }> {
    const user = await this.userService.findByEmail(email);
    const proj = await this.projectService.findOne(project);

    if (!user) {
      throw new NotFoundException('User not found');
    } else if (!proj) {
      throw new NotFoundException('Project not found');
    }

    const token = await this.jwtService.signAsync(
      { email: user.email, id: user._id },
      { expiresIn: '1h', secret: this.configService.get<string>('JWT_SECRET') }
    );

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Notificación sobre tu proyecto',
        template: 'notification-email',
        context: {
          name: user.nombre,
          proyecto: proj.titulo,
          estado: proj.estado,
        },
      });
      return {
        pass_token: token,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new TokenExpiredError('Token Expired', new Date());
      }
      throw new JsonWebTokenError(error);
    }
  }
}
