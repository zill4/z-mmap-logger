import { ZMmapLogger } from './index';

// Create the logger
const logger = new ZMmapLogger();

// Log some messages
logger.log('This is a log message');
logger.error('This is an error message', 'Error stack trace');
logger.warn('This is a warning message');
logger.debug('This is a debug message');
logger.verbose('This is a verbose message');

// Log with context
logger.log('This is a log message with context', 'AppModule');

// Log with object data
logger.log('Request processed', 'HttpController');

// Example of how to use it in a NestJS application:
/*
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZMmapLogger } from 'z-mmap-logger';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'LOGGER',
      useFactory: () => new ZMmapLogger()
    }
  ],
})
export class AppModule {}

// Then inject it into your controllers/services:
// constructor(@Inject('LOGGER') private readonly logger: ZMmapLogger) {}
*/

// Close the logger when done
logger.close();
console.log('Logs written to .z-logs/logs.mmap'); 