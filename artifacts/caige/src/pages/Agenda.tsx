import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Agendamento {
  id: number;
  idosoId: number;
  alunoId: number;
  idosoNome: string;
  alunoNome: string;
  data: string;
  hora: string;
  tipo: string;
  status: string;
  observacoes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  agendado: { label: "Agendado", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="w-3 h-3" /> },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
};

export default function Agenda() {
  const { user, isProfessor } = useAuth();
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [idosos, setIdosos] = useState<{ id: number; nome: string }[]>([]);
  const [alunos, setAlunos] = useState<{ id: number; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [form, setForm] = useState({
    idosoId: "", alunoId: "", data: "", hora: "09:00", tipo: "Fisioterapia", observacoes: ""
  });

  const hoje = new Date();
  const inicioDaSemana = addDays(startOfWeek(hoje, { weekStartsOn: 1 }), semanaOffset * 7);
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => addDays(inicioDaSemana, i));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [agends, idos, users] = await Promise.all([
        api.get("/agendamentos"),
        api.get("/idosos"),
        isProfessor ? api.get("/usuarios") : Promise.resolve([]),
      ]);
      setAgendamentos(Array.isArray(agends) ? agends : []);
      setIdosos(Array.isArray(idos) ? idos : []);
      const safeUsers = Array.isArray(users) ? users : [];
      setAlunos(safeUsers.filter((u: any) => u.papel === "aluno"));
    } catch {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/agendamentos", {
        idosoId: parseInt(form.idosoId),
        alunoId: isProfessor ? parseInt(form.alunoId) : user!.id,
        data: form.data,
        hora: form.hora,
        tipo: form.tipo,
        observacoes: form.observacoes || null,
      });
      toast({ title: "Consulta agendada!" });
      setIsModalOpen(false);
      setForm({ idosoId: "", alunoId: "", data: "", hora: "09:00", tipo: "Fisioterapia", observacoes: "" });
      loadData();
    } catch {
      toast({ title: "Erro ao agendar", variant: "destructive" });
    }
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      await api.put(`/agendamentos/${id}`, { status });
      setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast({ title: status === "concluido" ? "Consulta concluída!" : "Status atualizado" });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  }

  const agendsFiltrados = agendamentos.filter(a => !isProfessor ? a.alunoId === user?.id : true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-slate-500 mt-1">Gerencie as consultas e visitas agendadas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg shadow-blue-500/25">
          <Plus className="w-5 h-5" /> Novo Agendamento
        </Button>
      </div>

      {/* Navegação da semana */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSemanaOffset(s => s - 1)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">← Anterior</button>
            <span className="font-semibold text-slate-800">
              {format(diasDaSemana[0], "d MMM", { locale: ptBR })} – {format(diasDaSemana[6], "d MMM yyyy", { locale: ptBR })}
            </span>
            <button onClick={() => setSemanaOffset(s => s + 1)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Próxima →</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {diasDaSemana.map((dia) => {
              const diaStr = format(dia, "yyyy-MM-dd");
              const agendsNoDia = agendsFiltrados.filter(a => a.data === diaStr);
              const isHoje = diaStr === format(hoje, "yyyy-MM-dd");
              return (
                <div key={diaStr} className={`rounded-xl p-2 min-h-[90px] ${isHoje ? "bg-blue-50 border-2 border-blue-200" : "bg-slate-50 border border-slate-100"}`}>
                  <div className={`text-center text-xs font-bold mb-2 ${isHoje ? "text-primary" : "text-slate-500"}`}>
                    <div>{format(dia, "EEE", { locale: ptBR }).toUpperCase()}</div>
                    <div className={`text-lg ${isHoje ? "text-primary" : "text-slate-800"}`}>{format(dia, "d")}</div>
                  </div>
                  {agendsNoDia.map(a => (
                    <div key={a.id} className={`text-xs px-1.5 py-1 rounded mb-1 leading-tight font-medium ${STATUS_CONFIG[a.status]?.color || "bg-slate-100"}`}>
                      {a.hora} {a.tipo.split(" ")[0]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Todos os Agendamentos</h2>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl" />)}</div>
        ) : agendsFiltrados.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-slate-500">Nenhum agendamento encontrado.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {agendsFiltrados.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)).map(ag => (
              <Card key={ag.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{ag.idosoNome}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{format(new Date(ag.data + "T12:00:00"), "dd/MM/yyyy")} às {ag.hora}</span>
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ag.alunoNome}</span>
                        </div>
                        <div className="text-xs font-semibold text-primary mt-1">{ag.tipo}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_CONFIG[ag.status]?.color}`}>
                        {STATUS_CONFIG[ag.status]?.icon} {STATUS_CONFIG[ag.status]?.label}
                      </span>
                      {ag.status === "agendado" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(ag.id, "concluido")} className="text-green-600 border-green-200 hover:bg-green-50 text-xs">Concluir</Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(ag.id, "cancelado")} className="text-red-500 border-red-200 hover:bg-red-50 text-xs">Cancelar</Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Paciente</label>
            <select required className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={form.idosoId} onChange={e => setForm({ ...form, idosoId: e.target.value })}>
              <option value="">Selecione...</option>
              {idosos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          {isProfessor && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Aluno Responsável</label>
              <select required className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={form.alunoId} onChange={e => setForm({ ...form, alunoId: e.target.value })}>
                <option value="">Selecione...</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Data</label>
              <Input required type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Hora</label>
              <Input required type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Tipo</label>
            <select className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option>Fisioterapia</option>
              <option>Consulta Médica</option>
              <option>Avaliação Nutricional</option>
              <option>Acompanhamento Psicológico</option>
              <option>Enfermagem</option>
              <option>Visita Domiciliar</option>
            </select>
          </div>
          <Button type="submit" className="w-full" size="lg">Confirmar Agendamento</Button>
        </form>
      </Modal>
    </div>
  );
}
