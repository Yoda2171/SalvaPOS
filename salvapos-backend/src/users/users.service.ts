import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleService } from 'src/role/role.service';
import { RequestResetPasswordDto } from 'src/auth/dto/request-reset-password.dto';
import { v4 } from 'uuid';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import * as bcryptjs from 'bcryptjs';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly roleService: RoleService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const role = await this.roleService.findById(createUserDto.roleId);

    console.log(role);

    const newUser = new User();
    newUser.firstname = createUserDto.firstname;
    newUser.lastname = createUserDto.lastname;
    newUser.email = createUserDto.email;
    newUser.password = createUserDto.password;
    newUser.role = role;

    return this.usersRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByResetToken(resetToken: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: resetToken },
    });
  }
  async findOneById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async requestPassword(requestResetPasswordDto: RequestResetPasswordDto) {
    const user = await this.findOneByEmail(requestResetPasswordDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.resetPasswordToken = v4();

    //send email
    await this.notificationService.sendPasswordResetEmail(
      user.email,
      user.resetPasswordToken,
    );

    return this.usersRepository.save(user);
  }

  async resetPassword(resetPassword: ResetPasswordDto) {
    const { resetToken, password } = resetPassword;

    const user = await this.findOneByResetToken(resetToken);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.resetPasswordToken !== resetToken) {
      throw new NotFoundException('Invalid reset token');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;

    return await this.usersRepository.save(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  /* update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  } */

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
