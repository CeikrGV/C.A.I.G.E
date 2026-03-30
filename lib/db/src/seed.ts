import { db, pool } from "./index";
import {
  usuariosTable, idososTable, prontuariosTable,
  agendamentosTable, evolucoesTable, frequenciasTable
} from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Usuarios
  await db.delete(frequenciasTable);
  await db.delete(evolucoesTable);
  await db.delete(agendamentosTable);
  await db.delete(prontuariosTable);
  await db.delete(idososTable);
  await db.delete(usuariosTable);

  const usuarios = await db.insert(usuariosTable).values([
    { nome: "Prof. Carlos Mendes", email: "caige@univale.br", senha: "caige123", iniciais: "CM", papel: "professor", matricula: null, turma: null },
    { nome: "Prof. Ana Beatriz", email: "ana.beatriz@univale.br", senha: "caige123", iniciais: "AB", papel: "professor", matricula: null, turma: null },
    { nome: "João Pedro Silva", email: "joao.pedro@univale.br", senha: "aluno123", iniciais: "JP", papel: "aluno", matricula: "20210001", turma: "Fisioterapia 3A" },
    { nome: "Maria Fernanda Costa", email: "maria.fernanda@univale.br", senha: "aluno123", iniciais: "MF", papel: "aluno", matricula: "20210002", turma: "Fisioterapia 3A" },
    { nome: "Lucas Henrique Souza", email: "lucas.henrique@univale.br", senha: "aluno123", iniciais: "LH", papel: "aluno", matricula: "20210003", turma: "Enfermagem 2B" },
    { nome: "Ana Luiza Martins", email: "ana.luiza@univale.br", senha: "aluno123", iniciais: "AL", papel: "aluno", matricula: "20210004", turma: "Enfermagem 2B" },
    { nome: "Pedro Augusto Lima", email: "pedro.augusto@univale.br", senha: "aluno123", iniciais: "PA", papel: "aluno", matricula: "20210005", turma: "Fisioterapia 3A" },
  ]).returning();

  console.log(`✅ ${usuarios.length} usuários criados`);

  // Idosos
  const idosos = await db.insert(idososTable).values([
    { nome: "Maria da Silva Santos", dataNascimento: "1954-03-15", sexo: "F", cpf: "111.222.333-44", telefone: "33991234567", bairro: "Jardim Alice", rua: "Rua das Flores", numero: "123", cidade: "Governador Valadares", estado: "MG", cep: "35020-000", status: "ativo", responsavelNome: "José Santos", responsavelTelefone: "33991234568", responsavelParentesco: "Filho" },
    { nome: "Nelson Osvaldo Diego", dataNascimento: "1949-07-22", sexo: "M", cpf: "222.333.444-55", telefone: "33999760825", bairro: "Serraria", rua: "Av. Principal", numero: "456", cidade: "Governador Valadares", estado: "MG", cep: "35021-000", status: "ativo", responsavelNome: "Clara Diego", responsavelTelefone: "33999760826", responsavelParentesco: "Filha" },
    { nome: "Erick Henrique Soares", dataNascimento: "1947-11-08", sexo: "M", cpf: "333.444.555-66", telefone: "33998419421", bairro: "Alvorecer", rua: "Rua Nova", numero: "789", cidade: "Governador Valadares", estado: "MG", cep: "35022-000", status: "ativo", responsavelNome: "Paula Soares", responsavelTelefone: "33998419422", responsavelParentesco: "Sobrinha" },
    { nome: "Dona Lurdes Ferreira", dataNascimento: "1942-05-30", sexo: "F", cpf: "444.555.666-77", telefone: "33997654321", bairro: "Centro", rua: "Rua Central", numero: "10", cidade: "Governador Valadares", estado: "MG", cep: "35010-000", status: "ativo", responsavelNome: "Roberto Ferreira", responsavelTelefone: "33997654322", responsavelParentesco: "Filho" },
    { nome: "Antônio Carlos Gomes", dataNascimento: "1950-09-14", sexo: "M", cpf: "555.666.777-88", telefone: "33996543210", bairro: "Bom Jardim", rua: "Rua das Acácias", numero: "55", cidade: "Governador Valadares", estado: "MG", cep: "35025-000", status: "ativo", responsavelNome: "Marta Gomes", responsavelTelefone: "33996543211", responsavelParentesco: "Esposa" },
  ]).returning();

  console.log(`✅ ${idosos.length} idosos criados`);

  const hoje = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const diasAtras = (n: number) => { const d = new Date(hoje); d.setDate(d.getDate() - n); return fmt(d); };
  const diasAFrente = (n: number) => { const d = new Date(hoje); d.setDate(d.getDate() + n); return fmt(d); };

  // Prontuarios
  const profs = ["João Pedro Silva", "Maria Fernanda Costa", "Lucas Henrique Souza", "Ana Luiza Martins"];
  const tiposPront = ["Consulta Médica", "Fisioterapia", "Enfermagem", "Psicologia", "Nutrição"];
  const prontsData = [];
  for (let i = 0; i < 20; i++) {
    prontsData.push({
      idosoId: idosos[i % idosos.length].id,
      tipo: tiposPront[i % tiposPront.length],
      descricao: `Atendimento de rotina. Paciente apresentou boa evolução. Procedimentos realizados conforme protocolo.`,
      responsavel: profs[i % profs.length],
      data: diasAtras(30 - i),
      hora: `${8 + (i % 8)}:${i % 2 === 0 ? "00" : "30"}`,
      observacoes: "Sem intercorrências.",
    });
  }
  const prontuarios = await db.insert(prontuariosTable).values(prontsData).returning();
  console.log(`✅ ${prontuarios.length} prontuários criados`);

  // Agendamentos
  const alunos = usuarios.filter(u => u.papel === "aluno");
  const tiposAgend = ["Fisioterapia", "Consulta Médica", "Avaliação Nutricional", "Acompanhamento Psicológico"];
  const agendData = [];
  for (let i = 0; i < 15; i++) {
    const status = i < 8 ? "concluido" : (i < 12 ? "agendado" : "cancelado");
    agendData.push({
      idosoId: idosos[i % idosos.length].id,
      alunoId: alunos[i % alunos.length].id,
      data: i < 8 ? diasAtras(8 - i) : diasAFrente(i - 8),
      hora: `${9 + (i % 6)}:00`,
      tipo: tiposAgend[i % tiposAgend.length],
      status,
      observacoes: status === "concluido" ? "Sessão realizada com sucesso." : null,
    });
  }
  const agendamentos = await db.insert(agendamentosTable).values(agendData).returning();
  console.log(`✅ ${agendamentos.length} agendamentos criados`);

  // Evolucoes
  const evolsData = [];
  for (const idoso of idosos) {
    for (let i = 0; i < 6; i++) {
      evolsData.push({
        idosoId: idoso.id,
        data: diasAtras(25 - i * 5),
        peso: String((65 + Math.random() * 15).toFixed(1)),
        pressaoSistolica: 120 + Math.floor(Math.random() * 20),
        pressaoDiastolica: 70 + Math.floor(Math.random() * 15),
        frequenciaCardiaca: 70 + Math.floor(Math.random() * 20),
        glicemia: 90 + Math.floor(Math.random() * 40),
        mobilidade: ["boa", "regular", "boa", "boa"][i % 4],
        humor: ["estavel", "estavel", "ansioso", "estavel"][i % 4],
        observacoes: null,
        registradoPor: profs[i % profs.length],
      });
    }
  }
  const evolucoes = await db.insert(evolucoesTable).values(evolsData).returning();
  console.log(`✅ ${evolucoes.length} evoluções criadas`);

  // Frequencias
  const tiposAtiv = ["Visita domiciliar", "Consulta ambulatorial", "Grupo terapêutico", "Avaliação"];
  const freqsData = [];
  for (const aluno of alunos) {
    for (let i = 0; i < 12; i++) {
      freqsData.push({
        alunoId: aluno.id,
        data: diasAtras(11 - i),
        presente: i !== 3 && i !== 8,
        tipoAtividade: tiposAtiv[i % tiposAtiv.length],
        observacoes: null,
        registradoPor: "Prof. Carlos Mendes",
      });
    }
  }
  const frequencias = await db.insert(frequenciasTable).values(freqsData).returning();
  console.log(`✅ ${frequencias.length} registros de frequência criados`);

  console.log("\n✅ Seed completo!");
  console.log("👨‍🏫 Professor: caige@univale.br / caige123");
  console.log("🎓 Aluno:     joao.pedro@univale.br / aluno123");
}

seed().catch(console.error).finally(() => pool.end());
