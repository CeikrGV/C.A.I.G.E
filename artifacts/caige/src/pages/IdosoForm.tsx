import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateIdoso, useUpdateIdoso, useGetIdoso } from "@workspace/api-client-react";
import { useRoute, useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  sexo: z.enum(["masculino", "feminino"]),
  cpf: z.string().min(11, "CPF inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  rua: z.string().min(1, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cep: z.string().min(8, "CEP inválido"),
  status: z.enum(["ativo", "inativo"]),
  responsavelNome: z.string().min(1, "Nome do responsável é obrigatório"),
  responsavelTelefone: z.string().min(10, "Telefone do responsável inválido"),
  responsavelParentesco: z.string().min(1, "Parentesco é obrigatório"),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function IdosoForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [matchEdit, params] = useRoute("/idosos/:id/editar");
  const isEdit = Boolean(matchEdit);
  const id = isEdit ? parseInt(params!.id) : 0;

  const { data: idosoData, isLoading: isFetching } = useGetIdoso(id, { query: { enabled: isEdit } });
  const createMutation = useCreateIdoso();
  const updateMutation = useUpdateIdoso();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ativo", sexo: "masculino" }
  });

  useEffect(() => {
    if (isEdit && idosoData) {
      reset(idosoData as any);
    }
  }, [isEdit, idosoData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: data as any });
        toast({ title: "Sucesso", description: "Cadastro atualizado com sucesso." });
        setLocation(`/idosos/${id}`);
      } else {
        const res = await createMutation.mutateAsync({ data: data as any });
        toast({ title: "Sucesso", description: "Idoso cadastrado com sucesso." });
        setLocation(`/idosos/${res.id}`);
      }
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível salvar os dados.", variant: "destructive" });
    }
  };

  if (isEdit && isFetching) return <div className="p-8">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="bg-white h-10 w-10 p-0" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isEdit ? "Editar Cadastro" : "Novo Cadastro de Idoso"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
              <Input {...register("nome")} error={errors.nome?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Data de Nascimento</label>
              <Input type="date" {...register("dataNascimento")} error={errors.dataNascimento?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sexo</label>
              <select {...register("sexo")} className="flex w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all">
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">CPF</label>
              <Input {...register("cpf")} placeholder="Apenas números" error={errors.cpf?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Telefone</label>
              <Input {...register("telefone")} placeholder="(XX) XXXXX-XXXX" error={errors.telefone?.message} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Rua</label>
              <Input {...register("rua")} error={errors.rua?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Número</label>
              <Input {...register("numero")} error={errors.numero?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Bairro</label>
              <Input {...register("bairro")} error={errors.bairro?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Cidade</label>
              <Input {...register("cidade")} error={errors.cidade?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Estado / CEP</label>
              <div className="flex gap-2">
                <Input {...register("estado")} placeholder="UF" className="w-20" />
                <Input {...register("cep")} placeholder="CEP" className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle>Responsável</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nome</label>
              <Input {...register("responsavelNome")} error={errors.responsavelNome?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Telefone</label>
              <Input {...register("responsavelTelefone")} error={errors.responsavelTelefone?.message} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Parentesco</label>
              <Input {...register("responsavelParentesco")} error={errors.responsavelParentesco?.message} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <textarea 
              {...register("observacoes")} 
              className="w-full min-h-[100px] rounded-xl border-2 border-slate-200 bg-white p-4 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="Anotações importantes..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4 pb-12">
          <Button type="button" variant="ghost" onClick={() => window.history.back()}>Cancelar</Button>
          <Button type="submit" size="lg" className="px-10 gap-2 shadow-lg shadow-blue-500/25" isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}>
            <Save className="w-5 h-5" /> Salvar Cadastro
          </Button>
        </div>
      </form>
    </div>
  );
}
