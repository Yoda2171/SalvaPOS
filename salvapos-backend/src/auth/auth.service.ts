import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user,
    };
  }

  logout() {
    return 'This action logs a user out';
  }

  async register(registerDto: RegisterDto) {
    const { firstname, lastname, email, password, role } = registerDto;
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await this.usersService.create({
      firstname,
      lastname,
      email,
      role,
      password: hashedPassword,
    });

    return {
      message: 'User created successfully',
    };
  }
  forgotPassword() {
    return 'This action sends a password reset email';
  }

  resetPassword() {
    return 'This action resets a user password';
  }

  changePassword() {
    return 'This action changes a user password';
  }

  profile() {
    return 'This action returns a user profile';
  }
}
