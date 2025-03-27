const { ZMmapLogger } = require('./dist/index');

// Create the logger
const logger = new ZMmapLogger();

console.log('Logger initialized. Writing test logs...');

// Log some messages
logger.log('This is a test log message');
logger.error('This is a test error message', 'Error stack trace');
logger.warn('This is a test warning message');
logger.debug('This is a test debug message');
logger.verbose('This is a test verbose message');

// Log with context
logger.log('This is a test log message with context', 'TestScript');

console.log('Logs written to .z-logs/logs.mmap');
console.log('Testing reading the logs...');

// Read the contents of the log file
const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), '.z-logs', 'logs.mmap');
const buffer = fs.readFileSync(logFile);

// Read the offset
const offset = buffer.readUInt32LE(0);
console.log(`Current log offset: ${offset} bytes`);

// Read some log entries for verification
const logContent = buffer.toString('utf8', 4, offset);
console.log('\nLast few log entries:');
const logLines = logContent.split('\n');
// Show the last 3 log entries
console.log(logLines.filter(Boolean).slice(-3).join('\n'));

// Close the logger
logger.close();
console.log('\nLogger test completed successfully!'); 