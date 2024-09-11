import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma service pour interagir avec la base de données
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '../mailer/mailer.service';
import { randomBytes } from 'crypto';
import { TokensService } from '../tokens/tokens.service';


@Injectable()
export class UsersService {
  constructor(
	private readonly mailerService: MailerService,
	private readonly prismaService: PrismaService,
	private readonly tokensService: TokensService
) {}

  async createUserAndAccount(createUserDto: CreateUserDto, req: any) {
	const { email, password, name, language } = createUserDto;
  
	const hashedPassword = await bcrypt.hash(password, 10);
  
	try {
		const user = await this.prismaService.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				language,
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
	
		  const token = this.tokensService.generateToken(user.id, user.email, "signin");
	  
		  this.mailerService.sendEmail(
			user.email,
			'Welcome to Nexus',
			'ConfirmationSignin',
			{
			  token,
			},
			user.language
		  );
		  req.session.user = user;
		  req.session.save();
	
		  return { user, account };
	} catch (error) {
		if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
			throw new Error('User with this email already exists');
		}
		throw error;
	}
  }

	async findByEmail(email: string) {
		return this.prismaService.user.findUnique({
		where: {
			email,
		},
		});
	}

	async verificationEmail(token: string, type: string) {
		const isValid = await this.tokensService.validateToken(token, type);

		const user = await this.prismaService.user.findFirst({ where: { tokens: { some: { token: token } } } });

		if (user) {
			await this.prismaService.user.update({
				where: {
					id: user.id,
				},
				data: {
					verified: true,
				},
			});
		} else {
			return { message: 'Invalid token', status: 400 };
		}

		this.tokensService.deleteToken(token);

		if (isValid) {
			return {status: 200, message: 'User verified' };
		} else {
			return { message: 'Invalid token', status: 400 };
		}
	}

	async resendVerification(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return { message: 'User not found', status: 400 };
		}

		const token = this.tokensService.generateToken(user.id, user.email, 'verify');

		this.mailerService.sendEmail(
			user.email,
			"Confirmation d'email",
			'ResendVerification',
			{
				token,
			},
			user.language
		);

		return { status: 200, message: 'Verification email sent' };
	}

	async resetPassword(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return { message: 'User not found', status: 400 };
		}

		const token = this.tokensService.generateToken(user.id, user.email, 'resetPassword');

		this.mailerService.sendEmail(
			user.email,
			"Réinitialisation de mot de passe",
			'ResetPassword',
			{
				token,
			},
			user.language
		);

		return { status: 200, message: 'Reset password email sent' };
	}

	async changePasswordToken(password: string, token: string) {
		const isValid = await this.tokensService.validateToken(token, 'resetPassword');

		const user = await this.prismaService.user.findFirst({ where: { tokens: { some: { token: token } } } });

		if (user) {
			const hashedPassword = await bcrypt.hash(password, 10);

			await this.prismaService.user.update({
				where: {
					id: user.id,
				},
				data: {
					password: hashedPassword,
				},
			});
		} else {
			return { message: 'Invalid token', status: 400 };
		}

		this.tokensService.deleteToken(token);

		if (isValid) {
			return { status: 200, message: 'Password changed' };
		} else {
			return { message: 'Invalid token', status: 400 };
		}
	}

	async changePassword(password: string, lastPassword: string, email: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return { message: 'User not found', status: 400 };
		}

		const isValid = await bcrypt.compare(lastPassword, user.password);

		if (!isValid) {
			return { message: 'Invalid password', status: 400 };
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: {
				password: hashedPassword,
			},
		});

		return { status: 200, message: 'Password changed' };
	}

	async changeEmail(email: string, newEmail: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return { message: 'User not found', status: 400 };
		}

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: {
				email: newEmail,
			},
		});

		this.resendVerification(newEmail);

		return { status: 200, message: 'Email changed' };
	}
}
