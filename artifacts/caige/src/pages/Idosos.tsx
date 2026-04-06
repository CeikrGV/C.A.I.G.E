import { useListIdosos } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Plus, ChevronDown } from "lucide-react";
import { formatPhone } from "@/lib/utils";

export default function IdososList() {
  const { data: idosos, isLoading } = useListIdosos();

  const items = Array.isArray(idosos) ? idosos : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pacientes Cadastrados</h1>
          <p className="text-slate-500 mt-1">Gerencie e visualize os dados cadastrais dos pacientes</p>
        </div>
        <Link href="/idosos/novo" className="inline-flex">
          <Button className="gap-2 shadow-lg shadow-blue-500/25">
            <Plus className="w-5 h-5" /> Cadastrar Paciente
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
        <button className="flex items-center justify-between w-64 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
          Todos os pacientes <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium px-4">
          <UsersIcon className="w-4 h-4" /> {items.length} pacientes cadastrados
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Nenhum paciente encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((idoso) => (
            <Card key={idoso.id} className="hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-primary flex items-center justify-center text-xl font-bold border border-blue-100">
                    {idoso.iniciais}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{idoso.nome}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{idoso.idade} anos</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {formatPhone(idoso.telefone)}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {idoso.bairro}
                  </div>
                </div>

                <Link href={`/idosos/${idoso.id}`} className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <UserIcon className="w-4 h-4" /> Ver Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function UserIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
