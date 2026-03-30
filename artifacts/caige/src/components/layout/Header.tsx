import { useAuth } from "@/hooks/use-auth";
import { ChevronDown, LogOut, Shield, GraduationCap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user, logout, isProfessor } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="text-slate-500 font-medium">
        {/* Can put a dynamic page title here if needed */}
      </div>

      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
        >
          <span className="font-medium text-slate-700">{user?.nome || "Usuário"}</span>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold shadow-inner">
            {user?.iniciais || "GA"}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-50">
                <p className="font-medium text-slate-900 truncate">{user?.nome}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${isProfessor ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {isProfessor ? <Shield className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                  {isProfessor ? "Professor" : "Aluno"}
                </span>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 p-3 text-danger hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sair do sistema
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
