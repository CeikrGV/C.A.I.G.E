import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { LoginRequest } from "@workspace/api-client-react";
import { login as apiLogin, logout as apiLogout, getMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  iniciais: string;
  papel: "professor" | "aluno";
  matricula?: string | null;
  turma?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isProfessor: boolean;
  isAluno: boolean;
  canEdit: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("caige_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const data = await getMe();
          setUser(data as AuthUser);
          localStorage.setItem("caige_user", JSON.stringify(data));
        }
      } catch {
        setUser(null);
        localStorage.removeItem("caige_user");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const data = await apiLogin(credentials);
      const u = data as AuthUser;
      setUser(u);
      localStorage.setItem("caige_user", JSON.stringify(u));
      toast({ title: "Bem-vindo ao CAIGE!", description: `Olá, ${u.nome}` });
      setLocation("/");
    } catch {
      toast({ title: "Erro ao fazer login", description: "Verifique suas credenciais.", variant: "destructive" });
      throw new Error("Login failed");
    }
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    setUser(null);
    localStorage.removeItem("caige_user");
    setLocation("/login");
  };

  const isProfessor = user?.papel === "professor";
  const isAluno = user?.papel === "aluno";
  const canEdit = isProfessor;

  return (
    <AuthContext.Provider value={{ user, isLoading, isProfessor, isAluno, canEdit, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
