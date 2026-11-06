import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const TIPOS_TRANSACAO = ['receita', 'despesa'] as const;
export type TipoTransacao = (typeof TIPOS_TRANSACAO)[number];

@Schema({ collection: 'transacoes', versionKey: false })
export class Transacao {
  @Prop({ required: true, trim: true })
  descricao!: string;

  @Prop({ required: true, min: 0.01, max: 999_999_999.99 })
  valor!: number;

  @Prop({ type: String, required: true, enum: TIPOS_TRANSACAO })
  tipo!: TipoTransacao;

  @Prop({ required: true, trim: true })
  categoria!: string;

  @Prop({ required: true })
  consumoConsciente!: boolean;
}

export const TransacaoSchema = SchemaFactory.createForClass(Transacao);
