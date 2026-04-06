import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Users, Calendar, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Frequencia {
  id: number;
  alunoId: number;
  alunoNome: string;
  data: string;
  presente: boolean;
  tipoAtividade: string;
  observacoes?: string;
}

interface Aluno {
  id: number;
  nome: string;
  matricula?: string;
  turma?: string;
}

export default function Frequencia() {
  const { user, isProfessor } = useAuth();
  const { toast } = useToast();
  const [frequencias, setFrequencias] = useState<Frequencia[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataRegistro, setDataRegistro] = useState(format(new Date(), "yyyy-MM-dd"));
  const [tipoAtividade, setTipoAtividade] = useState("Visita domiciliar");
  const [presencas, setPresencas] = useState<Record<number, boolean>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const params = isProfessor ? "" : `?alunoId=${user?.id}`;
      const [freqs, users] = await Promise.all([
        api.get(`/frequencias${params}`),
        isProfessor ? api.get("/usuarios") : Promise.resolve([]),
      ]);
      setFrequencias(Array.isArray(freqs) ? freqs : []);
      const safeUsers = Array.isArray(users) ? users : [];
      const alunosList = safeUsers.filter((u: any) => u.papel === "aluno");
      setAlunos(alunosList);
      const initialPresencas: Record<number, boolean> = {};
      alunosList.forEach((a: Aluno) => { initialPresencas[a.id] = true; });
      setPresencas(initialPresencas);
    } catch {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegistrar(e: React.FormEvent) {
    e.preventDefault();
    try {
      const registros = alunos.map(a => ({
        alunoId: a.id,
        data: dataRegistro,
        presente: presencas[a.id] ?? true,
        tipoAtividade,
        registradoPor: user!.nome,
      }));
      await api.post("/frequencias", registros);
      toast({ title: "Frequência registrada!", description: `${alunos.length} alunos registrados.` });
      setIsModalOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro ao registrar", variant: "destructive" });
    }
  }

  // Stats
  const freqsProprias = isProfessor ? frequencias : frequencias.filter(f => f.alunoId === user?.id);
  const totalDias = new Set(freqsProprias.map(f => f.data)).size;
  const presentes = freqsProprias.filter(f => f.presente).length;
  const faltas = freqsProprias.filter(f => !f.presente).length;
  const percentual = freqsProprias.length > 0 ? Math.round((presentes / freqsProprias.length) * 100) : 0;

  // Por aluno (professor view)
  const porAluno = alunos.map(a => {
    const freqsAluno = frequencias.filter(f => f.alunoId === a.id);
    const pres = freqsAluno.filter(f => f.presente).length;
    return { ...a, total: freqsAluno.length, presentes: pres, faltas: freqsAluno.length - pres, percentual: freqsAluno.length > 0 ? Math.round((pres / freqsAluno.length) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Frequência</h1>
          <p className="text-slate-500 mt-1">{isProfessor ? "Controle de presença dos alunos" : "Seu histórico de presença"}</p>
        </div>
        {isProfessor && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg shadow-blue-500/25">
            <ClipboardList className="w-5 h-5" /> Registrar Chamada
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Dias de Atividade", value: totalDias, color: "border-t-blue-500", bg: "bg-blue-100 text-blue-600", Icon: Calendar },
          { label: "Presenças", value: presentes, color: "border-t-green-500", bg: "bg-green-100 text-green-600", Icon: CheckCircle },
          { label: "Faltas", value: faltas, color: "border-t-red-500", bg: "bg-red-100 text-red-600", Icon: XCircle },
          { label: "% Presença", value: `${percentual}%`, color: "border-t-purple-500", bg: "bg-purple-100 text-purple-600", Icon: Users },
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

      {/* Tabela por aluno (professor) */}
      {isProfessor && (
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Frequência por Aluno</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-slate-500"><th className="px-6 py-4 text-left font-medium">Aluno</th><th className="px-6 py-4 text-left font-medium">Turma</th><th className="px-6 py-4 text-center font-medium">Presenças</th><th className="px-6 py-4 text-center font-medium">Faltas</th><th className="px-6 py-4 text-center font-medium">% Presença</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {porAluno.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{a.nome}</div>
                      <div className="text-xs text-slate-400">{a.matricula}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{a.turma || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-green-600">{a.presentes}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-red-500">{a.faltas}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${a.percentual}%` }} />
                        </div>
                        <span className="font-bold text-slate-800 text-xs w-8">{a.percentual}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Histórico de Presença</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-slate-500">{isProfessor && <th className="px-6 py-4 text-left font-medium">Aluno</th>}<th className="px-6 py-4 text-left font-medium">Data</th><th className="px-6 py-4 text-left font-medium">Atividade</th><th className="px-6 py-4 text-center font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Carregando...</td></tr>
              ) : (isProfessor ? frequencias : freqsProprias).slice(0, 30).map(f => (
                <tr key={f.id} className="hover:bg-slate-50">
                  {isProfessor && <td className="px-6 py-4 font-medium text-slate-800">{f.alunoNome}</td>}
                  <td className="px-6 py-4 text-slate-600">{format(new Date(f.data + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</td>
                  <td className="px-6 py-4 text-slate-600">{f.tipoAtividade}</td>
                  <td className="px-6 py-4 text-center">
                    {f.presente
                      ? <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full"><CheckCircle className="w-3 h-3" />Presente</span>
                      : <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" />Falta</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal registro chamada */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Chamada">
        <form onSubmit={handleRegistrar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Data</label>
              <Input required type="date" value={dataRegistro} onChange={e => setDataRegistro(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Atividade</label>
              <select className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={tipoAtividade} onChange={e => setTipoAtividade(e.target.value)}>
                <option>Visita domiciliar</option>
                <option>Consulta ambulatorial</option>
                <option>Grupo terapêutico</option>
                <option>Avaliação</option>
                <option>Aula prática</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Marcar Presença / Falta</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alunos.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{a.nome}</div>
                    <div className="text-xs text-slate-400">{a.matricula}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setPresencas(p => ({ ...p, [a.id]: true }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${presencas[a.id] ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>P</button>
                    <button type="button" onClick={() => setPresencas(p => ({ ...p, [a.id]: false }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!presencas[a.id] ? "bg-red-500 text-white" : "bg-slate-200 text-slate-500"}`}>F</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg">Salvar Chamada</Button>
        </form>
      </Modal>
    </div>
  );
}
