import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import {
  db,
  pool,
  usuariosTable,
  idososTable,
  agendamentosTable,
  prontuariosTable,
  evolucoesTable,
  frequenciasTable,
} from "@workspace/db";

type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cur += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  cells.push(cur);
  return cells;
}

async function readCsv(filePath: string): Promise<CsvRow[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const row: CsvRow = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

function asNullableText(value: string | undefined): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

function asInt(value: string | undefined): number {
  return Number.parseInt((value ?? "").trim(), 10);
}

function asBool(value: string | undefined): boolean {
  return (value ?? "").trim().toLowerCase() === "true";
}

function asTimestamp(value: string | undefined): Date | null {
  const txt = asNullableText(value);
  if (!txt) return null;
  const d = new Date(txt);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run seed.");
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, "..", "..");
  const backupDir = path.join(repoRoot, "backup");

  const [
    usuariosCsv,
    idososCsv,
    agendamentosCsv,
    prontuariosCsv,
    evolucoesCsv,
    frequenciasCsv,
  ] = await Promise.all([
    readCsv(path.join(backupDir, "usuarios.csv")),
    readCsv(path.join(backupDir, "idosos.csv")),
    readCsv(path.join(backupDir, "agendamentos.csv")),
    readCsv(path.join(backupDir, "prontuarios.csv")),
    readCsv(path.join(backupDir, "evolucoes.csv")),
    readCsv(path.join(backupDir, "frequencias.csv")),
  ]);

  await db.execute(sql`
    TRUNCATE TABLE
      frequencias,
      evolucoes,
      prontuarios,
      agendamentos,
      idosos,
      usuarios
    RESTART IDENTITY CASCADE
  `);

  if (usuariosCsv.length) {
    await db.insert(usuariosTable).values(
      usuariosCsv.map((row) => ({
        id: asInt(row["id"]),
        nome: row["nome"],
        email: row["email"],
        senha: row["senha"],
        iniciais: row["iniciais"],
        papel: row["papel"] || "aluno",
        matricula: asNullableText(row["matricula"]),
        turma: asNullableText(row["turma"]),
        criadoEm: asTimestamp(row["criado_em"]) ?? undefined,
      })),
    );
  }

  if (idososCsv.length) {
    await db.insert(idososTable).values(
      idososCsv.map((row) => ({
        id: asInt(row["id"]),
        nome: row["nome"],
        dataNascimento: row["data_nascimento"],
        sexo: row["sexo"],
        cpf: row["cpf"],
        telefone: row["telefone"],
        bairro: row["bairro"],
        rua: row["rua"],
        numero: row["numero"],
        cidade: row["cidade"],
        estado: row["estado"],
        cep: row["cep"],
        status: row["status"] || "ativo",
        responsavelNome: row["responsavel_nome"],
        responsavelTelefone: row["responsavel_telefone"],
        responsavelParentesco: row["responsavel_parentesco"],
        observacoes: asNullableText(row["observacoes"]),
        criadoEm: asTimestamp(row["criado_em"]) ?? undefined,
      })),
    );
  }

  if (agendamentosCsv.length) {
    await db.insert(agendamentosTable).values(
      agendamentosCsv.map((row) => ({
        id: asInt(row["id"]),
        idosoId: asInt(row["idoso_id"]),
        alunoId: asInt(row["aluno_id"]),
        data: row["data"],
        hora: row["hora"],
        tipo: row["tipo"],
        status: row["status"] || "agendado",
        observacoes: asNullableText(row["observacoes"]),
        criadoEm: asTimestamp(row["criado_em"]) ?? undefined,
      })),
    );
  }

  if (prontuariosCsv.length) {
    await db.insert(prontuariosTable).values(
      prontuariosCsv.map((row) => ({
        id: asInt(row["id"]),
        idosoId: asInt(row["idoso_id"]),
        tipo: row["tipo"],
        descricao: row["descricao"],
        responsavel: row["responsavel"],
        data: row["data"],
        hora: row["hora"],
        observacoes: asNullableText(row["observacoes"]),
        criadoEm: asTimestamp(row["criado_em"]) ?? undefined,
      })),
    );
  }

  if (evolucoesCsv.length) {
    await db.insert(evolucoesTable).values(
      evolucoesCsv.map((row) => ({
        id: asInt(row["id"]),
        idosoId: asInt(row["idoso_id"]),
        data: row["data"],
        peso: asNullableText(row["peso"]),
        pressaoSistolica: asNullableText(row["pressao_sistolica"])
          ? asInt(row["pressao_sistolica"])
          : null,
        pressaoDiastolica: asNullableText(row["pressao_diastolica"])
          ? asInt(row["pressao_diastolica"])
          : null,
        frequenciaCardiaca: asNullableText(row["frequencia_cardiaca"])
          ? asInt(row["frequencia_cardiaca"])
          : null,
        glicemia: asNullableText(row["glicemia"]) ? asInt(row["glicemia"]) : null,
        mobilidade: asNullableText(row["mobilidade"]),
        humor: asNullableText(row["humor"]),
        observacoes: asNullableText(row["observacoes"]),
        registradoPor: row["registrado_por"],
        criadoEm: asTimestamp(row["criado_em"]) ?? undefined,
      })),
    );
  }

  if (frequenciasCsv.length) {
    await db.insert(frequenciasTable).values(
      frequenciasCsv.map((row) => ({
        id: asInt(row["id"]),
        alunoId: asInt(row["aluno_id"]),
        data: row["data"],
        presente: asBool(row["presente"]),
        tipoAtividade: row["tipo_atividade"],
        observacoes: asNullableText(row["observacoes"]),
        registradoPor: row["registrado_por"],
        criadoEm: asTimestamp(row["criado_em"]) ?? undefined,
      })),
    );
  }

  await db.execute(sql`
    SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
    SELECT setval('idosos_id_seq', COALESCE((SELECT MAX(id) FROM idosos), 1), true);
    SELECT setval('agendamentos_id_seq', COALESCE((SELECT MAX(id) FROM agendamentos), 1), true);
    SELECT setval('prontuarios_id_seq', COALESCE((SELECT MAX(id) FROM prontuarios), 1), true);
    SELECT setval('evolucoes_id_seq', COALESCE((SELECT MAX(id) FROM evolucoes), 1), true);
    SELECT setval('frequencias_id_seq', COALESCE((SELECT MAX(id) FROM frequencias), 1), true);
  `);

  console.log("Seed concluido com sucesso:");
  console.log(`- usuarios: ${usuariosCsv.length}`);
  console.log(`- idosos: ${idososCsv.length}`);
  console.log(`- agendamentos: ${agendamentosCsv.length}`);
  console.log(`- prontuarios: ${prontuariosCsv.length}`);
  console.log(`- evolucoes: ${evolucoesCsv.length}`);
  console.log(`- frequencias: ${frequenciasCsv.length}`);
}

main()
  .catch((err) => {
    console.error("Falha no seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
