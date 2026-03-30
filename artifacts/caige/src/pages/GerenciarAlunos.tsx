import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Shield, GraduationCap, Edit } from "lucide-react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  iniciais: string;
  papel: string;
  matricula?: string;
  turma?: string;
}

const PAPEL_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  professor: { label: "Professor", color: "bg-purple-100 text-purple-700", Icon: Shield },
  aluno: { label: "Aluno", color: "bg-blue-100 text-blue-700", Icon: GraduationCap },
};

export default function GerenciarAlunos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNovoOpen, setIsNovoOpen] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", papel: "aluno", matricula: "", turma: "" });
  const [editForm, setEditForm] = useState({ papel: "aluno", turma: "" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await api.get("/usuarios");
      setUsuarios(data.filter((u: Usuario) => u.id !== user?.id));
    } catch {
      toast({ title: "Erro ao carregar usuários", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/usuarios", form);
      toast({ title: "Usuário criado!" });
      setIsNovoOpen(false);
      setForm({ nome: "", email: "", senha: "", papel: "aluno", matricula: "", turma: "" });
      loadData();
    } catch {
      toast({ title: "Erro ao criar usuário", variant: "destructive" });
    }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    try {
      await api.put(`/usuarios/${editUser.id}`, editForm);
      toast({ title: "Usuário atualizado!" });
      setEditUser(null);
      loadData();
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  }

  const alunos = usuarios.filter(u => u.papel === "aluno");
  const professores = usuarios.filter(u => u.papel === "professor");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gerenciar Usuários</h1>
          <p className="text-slate-500 mt-1">Cadastre alunos e gerencie permissões de acesso</p>
        </div>
        <Button onClick={() => setIsNovoOpen(true)} className="gap-2 shadow-lg shadow-blue-500/25">
          <Plus className="w-5 h-5" /> Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><GraduationCap className="w-6 h-6" /></div>
            <div><div className="text-3xl font-bold text-slate-900">{alunos.length}</div><div className="text-sm text-slate-500">Alunos</div></div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600"><Shield className="w-6 h-6" /></div>
            <div><div className="text-3xl font-bold text-slate-900">{professores.length + 1}</div><div className="text-sm text-slate-500">Professores</div></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                <th className="px-6 py-4 text-left font-medium">Usuário</th>
                <th className="px-6 py-4 text-left font-medium">E-mail</th>
                <th className="px-6 py-4 text-left font-medium">Matrícula</th>
                <th className="px-6 py-4 text-left font-medium">Turma</th>
                <th className="px-6 py-4 text-left font-medium">Papel</th>
                <th className="px-6 py-4 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Carregando...</td></tr>
              ) : usuarios.map(u => {
                const conf = PAPEL_CONFIG[u.papel] || PAPEL_CONFIG.aluno;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm border border-blue-100">{u.iniciais}</div>
                        <span className="font-semibold text-slate-900">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 text-slate-600">{u.matricula || "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{u.turma || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${conf.color}`}>
                        <conf.Icon className="w-3 h-3" />{conf.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { setEditUser(u); setEditForm({ papel: u.papel, turma: u.turma || "" }); }}>
                        <Edit className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Novo */}
      <Modal isOpen={isNovoOpen} onClose={() => setIsNovoOpen(false)} title="Novo Usuário">
        <form onSubmit={handleCriar} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Nome completo</label>
            <Input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: João Pedro Silva" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">E-mail</label>
            <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="joao@univale.br" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Senha inicial</label>
              <Input required value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="caige123" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Papel</label>
              <select className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={form.papel} onChange={e => setForm({ ...form, papel: e.target.value })}>
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </select>
            </div>
          </div>
          {form.papel === "aluno" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Matrícula</label>
                <Input value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value })} placeholder="20210001" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Turma</label>
                <Input value={form.turma} onChange={e => setForm({ ...form, turma: e.target.value })} placeholder="Fisioterapia 3A" />
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" size="lg">Criar Usuário</Button>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Editar: ${editUser?.nome}`}>
        <form onSubmit={handleEditar} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Papel / Permissão</label>
            <select className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={editForm.papel} onChange={e => setEditForm({ ...editForm, papel: e.target.value })}>
              <option value="aluno">Aluno — acesso limitado</option>
              <option value="professor">Professor — acesso completo</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Professores podem editar cadastros e gerenciar outros usuários.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Turma</label>
            <Input value={editForm.turma} onChange={e => setEditForm({ ...editForm, turma: e.target.value })} placeholder="Fisioterapia 3A" />
          </div>
          <Button type="submit" className="w-full" size="lg">Salvar Alterações</Button>
        </form>
      </Modal>
    </div>
  );
}
