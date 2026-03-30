import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Users, FileText, Calendar, CheckCircle, Award, ChevronDown, ChevronUp } from "lucide-react";

interface DesempenhoAluno {
  id: number;
  nome: string;
  matricula?: string;
  turma?: string;
  totalProntuarios: number;
  totalAgendamentos: number;
  agendamentosConcluidos: number;
  totalPresencas: number;
  totalFaltas: number;
  percentualPresenca: number;
}

function PerformanceBadge({ value }: { value: number }) {
  if (value >= 90) return <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Award className="w-3 h-3" />Excelente</span>;
  if (value >= 75) return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Bom</span>;
  if (value >= 60) return <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">Regular</span>;
  return <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">Atenção</span>;
}

export default function Desempenho() {
  const { user, isProfessor } = useAuth();
  const { toast } = useToast();
  const [dados, setDados] = useState<DesempenhoAluno[]>([]);
  const [meuDesempenho, setMeuDesempenho] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<keyof DesempenhoAluno>("nome");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      if (isProfessor) {
        const result = await api.get("/desempenho");
        setDados(result);
      } else {
        const result = await api.get(`/desempenho/${user?.id}`);
        setMeuDesempenho(result);
      }
    } catch {
      toast({ title: "Erro ao carregar desempenho", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSort(key: keyof DesempenhoAluno) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = [...dados].sort((a, b) => {
    const va = a[sortKey]; const vb = b[sortKey];
    if (typeof va === "number" && typeof vb === "number") return sortAsc ? va - vb : vb - va;
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const SortIcon = ({ k }: { k: string }) => sortKey === k
    ? (sortAsc ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" /> : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />)
    : null;

  // Vista do aluno
  if (!isProfessor) {
    if (isLoading) return <div className="p-12 text-center text-slate-400">Carregando...</div>;
    if (!meuDesempenho) return null;
    const d = meuDesempenho;
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meu Desempenho</h1>
          <p className="text-slate-500 mt-1">Acompanhe sua evolução no estágio CAIGE</p>
        </div>
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center text-2xl font-bold border border-blue-100">{user?.iniciais}</div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{d.aluno.nome}</h2>
                <p className="text-slate-500">{d.aluno.matricula} • {d.aluno.turma}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Prontuários", value: d.totalProntuarios, icon: <FileText className="w-5 h-5" />, color: "bg-blue-50 text-blue-600" },
                { label: "Agendamentos", value: d.agendamentos, icon: <Calendar className="w-5 h-5" />, color: "bg-purple-50 text-purple-600" },
                { label: "Concluídos", value: d.agendamentosConcluidos, icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
                { label: "Presenças", value: d.presencas, icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-50 text-green-600" },
                { label: "Faltas", value: d.faltas, icon: <Users className="w-5 h-5" />, color: "bg-red-50 text-red-600" },
                { label: "% Presença", value: `${d.percentualPresenca}%`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-orange-50 text-orange-600" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4">
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}>{icon}</div>
                  <div className="text-2xl font-bold text-slate-900">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {Object.keys(d.tiposAtendimento).length > 0 && (
          <Card>
            <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />Atendimentos por Tipo</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Object.entries(d.tiposAtendimento as Record<string, number>).map(([tipo, qtd]) => {
                  const max = Math.max(...Object.values(d.tiposAtendimento as Record<string, number>));
                  return (
                    <div key={tipo} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-slate-600 font-medium shrink-0">{tipo}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-3">
                        <div className="h-3 rounded-full bg-primary" style={{ width: `${(qtd / max) * 100}%` }} />
                      </div>
                      <div className="text-sm font-bold text-slate-800 w-6 text-right">{qtd}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Vista do professor
  if (isLoading) return <div className="p-12 text-center text-slate-400">Carregando...</div>;

  const mediaPresenca = dados.length ? Math.round(dados.reduce((acc, d) => acc + d.percentualPresenca, 0) / dados.length) : 0;
  const totalPronts = dados.reduce((acc, d) => acc + d.totalProntuarios, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Desempenho dos Alunos</h1>
        <p className="text-slate-500 mt-1">Acompanhe o progresso e performance de cada aluno</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Alunos Ativos", value: dados.length, color: "border-t-blue-500", bg: "bg-blue-100 text-blue-600", Icon: Users },
          { label: "Total de Prontuários", value: totalPronts, color: "border-t-green-500", bg: "bg-green-100 text-green-600", Icon: FileText },
          { label: "Média de Presença", value: `${mediaPresenca}%`, color: "border-t-purple-500", bg: "bg-purple-100 text-purple-600", Icon: TrendingUp },
        ].map(({ label, value, color, bg, Icon }) => (
          <Card key={label} className={`border-t-4 ${color}`}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Ranking de Alunos</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                {[
                  { label: "Aluno", key: "nome" },
                  { label: "Turma", key: "turma" },
                  { label: "Prontuários", key: "totalProntuarios" },
                  { label: "Agendamentos", key: "totalAgendamentos" },
                  { label: "% Presença", key: "percentualPresenca" },
                  { label: "Performance", key: null },
                ].map(({ label, key }) => (
                  <th key={label} className={`px-6 py-4 text-left font-medium ${key ? "cursor-pointer hover:text-primary" : ""}`} onClick={() => key && toggleSort(key as keyof DesempenhoAluno)}>
                    {label}{key && <SortIcon k={key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map(d => (
                <>
                  <tr key={d.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm border border-blue-100">
                          {d.nome.split(" ").slice(0, 2).map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{d.nome}</div>
                          <div className="text-xs text-slate-400">{d.matricula}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{d.turma || "—"}</td>
                    <td className="px-6 py-4"><span className="font-bold text-slate-900">{d.totalProntuarios}</span></td>
                    <td className="px-6 py-4"><span className="font-bold text-slate-900">{d.totalAgendamentos}</span><span className="text-xs text-slate-400 ml-1">({d.agendamentosConcluidos} conc.)</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${d.percentualPresenca}%` }} />
                        </div>
                        <span className="font-bold text-sm text-slate-800">{d.percentualPresenca}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><PerformanceBadge value={d.percentualPresenca} /></td>
                  </tr>
                  {expanded === d.id && (
                    <tr key={`detail-${d.id}`}>
                      <td colSpan={6} className="px-6 pb-4 bg-slate-50/50">
                        <div className="grid grid-cols-3 gap-4 pt-3">
                          <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Presenças / Faltas</div>
                            <div className="text-2xl font-bold text-slate-900">{d.totalPresencas} <span className="text-red-400 text-lg">/ {d.totalFaltas}</span></div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Consultas Concluídas</div>
                            <div className="text-2xl font-bold text-slate-900">{d.agendamentosConcluidos} <span className="text-slate-400 text-lg">/ {d.totalAgendamentos}</span></div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Registros Clínicos</div>
                            <div className="text-2xl font-bold text-primary">{d.totalProntuarios}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
