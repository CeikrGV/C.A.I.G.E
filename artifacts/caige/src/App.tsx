import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import IdososList from "@/pages/Idosos";
import IdosoPerfil from "@/pages/IdosoPerfil";
import IdosoForm from "@/pages/IdosoForm";
import ProntuariosList from "@/pages/Prontuarios";
import Busca from "@/pages/Busca";
import Agenda from "@/pages/Agenda";
import Frequencia from "@/pages/Frequencia";
import Desempenho from "@/pages/Desempenho";
import GerenciarAlunos from "@/pages/GerenciarAlunos";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function ProtectedRoute({ component: Component, professorOnly = false }: { component: React.ComponentType; professorOnly?: boolean }) {
  const { user, isLoading, isProfessor } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
    if (!isLoading && user && professorOnly && !isProfessor) setLocation("/");
  }, [isLoading, user, isProfessor, setLocation, professorOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;
  if (professorOnly && !isProfessor) return null;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function MainRouter() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/idosos/novo" component={() => <ProtectedRoute component={IdosoForm} />} />
      <Route path="/idosos/:id/editar" component={() => <ProtectedRoute component={IdosoForm} professorOnly />} />
      <Route path="/idosos/:id" component={() => <ProtectedRoute component={IdosoPerfil} />} />
      <Route path="/idosos" component={() => <ProtectedRoute component={IdososList} />} />
      <Route path="/prontuarios" component={() => <ProtectedRoute component={ProntuariosList} />} />
      <Route path="/agenda" component={() => <ProtectedRoute component={Agenda} />} />
      <Route path="/frequencia" component={() => <ProtectedRoute component={Frequencia} />} />
      <Route path="/desempenho" component={() => <ProtectedRoute component={Desempenho} />} />
      <Route path="/alunos" component={() => <ProtectedRoute component={GerenciarAlunos} professorOnly />} />
      <Route path="/busca" component={() => <ProtectedRoute component={Busca} />} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <MainRouter />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
