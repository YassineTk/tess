const fs = require('fs');
const path = require('path');

const sessionsDir = path.join(__dirname, 'sessions');

if (fs.existsSync(sessionsDir)) {
  const files = fs.readdirSync(sessionsDir);
  
  let deletedCount = 0;
  files.forEach(file => {
    if (file.endsWith('.json')) {
      fs.unlinkSync(path.join(sessionsDir, file));
      deletedCount++;
    }
  });
  
  console.log(`Successfully deleted ${deletedCount} sessions`);
} else {
  console.log('No sessions directory found');
} 