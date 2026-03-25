import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { idososTable, prontuariosTable } from "@workspace/db/schema";
import { eq, ilike, or } from "drizzle-orm";

const router: IRouter = Router();

function calcIdade(dataNascimento: string): number {
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function getIniciais(nome: string): string {
  const parts = nome.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function formatIdoso(i: typeof idososTable.$inferSelect) {
  return {
    id: i.id,
    nome: i.nome,
    idade: calcIdade(i.dataNascimento),
    dataNascimento: i.dataNascimento,
    sexo: i.sexo,
    cpf: i.cpf,
    telefone: i.telefone,
    bairro: i.bairro,
    rua: i.rua,
    numero: i.numero,
    cidade: i.cidade,
    estado: i.estado,
    cep: i.cep,
    status: i.status,
    responsavelNome: i.responsavelNome,
    responsavelTelefone: i.responsavelTelefone,
    responsavelParentesco: i.responsavelParentesco,
    observacoes: i.observacoes,
    cadastro: i.criadoEm.toISOString().split("T")[0],
    iniciais: getIniciais(i.nome),
  };
}

router.get("/idosos", async (req, res) => {
  try {
    const { search, status } = req.query as { search?: string; status?: string };
    let rows = await db.select().from(idososTable);
    if (status) rows = rows.filter(r => r.status === status);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(r => r.nome.toLowerCase().includes(s) || r.bairro.toLowerCase().includes(s));
    }
    res.json(rows.map(formatIdoso));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/idosos", async (req, res) => {
  try {
    const data = req.body;
    const [created] = await db.insert(idososTable).values({
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      sexo: data.sexo,
      cpf: data.cpf,
      telefone: data.telefone,
      bairro: data.bairro,
      rua: data.rua,
      numero: data.numero,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      status: data.status ?? "ativo",
      responsavelNome: data.responsavelNome,
      responsavelTelefone: data.responsavelTelefone,
      responsavelParentesco: data.responsavelParentesco,
      observacoes: data.observacoes ?? null,
    }).returning();
    res.status(201).json(formatIdoso(created));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao cadastrar" });
  }
});

router.get("/idosos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(idososTable).where(eq(idososTable.id, id)).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(formatIdoso(rows[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/idosos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const [updated] = await db.update(idososTable).set({
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      sexo: data.sexo,
      cpf: data.cpf,
      telefone: data.telefone,
      bairro: data.bairro,
      rua: data.rua,
      numero: data.numero,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      status: data.status,
      responsavelNome: data.responsavelNome,
      responsavelTelefone: data.responsavelTelefone,
      responsavelParentesco: data.responsavelParentesco,
      observacoes: data.observacoes ?? null,
    }).where(eq(idososTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(formatIdoso(updated));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao atualizar" });
  }
});

router.delete("/idosos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(idososTable).where(eq(idososTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
