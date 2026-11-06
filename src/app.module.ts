import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TransacoesModule } from './transacoes/transacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        if (!uri?.trim()) {
          throw new Error('Defina MONGODB_URI antes de iniciar a API.');
        }

        return {
          uri,
          dbName: config.get<string>('MONGODB_DB_NAME'),
          serverSelectionTimeoutMS: 5000,
          retryAttempts: 1,
        };
      },
    }),
    TransacoesModule,
  ],
})
export class AppModule {}
