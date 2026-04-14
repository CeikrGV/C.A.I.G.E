import { useGetDashboardStats, useGetDashboardActivities } from "@workspace/api-client-react";
import type { DashboardStats, Activity as DashboardActivity } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCircle, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { unwrapArray, unwrapData } from "@/lib/response";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Using hooks from generated client.
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activities, isLoading: actsLoading } = useGetDashboardActivities();

  const normalizedStats = unwrapData<DashboardStats>(stats);
  const normalizedActivities = unwrapArray<DashboardActivity>(
    activities,
    "activities",
  );

  if (statsLoading || actsLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-10 bg-slate-200 rounded w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div></div>
    </div>;
  }

  const s = normalizedStats ?? {
    totalIdosos: 0,
    profissionaisEnvolvidos: 0,
    atendimentosEmAndamento: 0,
    atendimentosHoje: 0,
    atendimentosSemana: 0,
    atendimentosMes: 0,
    satisfacao: 0,
  };

  const a = normalizedActivities;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo(a), {user?.nome?.split(' ')[0] || "Geane"}</h1>
        <p className="text-slate-500 mt-1">Aqui está um resumo das atividades do CAIGE</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Estatísticas Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-cyan-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <Users className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> + 12%
                </span>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-1">{s.totalIdosos}</h3>
              <p className="font-semibold text-slate-700 text-sm">Total de Idosos Atendidos</p>
              <p className="text-slate-400 text-xs mt-1">Pacientes cadastrados no sistema</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-purple-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <UserCircle className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> + 2%
                </span>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-1">{s.profissionaisEnvolvidos}</h3>
              <p className="font-semibold text-slate-700 text-sm">Profissionais Envolvidos</p>
              <p className="text-slate-400 text-xs mt-1">Equipe multidisciplinar ativa</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-orange-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-full">
                  <ArrowDownRight className="w-3 h-3" /> - 3%
                </span>
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-1">{s.atendimentosEmAndamento}</h3>
              <p className="font-semibold text-slate-700 text-sm">Atendimentos em Andamento</p>
              <p className="text-slate-400 text-xs mt-1">Consultas e terapias hoje</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Atividades Recentes</h2>
            <button className="text-sm font-semibold text-primary hover:underline">Ver Todas</button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="px-6 py-4 font-medium">Data/Hora</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Descrição</th>
                    <th className="px-6 py-4 font-medium">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(a || []).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {format(new Date(item.data), "dd/MM/yyyy")}
                        </div>
                        <div className="text-slate-500 text-xs">{item.hora}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-primary cursor-pointer hover:underline">
                        {item.tipo}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{item.descricao}</td>
                      <td className="px-6 py-4 text-slate-600">{item.responsavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Acesso Rápido</h2>
              <p className="text-sm text-slate-500 mb-8">Ações mais utilizadas para agilizar seu trabalho</p>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{s.atendimentosHoje}</div>
                  <div className="text-xs text-slate-500 mt-1">Hoje</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{s.atendimentosSemana}</div>
                  <div className="text-xs text-slate-500 mt-1">Semana</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{s.atendimentosMes}</div>
                  <div className="text-xs text-slate-500 mt-1">Mês</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{s.satisfacao}%</div>
                  <div className="text-xs text-slate-500 mt-1">Satisfação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
