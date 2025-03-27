# z-mmap-logger

A high-performance logging package for NestJS applications using memory-mapped files.

## Features

- Fast logging through memory-mapped files
- Compatible with NestJS's LoggerService interface
- Circular log buffer with automatic rotation
- Pre-allocated memory for maximum performance
- JSON formatted logs for easy parsing

## Installation

```bash
npm install z-mmap-logger
```

## Usage

### Basic Usage

```typescript
import { ZMmapLogger } from 'z-mmap-logger';

// Create the logger
const logger = new ZMmapLogger();

// Log messages
logger.log('This is a log message');
logger.error('This is an error message', 'Error stack trace');
logger.warn('This is a warning message');
logger.debug('This is a debug message');
logger.verbose('This is a verbose message');

// Log with context
logger.log('This is a log message with context', 'AppModule');

// Close the logger when done with your application
logger.close();
```

### NestJS Integration

```typescript
// app.module.ts
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

// In your controllers/services:
import { Injectable, Inject } from '@nestjs/common';
import { ZMmapLogger } from 'z-mmap-logger';

@Injectable()
export class AppService {
  constructor(@Inject('LOGGER') private readonly logger: ZMmapLogger) {}

  getHello(): string {
    this.logger.log('Hello world request received', 'AppService');
    return 'Hello World!';
  }
}
```

### Configuration Options

```typescript
// Configure logger with custom settings
const logger = new ZMmapLogger({
  maxSize: 20 * 1024 * 1024, // 20MB log size
  logDir: './custom-logs-dir' // Custom directory
});
```

## How It Works

z-mmap-logger creates a pre-allocated file in the `.z-logs` directory (or a custom location) and maps it into memory. All logs are written to this memory buffer and then synced to the file on disk.

The first 4 bytes of the file store the current write position. When the buffer reaches its maximum size, it wraps around and starts overwriting old logs.

## License

MIT 