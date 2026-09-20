const fs = require('fs');

const navCode = `      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 z-50">
        <div className="flex">
          {[
            { href: "/tutor/painel", label: "Painel", icon: LayoutDashboard },
            { href: "/tutor/alunos", label: "Alunos", icon: Users },
            { href: "/tutor/chat", label: "Mensagens", icon: MessageSquare },
            { href: "/tutor/perfil", label: "Perfil", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            // Simplificado para evitar window reference is not defined during SSR (Hydration mismatch)
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-slate-400 hover:text-indigo-600 focus:text-indigo-600">
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>`;

function fixNav(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<nav className="fixed bottom-0[\s\S]*?<\/nav>/, navCode);
  
  if (!content.includes('LayoutDashboard')) {
    if (content.includes('lucide-react')) {
      content = content.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { $1, LayoutDashboard, Users, MessageSquare, User } from "lucide-react";');
    } else {
      content = 'import { LayoutDashboard, Users, MessageSquare, User } from "lucide-react";\n' + content;
    }
  }
  fs.writeFileSync(file, content);
}

fixNav('src/app/tutor/painel/page.tsx');
fixNav('src/app/tutor/alunos/page.tsx');
fixNav('src/app/tutor/chat/page.tsx');
