import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { agendamentosTable, idososTable, usuariosTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function enrichAgendamento(a: typeof agendamentosTable.$inferSelect) {
  const idoso = await db.select({ nome: idososTable.nome }).from(idososTable).where(eq(idososTable.id, a.idosoId)).limit(1);
  const aluno = await db.select({ nome: usuariosTable.nome }).from(usuariosTable).where(eq(usuariosTable.id, a.alunoId)).limit(1);
  return {
    ...a,
    idosoNome: idoso[0]?.nome ?? "Idoso",
    alunoNome: aluno[0]?.nome ?? "Aluno",
  };
}

router.get("/agendamentos", async (req, res) => {
  try {
    const { alunoId, data } = req.query as { alunoId?: string; data?: string };
    let rows = await db.select().from(agendamentosTable);
    if (alunoId) rows = rows.filter(r => r.alunoId === parseInt(alunoId));
    if (data) rows = rows.filter(r => r.data === data);
    rows = rows.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
    const enriched = await Promise.all(rows.map(enrichAgendamento));
    res.json(enriched);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/agendamentos", async (req, res) => {
  try {
    const data = req.body;
    const [created] = await db.insert(agendamentosTable).values({
      idosoId: data.idosoId,
      alunoId: data.alunoId,
      data: data.data,
      hora: data.hora,
      tipo: data.tipo,
      status: data.status ?? "agendado",
      observacoes: data.observacoes ?? null,
    }).returning();
    res.status(201).json(await enrichAgendamento(created));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao criar agendamento" });
  }
});

router.put("/agendamentos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const [updated] = await db.update(agendamentosTable).set({
      status: data.status,
      observacoes: data.observacoes,
      hora: data.hora,
      data: data.data,
      tipo: data.tipo,
    }).where(eq(agendamentosTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(await enrichAgendamento(updated));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao atualizar" });
  }
});

router.delete("/agendamentos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(agendamentosTable).where(eq(agendamentosTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
