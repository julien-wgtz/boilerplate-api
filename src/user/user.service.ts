import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma service pour interagir avec la base de données
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUserAndAccount(createUserDto: CreateUserDto) {
	const { email, password, name } = createUserDto;
  
	const hashedPassword = await bcrypt.hash(password, 10);
  
	return await this.prisma.$transaction(async (prisma) => {
	  const user = await prisma.user.create({
		data: {
		  email,
		  password: hashedPassword,
		  name,
		},
	  });
  
	  const account = await prisma.account.create({
		data: {
		  name: `${user.name}'s Account`,
		  status: 'FREE',
		  users: {
			create: {
			  userId: user.id,
			  role: 'OWNER',
			},
		  },
		},
	  });
  
	  return { user, account };
	});
  }
}
