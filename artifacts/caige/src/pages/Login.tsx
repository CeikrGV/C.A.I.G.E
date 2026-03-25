import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("caige@univale.br");
  const [senha, setSenha] = useState("caige123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, senha });
    } catch (error) {
      // Error is handled in useAuth
    } finally {
      setIsLoading(false);
    }
  };

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden bg-slate-50">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-30"></div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md p-8 md:p-12 relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-slate-50 p-2 shadow-inner">
              <img src={`${basePath}/images/logo-caige.png`} alt="CAIGE Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">
              Área Restrita - CAIGE
            </h1>
            <p className="text-slate-500 mt-2 text-center text-sm font-medium">
              Acesso exclusivo para equipe e colaboradores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">E-mail ou Usuário</label>
              <Input
                icon={<Mail className="w-5 h-5" />}
                type="email"
                placeholder="exemplo@univale.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
              <Input
                icon={<Lock className="w-5 h-5" />}
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm text-primary font-semibold hover:text-blue-700 hover:underline">Esqueceu a senha?</a>
            </div>

            <Button type="submit" className="w-full mt-4" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-end p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${basePath}/images/caige-bg.png`} 
            alt="Healthcare worker with elderly patient" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 bg-white p-8 rounded-2xl shadow-2xl max-w-md ml-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Cuidado Interdisciplinar</h3>
          <p className="text-slate-600 leading-relaxed">
            Nossa equipe multidisciplinar trabalha de forma integrada para oferecer o melhor cuidado às pessoas idosas da nossa comunidade.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
