import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class ZMmapLogger implements LoggerService {
  private buffer: Buffer;
  private fd: number;
  private offset: number = 0;
  private readonly maxSize: number = 10 * 1024 * 1024; // 10MB
  private readonly logFile: string;

  constructor(options?: { maxSize?: number, logDir?: string }) {
    const maxSize = options?.maxSize ?? this.maxSize;
    this.maxSize = maxSize;

    const logDir = options?.logDir ?? path.join(process.cwd(), '.z-logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.logFile = path.join(logDir, 'logs.mmap');
    
    // Create or open the file
    this.fd = fs.openSync(this.logFile, 'a+');
    
    const stats = fs.fstatSync(this.fd);
    if (stats.size < this.maxSize) {
      // Pre-allocate buffer space for better performance
      fs.closeSync(this.fd);
      fs.truncateSync(this.logFile, this.maxSize);
      this.fd = fs.openSync(this.logFile, 'r+');
    }
    
    // Create a buffer that maps to the file
    this.buffer = Buffer.alloc(this.maxSize);
    
    // Read the file into buffer
    fs.readSync(this.fd, this.buffer, 0, 4, 0);
    
    // Initialize offset if file is new
    if (this.buffer.readUInt32LE(0) === 0) {
      this.buffer.writeUInt32LE(4, 0); // Offset starts after the header (4 bytes)
      this.offset = 4;
    } else {
      this.offset = this.buffer.readUInt32LE(0);
    }
  }

  log(message: string, context?: string): void {
    this.writeLog({ level: 'log', message, context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.writeLog({ 
      level: 'error', 
      message, 
      trace, 
      context
    });
  }

  warn(message: string, context?: string): void {
    this.writeLog({ level: 'warn', message, context });
  }

  debug(message: string, context?: string): void {
    this.writeLog({ level: 'debug', message, context });
  }

  verbose(message: string, context?: string): void {
    this.writeLog({ level: 'verbose', message, context });
  }

  /**
   * Write a log entry to the memory-mapped file
   */
  private writeLog(log: { 
    level: string; 
    message: string; 
    trace?: string;
    context?: string;
    [key: string]: any;
  }): void {
    // Create log entry with timestamp
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...log,
    };

    const logString = JSON.stringify(logEntry) + '\n';
    const logBuffer = Buffer.from(logString);

    // Reset offset if we're at the end of the buffer
    if (this.offset + logBuffer.length > this.maxSize) {
      this.offset = 4; // Reset to start (after header)
    }

    // Write the log to our buffer
    logBuffer.copy(this.buffer, this.offset);
    this.offset += logBuffer.length;
    
    // Update the offset in the header
    this.buffer.writeUInt32LE(this.offset, 0);
    
    // Sync the buffer to the file
    fs.writeSync(this.fd, this.buffer, 0, this.offset, 0);
  }

  /**
   * Close the file descriptor when the logger is no longer needed
   */
  close(): void {
    fs.closeSync(this.fd);
  }
}

// Export a factory function for easy creation
export function createZMmapLogger(options?: { maxSize?: number, logDir?: string }): ZMmapLogger {
  return new ZMmapLogger(options);
} 