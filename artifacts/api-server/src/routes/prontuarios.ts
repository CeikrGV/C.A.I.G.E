import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { prontuariosTable, idososTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function formatProntuario(p: typeof prontuariosTable.$inferSelect) {
  const idoso = await db.select({ nome: idososTable.nome }).from(idososTable).where(eq(idososTable.id, p.idosoId)).limit(1);
  return {
    id: p.id,
    idosoId: p.idosoId,
    idosoNome: idoso[0]?.nome ?? "Desconhecido",
    tipo: p.tipo,
    descricao: p.descricao,
    responsavel: p.responsavel,
    data: p.data,
    hora: p.hora,
    observacoes: p.observacoes,
  };
}

router.get("/prontuarios", async (req, res) => {
  try {
    const { idosoId } = req.query as { idosoId?: string };
    let rows = await db.select().from(prontuariosTable);
    if (idosoId) rows = rows.filter(r => r.idosoId === parseInt(idosoId));
    const result = await Promise.all(rows.map(formatProntuario));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/prontuarios", async (req, res) => {
  try {
    const data = req.body;
    const [created] = await db.insert(prontuariosTable).values({
      idosoId: data.idosoId,
      tipo: data.tipo,
      descricao: data.descricao,
      responsavel: data.responsavel,
      data: data.data,
      hora: data.hora,
      observacoes: data.observacoes ?? null,
    }).returning();
    res.status(201).json(await formatProntuario(created));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao criar" });
  }
});

router.get("/prontuarios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.select().from(prontuariosTable).where(eq(prontuariosTable.id, id)).limit(1);
    if (!rows.length) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(await formatProntuario(rows[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.put("/prontuarios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const [updated] = await db.update(prontuariosTable).set({
      idosoId: data.idosoId,
      tipo: data.tipo,
      descricao: data.descricao,
      responsavel: data.responsavel,
      data: data.data,
      hora: data.hora,
      observacoes: data.observacoes ?? null,
    }).where(eq(prontuariosTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(await formatProntuario(updated));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao atualizar" });
  }
});

router.delete("/prontuarios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(prontuariosTable).where(eq(prontuariosTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
