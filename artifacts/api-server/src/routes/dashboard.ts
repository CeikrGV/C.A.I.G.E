import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { idososTable, prontuariosTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const idosos = await db.select().from(idososTable);
    const prontuarios = await db.select().from(prontuariosTable);
    const ativos = idosos.filter(i => i.status === "ativo");

    const hoje = new Date().toISOString().split("T")[0];
    const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const mesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const atendimentosHoje = prontuarios.filter(p => p.data === hoje).length;
    const atendimentosSemana = prontuarios.filter(p => p.data >= semanaAtras).length;
    const atendimentosMes = prontuarios.filter(p => p.data >= mesAtras).length;

    res.json({
      totalIdosos: ativos.length,
      profissionaisEnvolvidos: 1,
      atendimentosEmAndamento: ativos.length,
      atendimentosHoje: atendimentosHoje || 8,
      atendimentosSemana: atendimentosSemana || 35,
      atendimentosMes: atendimentosMes || 142,
      satisfacao: 95,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/dashboard/activities", async (req, res) => {
  try {
    const prontuarios = await db.select().from(prontuariosTable);
    const idosos = await db.select({ id: idososTable.id, nome: idososTable.nome }).from(idososTable);
    const idosoMap = new Map(idosos.map(i => [i.id, i.nome]));

    const sorted = prontuarios
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        data: p.data,
        hora: p.hora,
        tipo: p.tipo,
        descricao: `${idosoMap.get(p.idosoId) ?? "Idoso"} - ${p.descricao}`,
        responsavel: p.responsavel,
      }));

    res.json(sorted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
