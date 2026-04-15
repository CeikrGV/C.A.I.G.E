import { useState } from "react";
import { useListProntuarios, useCreateProntuario, useListIdosos } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileText, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

export default function ProntuariosList() {
  const { data: prontuarios, isLoading, refetch } = useListProntuarios();
  const { data: idosos } = useListIdosos();
  const createMutation = useCreateProntuario();
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    idosoId: "",
    tipo: "Consulta Médica",
    descricao: "",
    responsavel: "",
  });

  // Mock data for display if API empty
  const items = Array.isArray(prontuarios) && prontuarios.length ? prontuarios : [
    { id: 1, idosoId: 1, idosoNome: "Nelson Osvaldo Diego", tipo: "Consulta Médica", descricao: "Acompanhamento de rotina de hipertensão. Pressão estável.", responsavel: "Dra. Maria", data: "2025-09-22", hora: "10:30" },
    { id: 2, idosoId: 2, idosoNome: "Maria da Silva Santos", tipo: "Fisioterapia", descricao: "Exercícios motores membros inferiores.", responsavel: "Dr. Carlos", data: "2025-09-25", hora: "14:30" },
  ];

  const filteredItems = items.filter(i => 
    i.idosoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idosoId || !formData.descricao) return;
    
    try {
      const now = new Date();
      await createMutation.mutateAsync({
        data: {
          idosoId: parseInt(formData.idosoId),
          tipo: formData.tipo,
          descricao: formData.descricao,
          responsavel: formData.responsavel || "Sistema",
          data: format(now, "yyyy-MM-dd"),
          hora: format(now, "HH:mm"),
          observacoes: ""
        }
      });
      toast({ title: "Sucesso", description: "Prontuário adicionado." });
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao salvar prontuário.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Prontuários</h1>
          <p className="text-slate-500 mt-1">Histórico clínico e atendimentos dos pacientes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg shadow-blue-500/25">
          <Plus className="w-5 h-5" /> Novo Prontuário
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-full max-w-md">
          <Input 
            icon={<Search className="w-5 h-5" />} 
            placeholder="Buscar por paciente ou tipo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map(pront => (
          <Card key={pront.id} className="hover:border-primary/30 transition-colors">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4 shrink-0 border-r border-slate-100 pr-6">
                <p className="text-sm text-slate-500 font-medium mb-1">Paciente</p>
                <p className="font-bold text-slate-900 leading-tight">{pront.idosoNome}</p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-primary bg-blue-50 w-fit px-2.5 py-1 rounded-md">
                  <FileText className="w-3 h-3" /> {pront.tipo}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-slate-700 leading-relaxed mb-4">{pront.descricao}</p>
                <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> {pront.responsavel}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" /> 
                    {pront.data.includes('-') ? format(new Date(pront.data), "dd/MM/yyyy") : pront.data}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" /> {pront.hora}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center p-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            Nenhum prontuário encontrado.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Prontuário">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Paciente</label>
            <select 
              className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              value={formData.idosoId}
              onChange={e => setFormData({...formData, idosoId: e.target.value})}
              required
            >
              <option value="">Selecione o paciente...</option>
              {idosos?.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Tipo de Atendimento</label>
            <select 
              className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              value={formData.tipo}
              onChange={e => setFormData({...formData, tipo: e.target.value})}
            >
              <option value="Consulta Médica">Consulta Médica</option>
              <option value="Fisioterapia">Fisioterapia</option>
              <option value="Enfermagem">Enfermagem</option>
              <option value="Psicologia">Psicologia</option>
              <option value="Nutrição">Nutrição</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Profissional Responsável</label>
            <Input 
              required
              value={formData.responsavel}
              onChange={e => setFormData({...formData, responsavel: e.target.value})}
              placeholder="Nome do profissional"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Descrição / Evolução</label>
            <textarea 
              required
              className="w-full min-h-[120px] rounded-xl border-2 border-slate-200 bg-white p-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva o atendimento..."
            />
          </div>

          <Button type="submit" className="w-full mt-2" size="lg" isLoading={createMutation.isPending}>
            Salvar Registro
          </Button>
        </form>
      </Modal>
    </div>
  );
}
