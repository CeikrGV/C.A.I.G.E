import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Busca() {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 text-center">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Busca Global</h1>
        <p className="text-slate-500 mt-2 text-lg">Encontre pacientes, prontuários ou profissionais rapidamente.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-2xl mx-auto shadow-2xl shadow-blue-500/10 rounded-2xl">
          <Input 
            icon={<Search className="w-6 h-6 text-primary" />} 
            placeholder="Digite sua busca..." 
            className="h-16 text-lg rounded-2xl border-white ring-4 ring-white focus:border-primary pl-14"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="pt-8">
        {query ? (
          <div className="text-slate-500 animate-pulse">Pesquisando resultados para "{query}"...</div>
        ) : (
          <div className="text-slate-400">Digite algo para iniciar a busca.</div>
        )}
      </div>
    </div>
  );
}
