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
  'usuǭrio': 'usuário',
  'prprio': 'próprio',
  'Nǜo': 'Não',
  'nǜo': 'não',
  'Olǭ': 'Olá',
  'Voc': 'Você',
  'voc': 'você',
  'Ateno': 'Atenção',
  'Atenǜo': 'Atenção',
  'Atençǜo': 'Atenção',
  'Informaes': 'Informações',
  'Concludo': 'Concluído',
  'Sbado': 'Sábado',
  'Tera': 'Terça',
  'Mnimo': 'Mínimo',
  'matrcula': 'matrícula',
  'Pgina': 'Página',
  'Prximo': 'Próximo',
  'Incio': 'Início',
  'mnimo': 'mínimo',
  'opes': 'opções',
  'avaliao': 'avaliação',
  'matria': 'matéria',
  'Matemtica': 'Matemática',
  'Portugus': 'Português',
  'Histria': 'História',
  'So': 'São',
  'Nmero': 'Número',
  'Jǭ': 'Já',
  'jǭ': 'já',
  'Aprovao': 'Aprovação',
  'aprovao': 'aprovação',
  'Atuao': 'Atuação',
  'pedaggico': 'pedagógico',
  'Pedaggico': 'Pedagógico',
  'avaliaes': 'avaliações',
  'pblicas': 'públicas',
  'Voc\xCA': 'Você'
};

const files = walk('src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(map)) {
    content = content.split(bad).join(good);
  }
  
  content = content.replace(/Ã£/g, 'ã');
  content = content.replace(/Ã§/g, 'ç');
  content = content.replace(/Ã¡/g, 'á');
  content = content.replace(/Ã©/g, 'é');
  content = content.replace(/Ã­/g, 'í');
  content = content.replace(/Ã³/g, 'ó');
  content = content.replace(/Ãº/g, 'ú');
  content = content.replace(/Ã¢/g, 'â');
  content = content.replace(/Ãª/g, 'ê');
  content = content.replace(/Ãµ/g, 'õ');
  content = content.replace(/Ã§Ã£/g, 'çã');
  
  content = content.replace(/ðŸ‘‹/g, '👋');
  content = content.replace(/ðŸŽ“/g, '🎓');
  content = content.replace(/â€¢/g, '•');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
  }
});
