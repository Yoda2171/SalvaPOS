import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      return 'User not found';
    }

    if (user.password !== loginDto.password) {
      return 'Invalid password';
    }

    return user;
  }

  logout() {
    return 'This action logs a user out';
  }

  async register(registerDto: RegisterDto) {
    const { firstname, lastname, email, password } = registerDto;
    const user = await this.usersService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await this.usersService.create({
      firstname,
      lastname,
      email,
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
}
