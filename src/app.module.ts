import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentsModule } from './students/students.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    StudentsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.required(),
      }),
    }),
    CommonModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT!,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true, // models will load automatically
      poolSize: 10,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
