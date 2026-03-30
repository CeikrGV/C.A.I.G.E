import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useGetIdoso } from "@workspace/api-client-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Edit, MapPin, Phone, Plus, TrendingUp, Heart, Activity } from "lucide-react";
import { formatPhone, formatCPF } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Evolucao {
  id: number;
  data: string;
  peso?: string;
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  frequenciaCardiaca?: number;
  glicemia?: number;
  mobilidade?: string;
  humor?: string;
  observacoes?: string;
  registradoPor: string;
}

const MOBILIDADE_COLOR: Record<string, string> = { boa: "bg-green-100 text-green-700", regular: "bg-yellow-100 text-yellow-700", ruim: "bg-red-100 text-red-700" };
const HUMOR_COLOR: Record<string, string> = { estavel: "bg-green-100 text-green-700", agitado: "bg-orange-100 text-orange-700", deprimido: "bg-red-100 text-red-700", ansioso: "bg-yellow-100 text-yellow-700" };

export default function IdosoPerfil() {
  const [, params] = useRoute("/idosos/:id");
  const id = params?.id ? parseInt(params.id) : 1;
  const { data, isLoading } = useGetIdoso(id);
  const { user, canEdit } = useAuth();
  const { toast } = useToast();
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [isEvolucaoOpen, setIsEvolucaoOpen] = useState(false);
  const [evolForm, setEvolForm] = useState({
    data: format(new Date(), "yyyy-MM-dd"),
    peso: "", pressaoSistolica: "", pressaoDiastolica: "", frequenciaCardiaca: "", glicemia: "",
    mobilidade: "boa", humor: "estavel", observacoes: ""
  });

  useEffect(() => { loadEvolucoes(); }, [id]);

  async function loadEvolucoes() {
    try {
      const evols = await api.get(`/evolucoes?idosoId=${id}`);
      setEvolucoes(evols);
    } catch { /* silently fail */ }
  }

  async function handleSalvarEvolucao(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/evolucoes", {
        idosoId: id,
        data: evolForm.data,
        peso: evolForm.peso ? evolForm.peso : null,
        pressaoSistolica: evolForm.pressaoSistolica ? parseInt(evolForm.pressaoSistolica) : null,
        pressaoDiastolica: evolForm.pressaoDiastolica ? parseInt(evolForm.pressaoDiastolica) : null,
        frequenciaCardiaca: evolForm.frequenciaCardiaca ? parseInt(evolForm.frequenciaCardiaca) : null,
        glicemia: evolForm.glicemia ? parseInt(evolForm.glicemia) : null,
        mobilidade: evolForm.mobilidade,
        humor: evolForm.humor,
        observacoes: evolForm.observacoes || null,
        registradoPor: user?.nome ?? "Sistema",
      });
      toast({ title: "Evolução registrada!" });
      setIsEvolucaoOpen(false);
      loadEvolucoes();
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  }

  const idoso = data || {
    id: 1, nome: "Nelson Osvaldo Diego", iniciais: "NO", idade: 75,
    dataNascimento: "1950-10-19", sexo: "M", cpf: "33835254499",
    telefone: "33999760825", rua: "Rua Dona Carola", numero: "334",
    bairro: "Serraria", cidade: "Governador Valadares", estado: "MG",
    cep: "35021-000", status: "ativo", responsavelNome: "Gabriela Benedita",
    responsavelTelefone: "3329858676", responsavelParentesco: "Filha",
    cadastro: "2024-01-10", observacoes: "Paciente com hipertensão leve."
  };

  if (isLoading && !data) return <div className="p-8 text-center text-slate-400">Carregando perfil...</div>;

  const ultimaEvolucao = evolucoes[evolucoes.length - 1];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center text-sm font-medium text-slate-500 mb-2">
        <Link href="/idosos" className="hover:text-primary transition-colors">Idosos Cadastrados</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-900">{idoso.nome}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/idosos">
          <Button variant="outline" className="bg-white gap-2 border-slate-200 text-slate-700">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white gap-2 border-slate-200 text-slate-700" onClick={() => setIsEvolucaoOpen(true)}>
            <Plus className="w-4 h-4" /> Registrar Evolução
          </Button>
          <Link href={`/prontuarios?idosoId=${id}`}>
            <Button variant="outline" className="bg-white gap-2 border-slate-200 text-slate-700">
              <FileText className="w-4 h-4" /> Prontuário
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/idosos/${id}/editar`}>
              <Button className="gap-2 shadow-md shadow-blue-500/20">
                <Edit className="w-4 h-4" /> Editar Cadastro
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main info */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-50 text-primary flex items-center justify-center text-3xl font-bold border border-blue-100 shrink-0">
                  {idoso.iniciais}
                </div>
                <div className="w-full">
                  <h1 className="text-3xl font-bold text-slate-900 mb-6">{idoso.nome}</h1>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {[
                      { label: "Idade", value: `${idoso.idade} anos` },
                      { label: "Nascimento", value: idoso.dataNascimento },
                      { label: "Sexo", value: idoso.sexo === "M" ? "Masculino" : "Feminino" },
                      { label: "CPF", value: formatCPF(idoso.cpf) },
                      { label: "Telefone", value: formatPhone(idoso.telefone) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-sm text-slate-500 font-medium">{label}</p>
                        <p className="font-semibold text-slate-900 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Últimos sinais vitais */}
          {ultimaEvolucao && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                <Heart className="w-5 h-5 text-red-500" />
                <CardTitle>Últimos Sinais Vitais</CardTitle>
                <span className="ml-auto text-xs text-slate-400">
                  {format(new Date(ultimaEvolucao.data + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })} • {ultimaEvolucao.registradoPor}
                </span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ultimaEvolucao.peso && (
                    <div className="bg-slate-50 rounded-xl p-4"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Peso</div><div className="text-xl font-bold text-slate-900">{ultimaEvolucao.peso} <span className="text-sm text-slate-400">kg</span></div></div>
                  )}
                  {ultimaEvolucao.pressaoSistolica && (
                    <div className="bg-slate-50 rounded-xl p-4"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Pressão</div><div className="text-xl font-bold text-slate-900">{ultimaEvolucao.pressaoSistolica}/{ultimaEvolucao.pressaoDiastolica} <span className="text-sm text-slate-400">mmHg</span></div></div>
                  )}
                  {ultimaEvolucao.frequenciaCardiaca && (
                    <div className="bg-slate-50 rounded-xl p-4"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Freq. Cardíaca</div><div className="text-xl font-bold text-slate-900">{ultimaEvolucao.frequenciaCardiaca} <span className="text-sm text-slate-400">bpm</span></div></div>
                  )}
                  {ultimaEvolucao.glicemia && (
                    <div className="bg-slate-50 rounded-xl p-4"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Glicemia</div><div className="text-xl font-bold text-slate-900">{ultimaEvolucao.glicemia} <span className="text-sm text-slate-400">mg/dL</span></div></div>
                  )}
                  {ultimaEvolucao.mobilidade && (
                    <div className="bg-slate-50 rounded-xl p-4"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Mobilidade</div><span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${MOBILIDADE_COLOR[ultimaEvolucao.mobilidade] || "bg-slate-100 text-slate-700"}`}>{ultimaEvolucao.mobilidade}</span></div>
                  )}
                  {ultimaEvolucao.humor && (
                    <div className="bg-slate-50 rounded-xl p-4"><div className="text-xs font-bold text-slate-500 uppercase mb-1">Humor</div><span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${HUMOR_COLOR[ultimaEvolucao.humor] || "bg-slate-100 text-slate-700"}`}>{ultimaEvolucao.humor}</span></div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de evolução */}
          {evolucoes.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle>Histórico de Evoluções ({evolucoes.length})</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-100 text-slate-500"><th className="px-6 py-3 text-left font-medium">Data</th><th className="px-6 py-3 text-left font-medium">Pressão</th><th className="px-6 py-3 text-left font-medium">FC</th><th className="px-6 py-3 text-left font-medium">Peso</th><th className="px-6 py-3 text-left font-medium">Mobilidade</th><th className="px-6 py-3 text-left font-medium">Humor</th><th className="px-6 py-3 text-left font-medium">Registrado por</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...evolucoes].reverse().map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{format(new Date(ev.data + "T12:00:00"), "dd/MM/yy")}</td>
                        <td className="px-6 py-3 text-slate-600">{ev.pressaoSistolica ? `${ev.pressaoSistolica}/${ev.pressaoDiastolica}` : "—"}</td>
                        <td className="px-6 py-3 text-slate-600">{ev.frequenciaCardiaca ?? "—"}</td>
                        <td className="px-6 py-3 text-slate-600">{ev.peso ? `${ev.peso}kg` : "—"}</td>
                        <td className="px-6 py-3">{ev.mobilidade ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${MOBILIDADE_COLOR[ev.mobilidade] || "bg-slate-100 text-slate-700"}`}>{ev.mobilidade}</span> : "—"}</td>
                        <td className="px-6 py-3">{ev.humor ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${HUMOR_COLOR[ev.humor] || "bg-slate-100 text-slate-700"}`}>{ev.humor}</span> : "—"}</td>
                        <td className="px-6 py-3 text-slate-500 text-xs">{ev.registradoPor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Endereço */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/50">
              <MapPin className="w-5 h-5 text-primary" />
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                {[
                  { label: "Rua", value: idoso.rua }, { label: "Número", value: idoso.numero },
                  { label: "Bairro", value: idoso.bairro }, { label: "Cidade", value: idoso.cidade },
                  { label: "Estado", value: idoso.estado?.toUpperCase() }, { label: "CEP", value: idoso.cep },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <p className="font-semibold text-slate-900 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {idoso.observacoes && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                <FileText className="w-5 h-5 text-primary" /><CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-700 leading-relaxed">{idoso.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50"><CardTitle>Resumo Rápido</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { label: "Idade", value: `${idoso.idade} anos` },
                { label: "Localização", value: `${idoso.bairro}, ${idoso.estado?.toUpperCase()}` },
                { label: "Cadastro", value: idoso.cadastro },
                { label: "Contato", value: formatPhone(idoso.telefone), primary: true },
              ].map(({ label, value, primary }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500 font-medium">{label}</span>
                  <span className={`font-bold text-right text-sm ${primary ? "text-primary" : "text-slate-900"}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-500 font-medium">Status</span>
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{idoso.status}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50"><CardTitle>Responsável</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div><p className="text-sm text-slate-500 font-medium">Nome</p><p className="font-bold text-slate-900 mt-1">{idoso.responsavelNome}</p></div>
              <div><p className="text-sm text-slate-500 font-medium">Telefone</p><p className="font-bold text-primary mt-1">{formatPhone(idoso.responsavelTelefone)}</p></div>
              <div><p className="text-sm text-slate-500 font-medium">Parentesco</p><p className="font-bold text-slate-900 mt-1">{idoso.responsavelParentesco}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Evoluções</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-primary mb-1">{evolucoes.length}</div>
              <p className="text-sm text-slate-500">registros de evolução</p>
              <Button variant="outline" size="sm" className="mt-4 w-full gap-2" onClick={() => setIsEvolucaoOpen(true)}>
                <Plus className="w-4 h-4" /> Nova Evolução
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Evolução */}
      <Modal isOpen={isEvolucaoOpen} onClose={() => setIsEvolucaoOpen(false)} title="Registrar Evolução">
        <form onSubmit={handleSalvarEvolucao} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Data</label>
            <Input required type="date" value={evolForm.data} onChange={e => setEvolForm({ ...evolForm, data: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Peso (kg)</label>
              <Input type="number" step="0.1" placeholder="70.5" value={evolForm.peso} onChange={e => setEvolForm({ ...evolForm, peso: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Pressão Sist.</label>
              <Input type="number" placeholder="120" value={evolForm.pressaoSistolica} onChange={e => setEvolForm({ ...evolForm, pressaoSistolica: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Pressão Diast.</label>
              <Input type="number" placeholder="80" value={evolForm.pressaoDiastolica} onChange={e => setEvolForm({ ...evolForm, pressaoDiastolica: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">FC (bpm)</label>
              <Input type="number" placeholder="72" value={evolForm.frequenciaCardiaca} onChange={e => setEvolForm({ ...evolForm, frequenciaCardiaca: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Glicemia</label>
              <Input type="number" placeholder="100" value={evolForm.glicemia} onChange={e => setEvolForm({ ...evolForm, glicemia: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Mobilidade</label>
              <select className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={evolForm.mobilidade} onChange={e => setEvolForm({ ...evolForm, mobilidade: e.target.value })}>
                <option value="boa">Boa</option>
                <option value="regular">Regular</option>
                <option value="ruim">Ruim</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Humor</label>
              <select className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary" value={evolForm.humor} onChange={e => setEvolForm({ ...evolForm, humor: e.target.value })}>
                <option value="estavel">Estável</option>
                <option value="agitado">Agitado</option>
                <option value="deprimido">Deprimido</option>
                <option value="ansioso">Ansioso</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Observações</label>
            <textarea className="w-full min-h-[80px] rounded-xl border-2 border-slate-200 bg-white p-4 text-sm focus:outline-none focus:border-primary" value={evolForm.observacoes} onChange={e => setEvolForm({ ...evolForm, observacoes: e.target.value })} placeholder="Observações clínicas..." />
          </div>
          <Button type="submit" className="w-full" size="lg">Salvar Evolução</Button>
        </form>
      </Modal>
    </div>
  );
}
