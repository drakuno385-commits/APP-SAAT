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
  'usuÇ­rio': 'usuÃ¡rio',
  'prprio': 'prÃ³prio',
  'prprio': 'prÃ³prio',
  'NÇœo': 'NÃ£o',
  'nÇœo': 'nÃ£o',
  'OlÇ­': 'OlÃ¡',
  'Voc': 'VocÃª',
  'voc': 'vocÃª',
  'Ateno': 'AtenÃ§Ã£o',
  'AtenÇœo': 'AtenÃ§Ã£o',
  'AtenÃ§Çœo': 'AtenÃ§Ã£o',
  'Informaes': 'InformaÃ§Ãµes',
  'Concludo': 'ConcluÃ­do',
  'Sbado': 'SÃ¡bado',
  'Tera': 'TerÃ§a',
  'Mnimo': 'MÃ­nimo',
  'matrcula': 'matrÃ­cula',
  'Pgina': 'PÃ¡gina',
  'Prximo': 'PrÃ³ximo',
  'Incio': 'InÃ­cio',
  'mnimo': 'mÃ­nimo',
  'opes': 'opÃ§Ãµes',
  'avaliao': 'avaliaÃ§Ã£o',
  'matria': 'matÃ©ria',
  'Matemtica': 'MatemÃ¡tica',
  'Portugus': 'PortuguÃªs',
  'Histria': 'HistÃ³ria',
  'So': 'SÃ£o',
  'Nmero': 'NÃºmero',
  'JÇ­': 'JÃ¡',
  'jÇ­': 'jÃ¡',
  'Aprovao': 'AprovaÃ§Ã£o',
  'aprovao': 'aprovaÃ§Ã£o',
  'Atuao': 'AtuaÃ§Ã£o',
  'pedaggico': 'pedagÃ³gico',
  'Pedaggico': 'PedagÃ³gico',
  'avaliaes': 'avaliaÃ§Ãµes',
  'pblicas': 'pÃºblicas',
  'Voc\xCA': 'VocÃª',
};

const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(map)) {
    content = content.split(bad).join(good);
  }
  
  content = content.replace(/ÃƒÂ£/g, 'Ã£');
  content = content.replace(/ÃƒÂ§/g, 'Ã§');
  content = content.replace(/ÃƒÂ¡/g, 'Ã¡');
  content = content.replace(/ÃƒÂ©/g, 'Ã©');
  content = content.replace(/ÃƒÂ­/g, 'Ã­');
  content = content.replace(/ÃƒÂ³/g, 'Ã³');
  content = content.replace(/ÃƒÂº/g, 'Ãº');
  content = content.replace(/ÃƒÂ¢/g, 'Ã¢');
  content = content.replace(/ÃƒÂª/g, 'Ãª');
  content = content.replace(/ÃƒÂµ/g, 'Ãµ');
  content = content.replace(/ÃƒÂ§ÃƒÂ£/g, 'Ã§Ã£');
  
  content = content.replace(/Ã°Å¸â€˜â€¹/g, 'ðŸ‘‹');
  content = content.replace(/Ã°Å¸Å½â€œ/g, 'ðŸŽ“');
  content = content.replace(/Ã¢â‚¬Â¢/g, 'â€¢');
  content = 

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
  }
});
