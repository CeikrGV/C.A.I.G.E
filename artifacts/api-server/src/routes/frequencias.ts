import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { frequenciasTable, usuariosTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/frequencias", async (req, res) => {
  try {
    const { alunoId } = req.query as { alunoId?: string };
    let rows = await db.select().from(frequenciasTable);
    if (alunoId) rows = rows.filter(r => r.alunoId === parseInt(alunoId));
    rows = rows.sort((a, b) => b.data.localeCompare(a.data));

    const alunos = await db.select({ id: usuariosTable.id, nome: usuariosTable.nome }).from(usuariosTable);
    const alunoMap = new Map(alunos.map(a => [a.id, a.nome]));

    res.json(rows.map(r => ({ ...r, alunoNome: alunoMap.get(r.alunoId) ?? "Aluno" })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/frequencias", async (req, res) => {
  try {
    const data = req.body;
    if (Array.isArray(data)) {
      const created = await db.insert(frequenciasTable).values(data.map(d => ({
        alunoId: d.alunoId,
        data: d.data,
        presente: d.presente ?? true,
        tipoAtividade: d.tipoAtividade,
        observacoes: d.observacoes ?? null,
        registradoPor: d.registradoPor ?? "Sistema",
      }))).returning();
      res.status(201).json(created);
    } else {
      const [created] = await db.insert(frequenciasTable).values({
        alunoId: data.alunoId,
        data: data.data,
        presente: data.presente ?? true,
        tipoAtividade: data.tipoAtividade,
        observacoes: data.observacoes ?? null,
        registradoPor: data.registradoPor ?? "Sistema",
      }).returning();
      res.status(201).json(created);
    }
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao registrar frequência" });
  }
});

export default router;
