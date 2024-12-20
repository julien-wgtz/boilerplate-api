import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Prisma service pour interagir avec la base de données
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';
import { UserModule } from './users.module';

@Injectable()
export class UsersService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
    private readonly tokensService: TokensService,
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
          name: `${user.name}'s Workspace`,
          status: 'FREE',
          users: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          currentAccountId: account.id,
        },
      });

      const token = this.tokensService.generateToken(
        user.id,
        user.email,
        'signin',
      );

      this.mailerService.sendEmail(
        user.email,
        'Welcome to Nexus',
        'ConfirmationSignin',
        {
          token,
        },
        user.language,
      );
      req.session.user = user;
      req.session.save();

      const userAlldata = await this.prismaService.user.findUnique({
        where: {
          email,
        },
        include: {
          currentAccount: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
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

      return { userAlldata, status: 201, message: 'User created' };
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return { message: 'User with this email already exists', status: 400 };
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

    const user = await this.prismaService.user.findFirst({
      where: { tokens: { some: { token: token } } },
    });

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
      return { status: 200, message: 'User verified' };
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

    const token = this.tokensService.generateToken(
      user.id,
      user.email,
      'verify',
    );

    this.mailerService.sendEmail(
      user.email,
      "Confirmation d'email",
      'ResendVerification',
      {
        token,
      },
      user.language,
    );

    return { status: 200, message: 'Verification email sent' };
  }

  async findByEmailWithAccount(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        currentAccount: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
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

    const token = await this.tokensService.generateToken(
      user.id,
      user.email,
      'resetPassword',
    );
    this.mailerService.sendEmail(
      user.email,
      'Réinitialisation de mot de passe',
      'ResetPassword',
      {
        token,
        lang: user.language,
      },
    );

    return { status: 200, message: 'Reset password email sent' };
  }

  async changePasswordToken(password: string, token: string) {
    const isValid = await this.tokensService.validateToken(
      token,
      'resetPassword',
    );

    const user = await this.prismaService.user.findFirst({
      where: { tokens: { some: { token: token } } },
    });

    if (user && isValid) {
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

    await this.tokensService.deleteToken(token);

    return { status: 200, message: 'Password changed' };
  }

  async changePassword(password: string, lastPassword: string, email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { message: 'User not found', status: 401 };
    }
    const isValid = await bcrypt.compare(lastPassword, user.password);

    if (!isValid) {
      return { message: 'Invalid password', status: 402 };
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

  async askChangeEmail(email: string, newEmail: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { message: 'User not found', status: 400 };
    }

    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: newEmail,
      },
    });

    if (userExists) {
      return { message: 'User with this email already exists', status: 401 };
    }

    const token = await this.tokensService.generateToken(
      user.id,
      newEmail,
      'changeEmail',
      { email: newEmail },
    );

    this.mailerService.sendEmail(
      newEmail,
      "Changement d'email",
      'ChangeEmail',
      {
        token,
        lang: user.language,
      },
      user.language,
    );

    return { status: 200, message: 'Email send' };
  }

  async changeEmail(req: any, token: string) {
    const isValid = await this.tokensService.validateToken(
      token,
      'changeEmail',
    );

    const user = await this.prismaService.user.findFirst({
      where: { tokens: { some: { token: token } } },
    });

    if (!isValid) {
      return { message: 'Invalid token', status: 400 };
    }
    if (user) {
      const userUpdate = await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: JSON.parse(String(isValid.data)).email,
        },
      });
      userUpdate.email = JSON.parse(String(isValid.data)).email;
      req.session.user = userUpdate;
      req.session.save();
    } else {
      return { message: 'Invalid token', status: 400 };
    }
    setTimeout(() => {
      this.tokensService.deleteToken(token);
    }, 1000);

    return { status: 200, message: 'Email changed' };
  }

  async updateTheme(email: string, theme: string) {
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
        theme,
      },
    });

    return { status: 200, message: 'Theme updated' };
  }

  async accounts(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
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

    if (!user) {
      return { message: 'User not found', status: 400 };
    }

    return { user, status: 200, message: 'Accounts found' };
  }

  async deleteUser(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
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

    if (!user) {
      return { message: 'User not found', status: 400 };
    }

    const accountToDelete = [];
    const accountToChangeAdmin = [];

    // Je veux supprimer uniquement les comptes où l'utilisateur a le rôle ADMIN ou OWNER et qu'il est seul dans le compte
    user.accounts.forEach((account) => {
      if (account.account.users.length === 1 && account.role === 'OWNER') {
        accountToDelete.push(account.account.id);
      } else if (account.role === 'OWNER' && account.account.users.length > 1) {
        accountToChangeAdmin.push(account.account.id);
      }
    });

    // Utilisez une transaction pour garantir l'intégrité des suppressions
    await this.prismaService.$transaction(async (prisma) => {
      if (accountToDelete.length > 0) {
        // Supprimer les enregistrements dans la table UserAccount
        await prisma.userAccount.deleteMany({
          where: {
            accountId: {
              in: accountToDelete,
            },
          },
        });

        // Supprimer les enregistrements dans la table account
        await prisma.account.deleteMany({
          where: {
            id: {
              in: accountToDelete,
            },
          },
        });
      }

      // Pour le deuxième tableau, récupérer la première personne qui n'est pas l'utilisateur et lui donner le rôle OWNER
      if (accountToChangeAdmin.length > 0) {
        for (const account of accountToChangeAdmin) {
          const newUserOwner = await prisma.userAccount.findFirst({
            where: {
              accountId: account,
              userId: {
                not: user.id,
              },
            },
          });

          if (newUserOwner) {
            await prisma.userAccount.update({
              where: {
                id: newUserOwner.id,
              },
              data: {
                role: 'OWNER',
              },
            });

            const oldUserOwner = await prisma.userAccount.findFirst({
              where: {
                accountId: account,
                userId: user.id,
              },
            });

            await prisma.userAccount.delete({
              where: {
                id: oldUserOwner.id,
              },
            });
          }
        }
      }

      // Supprimer l'utilisateur
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    });

    return { status: 200, message: 'User deleted' };
  }

  async changeCurrentAccount(email: string, accountId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { message: 'User not found', status: 401 };
    }

    const account = await this.prismaService.account.findUnique({
      where: {
        id: accountId,
      },
    });

    if (!account) {
      return { message: 'Account not found', status: 402 };
    }

    const newUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        currentAccountId: accountId,
      },
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

    return { status: 200, message: 'Current account updated', data: newUser };
  }

  async changeName(email: string, name: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { message: 'User not found', status: 401 };
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
      },
    });

    return { status: 200, message: 'Name updated' };
  }

  async updateAvatar(email: string, fileUrl: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return { message: 'User not found', status: 401 };
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatar: fileUrl,
      },
    });

    return { status: 200, message: 'Avatar updated' };
  }
}
