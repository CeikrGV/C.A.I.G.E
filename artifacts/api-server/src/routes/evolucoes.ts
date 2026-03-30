import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { evolucoesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/evolucoes", async (req, res) => {
  try {
    const { idosoId } = req.query as { idosoId?: string };
    let rows = await db.select().from(evolucoesTable);
    if (idosoId) rows = rows.filter(r => r.idosoId === parseInt(idosoId));
    rows = rows.sort((a, b) => a.data.localeCompare(b.data));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/evolucoes", async (req, res) => {
  try {
    const data = req.body;
    const [created] = await db.insert(evolucoesTable).values({
      idosoId: data.idosoId,
      data: data.data,
      peso: data.peso ?? null,
      pressaoSistolica: data.pressaoSistolica ?? null,
      pressaoDiastolica: data.pressaoDiastolica ?? null,
      frequenciaCardiaca: data.frequenciaCardiaca ?? null,
      glicemia: data.glicemia ?? null,
      mobilidade: data.mobilidade ?? null,
      humor: data.humor ?? null,
      observacoes: data.observacoes ?? null,
      registradoPor: data.registradoPor ?? "Sistema",
    }).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao registrar evolução" });
  }
});

router.delete("/evolucoes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(evolucoesTable).where(eq(evolucoesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
