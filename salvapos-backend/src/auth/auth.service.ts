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
import { RoleService } from 'src/role/role.service';

import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly roleService: RoleService,
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

    const payload = {
      sub: user.id,
      name: user.firstname + ' ' + user.lastname,
      email: user.email,
      role: user.role.name,
    };

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
    const { firstname, lastname, email, password, roleId } = registerDto;
    const user = await this.usersService.findOneByEmail(email);

    const role = await this.roleService.findById(roleId);

    if (user) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new CreateUserDto();
    newUser.firstname = firstname;
    newUser.lastname = lastname;
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.roleId = role.id;

    console.log(newUser);

    await this.usersService.create(newUser);

    return {
      message: 'User created successfully',
    };
  }

  forgotPassword() {
    return 'This action sends a password reset email';
  }

  /*  async resetPassword(
    requestResetPasswordDto: RequestResetPasswordDto,
  ): Promise<any> {
    const { email } = requestResetPasswordDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
   

    user.resetPasswordToken = v4();
    this.usersService.rester(user);
    return {
      message: 'Password reset email sent successfully',
  
    };
  } */

  changePassword() {
    return 'This action changes a user password';
  }

  profile() {
    return 'This action returns a user profile';
  }
}
