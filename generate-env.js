const fs = require('fs');

const apiUrl = process.env.VITE_API_URL || 'https://ai-doc-backend-31kk.onrender.com/api';
const content = `window.__ENV = { VITE_API_URL: "${apiUrl}" };`;

fs.writeFileSync('env-config.js', content, { encoding: 'utf8' });
console.log('Wrote env-config.js with VITE_API_URL =', apiUrl);
