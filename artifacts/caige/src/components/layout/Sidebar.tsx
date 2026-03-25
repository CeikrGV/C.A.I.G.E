import { Link, useLocation } from "wouter";
import { Home, Users, FileText, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/idosos", label: "Idosos Cadastrados", icon: Users },
  { href: "/prontuarios", label: "Prontuários", icon: FileText },
  { href: "/busca", label: "Busca", icon: Search },
];

export function Sidebar() {
  const [location] = useLocation();

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

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200",
              isActive 
                ? "bg-white/20 text-white shadow-inner" 
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            )}>
              <item.icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-70")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="bg-white/10 rounded-xl p-4 text-sm text-blue-100">
          <p className="font-semibold text-white mb-1">Precisa de ajuda?</p>
          <p className="mb-3 opacity-80">Contate o suporte técnico Univale.</p>
          <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors">
            Suporte
          </button>
        </div>
      </div>
    </aside>
  );
}
