import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class TokensService {
	constructor(private readonly prismaService: PrismaService) {}

	async generateToken(userId: number, email: string, type: string) {
		const randomNumber = randomBytes(32).toString('hex');
		const hashedToken = await bcrypt.hash(randomNumber+email, 10);

		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 1); // Token expires in 1 day

		await this.prismaService.token.create({
			data: {
				userId,
				token: hashedToken,
				expiresAt: expirationDate,
				type,
			},
		});

		return hashedToken;
	}

	async validateToken(token: string, type: string) {
		const tokenRecord = await this.prismaService.token.findFirst({
			where: {
				token,
				type,
				expiresAt: {
					gt: new Date(),
				},
			},
		});

		if (!tokenRecord) {
			return false;
		}

		return true;
	}
	async deleteToken(token: string) {
		await this.prismaService.token.deleteMany({
			where: {
				token,
			},
		});
	}
}
