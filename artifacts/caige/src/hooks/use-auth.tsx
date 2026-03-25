import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AuthUser, LoginRequest } from "@workspace/api-client-react";
import { login as apiLogin, logout as apiLogout, getMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
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
          // Attempt to fetch from API if not in local storage
          const data = await getMe();
          setUser(data);
          localStorage.setItem("caige_user", JSON.stringify(data));
        }
      } catch (error) {
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
      setUser(data);
      localStorage.setItem("caige_user", JSON.stringify(data));
      toast({ title: "Bem-vindo ao CAIGE!", description: `Olá, ${data.nome}` });
      setLocation("/");
    } catch (error) {
      toast({ 
        title: "Erro ao fazer login", 
        description: "Verifique suas credenciais e tente novamente.", 
        variant: "destructive" 
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API failed, continuing local logout");
    } finally {
      setUser(null);
      localStorage.removeItem("caige_user");
      setLocation("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
