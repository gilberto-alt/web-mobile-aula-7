import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TIPOS_TRANSACAO, TipoTransacao } from './transacao.schema';

export class CriarTransacaoDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsNumber()
  @Min(0.01)
  @Max(999_999_999.99)
  valor!: number;

  @IsIn(TIPOS_TRANSACAO)
  tipo!: TipoTransacao;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @IsBoolean()
  consumoConsciente!: boolean;
}
