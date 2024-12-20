import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notifications.types';

@Injectable()
export class AccountService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async current(accountId: number, userId: number) {
    let account = null;
    if (accountId !== null) {
      account = await this.prismaService.account.findUnique({
        where: { id: accountId },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });
    }
    const userInAccount = account?.users.some(
      (userAccount) => userAccount.user.id === userId,
    );

    if (!userInAccount || account === null) {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          accounts: {
            include: {
              account: {
                include: {
                  users: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      account = user.accounts[0].account;
    }
    return { status: 200, data: account };
  }

  async create(name: string, userId: number) {
    const account = await this.prismaService.account.create({
      data: {
        name,
        status: 'FREE',
      },
    });

    await this.prismaService.userAccount.create({
      data: {
        userId,
        accountId: account.id,
        role: UserRole.OWNER,
      },
    });

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        currentAccountId: account.id,
      },
    });

    return { status: 200, message: 'Account created successfully' };
  }

  async delete(accountId: number, userId: number) {
    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId,
        accountId,
        role: UserRole.OWNER,
      },
    });

    if (!userAccount) {
      return {
        status: 403,
        message: 'User does not have permission to delete account',
      };
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });

    if (user.accounts[0].id === accountId) {
      return {
        status: 404,
        message: 'Cannot delete the first account',
      };
    }

    await this.prismaService.userAccount.deleteMany({
      where: { accountId },
    });

    await this.prismaService.account.delete({
      where: { id: accountId },
    });

    return { status: 200, message: 'Account deleted' };
  }

  async leave(accountId: number, userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
      },
    });

    if (user.accounts[0].id === accountId) {
      return {
        status: 404,
        message: 'Cannot leave the first account',
      };
    }

    await this.prismaService.userAccount.deleteMany({
      where: { accountId, userId },
    });

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        currentAccountId: user.accounts[0].id,
      },
    });

    return { status: 200, message: 'User left account' };
  }

  async inviteUser(userInvited: string, accountId: number, email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { status: 401, message: 'User not found' };
    }

    const userInvitedExist = await this.prismaService.user.findUnique({
      where: { email: userInvited },
    });

    if (!userInvitedExist) {
      return { status: 402, message: 'User invited not found' };
    }

    const userAlreadyInAccount = await this.prismaService.userAccount.findFirst(
      {
        where: {
          userId: userInvitedExist.id,
          accountId,
        },
      },
    );

    if (userAlreadyInAccount) {
      return { status: 403, message: 'User already in account' };
    }

    const account = await this.prismaService.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { status: 404, message: 'Account not found' };
    }

    const userAccount = await this.prismaService.userAccount.create({
      data: {
        userId: userInvitedExist.id,
        accountId: account.id,
        role: UserRole.INVITED,
      },
    });

    const data = {
      accountId: account.id,
      accountName: account.name,
      userName: user.name,
      accountRole: UserRole.INVITED,
    };

    this.notificationsService.createNotification(
      data,
      userInvitedExist.id,
      NotificationType.INVITE,
    );

    // TODO envoyer un mail à l'utilisateur invité
    return { status: 200, message: 'User invited' };
  }

  async acceptInvite(accountId: number, userId: number) {
    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId,
        accountId,
        role: UserRole.INVITED,
      },
    });

    if (!userAccount) {
      return { status: 401, message: 'User not invited' };
    }

    await this.prismaService.userAccount.update({
      where: { id: userAccount.id },
      data: { role: UserRole.VIEWER },
    });

    return { status: 200, message: 'User accepted' };
  }

  async refuseInvite(accountId: number, userId: number) {
    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId,
        accountId,
        role: UserRole.INVITED,
      },
    });

    if (!userAccount) {
      return { status: 401, message: 'User not invited' };
    }

    await this.prismaService.userAccount.delete({
      where: { id: userAccount.id },
    });

    return { status: 200, message: 'User refused' };
  }

  async leaveAccount(
    accountId: number,
    userIdRemove: number,
    useridRemover: number,
  ) {
    const userRemoverAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId: useridRemover,
        accountId,
        OR: [{ role: UserRole.ADMIN }, { role: UserRole.OWNER }],
      },
    });
    if (!userRemoverAccount) {
      return {
        status: 403,
        message: 'User does not have permission to remove users',
      };
    }

    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId: userIdRemove,
        accountId,
      },
      include: {
        account: true,
      },
    });

    if (!userAccount) {
      return { status: 401, message: 'User not in account' };
    }

    await this.prismaService.userAccount.delete({
      where: { id: userAccount.id },
    });

    const data = {
      message: 'user_left_account',
      accountName: userAccount.account.name,
    };
    this.notificationsService.createNotification(
      data,
      userIdRemove,
      NotificationType.MESSAGE,
    );

    return { status: 200, message: 'User left account' };
  }

  async updateRole(
    accountId: number,
    userIdToChange: number,
    role: UserRole,
    userIdAsk: number,
  ) {
    const userAskAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId: userIdAsk,
        accountId,
        OR: [{ role: UserRole.ADMIN }, { role: UserRole.OWNER }],
      },
    });

    if (!userAskAccount) {
      return {
        status: 403,
        message: 'User does not have permission to update role',
      };
    }

    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId: userIdToChange,
        accountId,
      },
      include: {
        account: true,
      },
    });

    if (!userAccount) {
      return { status: 401, message: 'User not in account' };
    }

    await this.prismaService.userAccount.update({
      where: { id: userAccount.id },
      data: { role },
    });

    const data = {
      message: 'user_role_updated',
      accountName: userAccount.account.name,
      role,
    };
    this.notificationsService.createNotification(
      data,
      userAccount.userId,
      NotificationType.MESSAGE,
    );

    return { status: 200, message: 'User role updated' };
  }

  async changeName(accountId: number, name: string, userId: number) {
    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId,
        accountId,
        OR: [{ role: UserRole.ADMIN }, { role: UserRole.OWNER }],
      },
    });

    if (!userAccount) {
      return {
        status: 403,
        message: 'User does not have permission to change name',
      };
    }

    await this.prismaService.account.update({
      where: { id: accountId },
      data: { name },
    });

    return { status: 200, message: 'Account name updated' };
  }

  async updateAvatar(email: string, accountId: number, avatarUrl: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { status: 401, message: 'User not found' };
    }

    const userAccount = await this.prismaService.userAccount.findFirst({
      where: {
        userId: user.id,
        accountId,
        OR: [{ role: UserRole.ADMIN }, { role: UserRole.OWNER }],
      },
    });

    if (!userAccount) {
      return { status: 402, message: 'User not in account' };
    }

    await this.prismaService.account.update({
      where: { id: accountId },
      data: { avatar: avatarUrl },
    });

    return { status: 200, message: 'Account avatar updated' };
  }
}
