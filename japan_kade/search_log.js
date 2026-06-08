const fs = require('fs');

const logPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\c475e3d4-9313-4d72-89e5-79a16e1186ca\\.system_generated\\tasks\\task-1508.log';

if (!fs.existsSync(logPath)) {
  console.error('Log file does not exist');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

console.log('Total log lines:', lines.length);

console.log('--- Last 100 log lines ---');
lines.slice(-100).forEach((line, idx) => {
  console.log(`${lines.length - 100 + idx + 1}: ${line}`);
});
