import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CriarTransacaoDto } from './criar-transacao.dto';
import { Transacao } from './transacao.schema';

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name)
    private readonly transacaoModel: Model<Transacao>,
  ) {}

  async criar(dados: CriarTransacaoDto) {
    if (dados.valor !== Math.round(dados.valor * 100) / 100) {
      throw new BadRequestException('O valor deve ter até duas casas decimais.');
    }

    return this.transacaoModel.create(dados);
  }

  async listar() {
    const historico = await this.transacaoModel.find().sort({ _id: 1 }).exec();

    // Somo em centavos para evitar diferenças ao calcular com valores decimais.
    let receitas = 0;
    let despesas = 0;
    let gastosPorImpulso = 0;

    for (const transacao of historico) {
      const centavos = Math.round(transacao.valor * 100);
      if (transacao.tipo === 'receita') {
        receitas += centavos;
      } else if (transacao.tipo === 'despesa') {
        despesas += centavos;
        if (transacao.consumoConsciente === false) {
          gastosPorImpulso += centavos;
        }
      }
    }

    return {
      historico,
      metricas: {
        saldoTotal: (receitas - despesas) / 100,
        totalDespesas: despesas / 100,
        totalGastoImpulso: gastosPorImpulso / 100,
      },
    };
  }
}
