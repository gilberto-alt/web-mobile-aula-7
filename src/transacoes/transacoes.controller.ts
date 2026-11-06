import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CriarTransacaoDto } from './criar-transacao.dto';
import { TransacoesService } from './transacoes.service';

@Controller('transacoes')
export class TransacoesController {
  constructor(private readonly transacoesService: TransacoesService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  criar(@Body() dados: CriarTransacaoDto) {
    return this.transacoesService.criar(dados);
  }

  @Get()
  listar() {
    return this.transacoesService.listar();
  }
}
