const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
  });
  return results;
}

const map = {
  'SÃ£olicitaÃ§Ãµes': 'Solicitações',
  'solicitaÃ§Ã£o': 'solicitação',
  'Ã¢â‚¬Â¢': '•',
  "OlÃƒÂ¡": 'Olá',
  "VÃƒÂ¡": 'Vá',
  "solicitaÃƒÂ§ÃƒÂµes": 'solicitações',
  "OlÃ¡": 'Olá',
  "estÃ¡": 'está',
  "AtenÃ§Ã£o": 'Atenção',
  "vocÃªÃª": 'você',
  "aparecerÃ¡": 'aparecerá',
  "ðŸ‘‹": '👋'
};

const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(map)) {
    content = content.split(bad).join(good);
  }

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
  }
});
