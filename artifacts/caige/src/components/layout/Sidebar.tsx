import { Link, useLocation } from "wouter";
import { Home, Users, FileText, Search, Calendar, ClipboardList, TrendingUp, GraduationCap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const alunoNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/idosos", label: "Idosos Cadastrados", icon: Users },
  { href: "/prontuarios", label: "Prontuários", icon: FileText },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/frequencia", label: "Minha Frequência", icon: ClipboardList },
  { href: "/desempenho", label: "Meu Desempenho", icon: TrendingUp },
  { href: "/busca", label: "Busca", icon: Search },
];

const professorNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/idosos", label: "Idosos Cadastrados", icon: Users },
  { href: "/prontuarios", label: "Prontuários", icon: FileText },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/frequencia", label: "Frequência", icon: ClipboardList },
  { href: "/desempenho", label: "Desempenho", icon: TrendingUp },
  { href: "/alunos", label: "Gerenciar Alunos", icon: GraduationCap },
  { href: "/busca", label: "Busca", icon: Search },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isProfessor, user } = useAuth();
  const navItems = isProfessor ? professorNavItems : alunoNavItems;

  return (
    <aside className="fixed inset-y-0 left-0 w-[260px] bg-primary text-white flex flex-col z-20 shadow-2xl">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1">
          <img
            src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/images/logo-caige.png`}
            alt="CAIGE Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-none">CAIGE</h1>
          <p className="text-blue-200 text-sm leading-none mt-1 font-medium">Univale</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${isProfessor ? "bg-purple-500/30 text-purple-100" : "bg-white/15 text-blue-100"}`}>
          {isProfessor ? <Shield className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
          {isProfessor ? "Professor" : `Aluno${user?.turma ? ` • ${user.turma}` : ""}`}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
              isActive
                ? "bg-white/20 text-white shadow-inner"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            )}>
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "opacity-100" : "opacity-70")} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-5">
        <div className="bg-white/10 rounded-xl p-4 text-sm text-blue-100">
          <p className="font-semibold text-white mb-1">Precisa de ajuda?</p>
          <p className="mb-3 opacity-80 text-xs">Contate o suporte técnico Univale.</p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors text-xs">
            Suporte
          </button>
        </div>
      </div>
    </aside>
  );
}
