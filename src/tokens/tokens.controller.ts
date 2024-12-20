import { Body, Controller, Post } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {

	  constructor(private readonly tokensService: TokensService) {}

  @Post('validate')
  async validateToken(@Body() body) {
	return this.tokensService.validateToken(body.token, body.type);
  }
}
