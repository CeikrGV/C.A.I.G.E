import { useRoute, Link } from "wouter";
import { useGetIdoso } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Edit, MapPin, Phone } from "lucide-react";
import { formatPhone, formatCPF } from "@/lib/utils";

export default function IdosoPerfil() {
  const [, params] = useRoute("/idosos/:id");
  const id = params?.id ? parseInt(params.id) : 1;
  const { data, isLoading } = useGetIdoso(id);

  // Fallback data
  const idoso = data || {
    id: 1, nome: "Nelson Osvaldo Diego", iniciais: "NO", idade: 75,
    dataNascimento: "19/10/1950", sexo: "Masculino", cpf: "33835254499",
    telefone: "33999760825", rua: "Rua Dona Carola", numero: "334",
    bairro: "Serraria", cidade: "Governador Valadares", estado: "GV",
    cep: "88115150", status: "ativo", responsavelNome: "Gabriela Benedita",
    responsavelTelefone: "3329858676", responsavelParentesco: "Filha",
    cadastro: "10/01/2024", observacoes: "Paciente com hipertensão leve."
  };

  if (isLoading && !data) return <div className="p-8 text-center">Carregando perfil...</div>;

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
          <Link href={`/prontuarios?idosoId=${id}`}>
            <Button variant="outline" className="bg-white gap-2 border-slate-200 text-slate-700">
              <FileText className="w-4 h-4" /> Acessar Prontuário
            </Button>
          </Link>
          <Link href={`/idosos/${id}/editar`}>
            <Button className="gap-2 shadow-md shadow-blue-500/20">
              <Edit className="w-4 h-4" /> Editar Cadastro
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-50 text-primary flex items-center justify-center text-3xl font-bold border border-blue-100 shrink-0">
                  {idoso.iniciais}
                </div>
                <div className="w-full">
                  <h1 className="text-3xl font-bold text-slate-900 mb-6">{idoso.nome}</h1>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Idade</p>
                      <p className="font-semibold text-slate-900 mt-1">{idoso.idade} anos</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Nascimento</p>
                      <p className="font-semibold text-slate-900 mt-1">{idoso.dataNascimento}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Sexo</p>
                      <p className="font-semibold text-slate-900 mt-1 capitalize">{idoso.sexo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">CPF</p>
                      <p className="font-semibold text-slate-900 mt-1">{formatCPF(idoso.cpf)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Telefone</p>
                      <p className="font-semibold text-slate-900 mt-1">{formatPhone(idoso.telefone)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/50">
              <MapPin className="w-5 h-5 text-primary" />
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Rua</p>
                  <p className="font-semibold text-slate-900 mt-1">{idoso.rua}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Número</p>
                  <p className="font-semibold text-slate-900 mt-1">{idoso.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Bairro</p>
                  <p className="font-semibold text-slate-900 mt-1">{idoso.bairro}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Cidade</p>
                  <p className="font-semibold text-slate-900 mt-1">{idoso.cidade}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Estado</p>
                  <p className="font-semibold text-slate-900 mt-1 uppercase">{idoso.estado}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">CEP</p>
                  <p className="font-semibold text-slate-900 mt-1">{idoso.cep}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="flex flex-row items-center gap-3 border-b border-slate-100 bg-slate-50/50">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-slate-700 leading-relaxed">
                {idoso.observacoes || "Nenhuma observação registrada."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sidebar Cards) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle>Resumo Rápido</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Idade</span>
                <span className="font-bold text-slate-900">{idoso.idade} anos</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Localização</span>
                <span className="font-bold text-slate-900 text-right">{idoso.bairro}, {idoso.estado}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Cadastro</span>
                <span className="font-bold text-slate-900">{idoso.cadastro}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Contato</span>
                <span className="font-bold text-primary">{formatPhone(idoso.telefone)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-500 font-medium">Status</span>
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {idoso.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle>Responsável</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">Nome</p>
                <p className="font-bold text-slate-900 mt-1">{idoso.responsavelNome}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Telefone</p>
                <p className="font-bold text-primary mt-1">{formatPhone(idoso.responsavelTelefone)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Parentesco</p>
                <p className="font-bold text-slate-900 mt-1">{idoso.responsavelParentesco}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
