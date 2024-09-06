import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma service pour interagir avec la base de données
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from 'src/mailer/mailer.service';
import { randomBytes } from 'crypto';


@Injectable()
export class UsersService {
  constructor(
	private readonly mailerService: MailerService,
	private readonly prismaService: PrismaService,
) {}

  async createUserAndAccount(createUserDto: CreateUserDto) {
	const { email, password, name } = createUserDto;
  
	const hashedPassword = await bcrypt.hash(password, 10);
  
	  const user = await this.prismaService.user.create({
		data: {
		  email,
		  password: hashedPassword,
		  name,
		},
	  });
  
	  const account = await this.prismaService.account.create({
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

	  const confirmationToken = randomBytes(32).toString('hex');
	  const expirationDate = new Date();
	  expirationDate.setDate(expirationDate.getDate() + 1); // Le token expire dans 1 jour
	  console.log(user)
	  await this.prismaService.token.create({
		data: {
		  userId: user.id,
		  token: confirmationToken,
		  expiresAt: expirationDate,
		},
	  });
  
	  this.mailerService.sendEmail(
		user.email,
		'Welcome to Nexus',
		'ConfirmationSignin',
		{
		  confirmationToken,
		},
	  );
  
  
	  return { user, account };
  }

	async findByEmail(email: string) {
		return this.prismaService.user.findUnique({
		where: {
			email,
		},
		});
	}

}
