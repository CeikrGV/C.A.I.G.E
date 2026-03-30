import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usuariosTable, prontuariosTable, agendamentosTable, frequenciasTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/desempenho", async (req, res) => {
  try {
    const alunos = await db.select().from(usuariosTable).then(rows => rows.filter(r => r.papel === "aluno"));
    const prontuarios = await db.select().from(prontuariosTable);
    const agendamentos = await db.select().from(agendamentosTable);
    const frequencias = await db.select().from(frequenciasTable);

    const resultado = alunos.map(aluno => {
      const prontsAluno = prontuarios.filter(p => p.responsavel === aluno.nome);
      const agendsAluno = agendamentos.filter(a => a.alunoId === aluno.id);
      const freqsAluno = frequencias.filter(f => f.alunoId === aluno.id);
      const presentes = freqsAluno.filter(f => f.presente).length;
      const totalFreqs = freqsAluno.length;

      return {
        id: aluno.id,
        nome: aluno.nome,
        matricula: aluno.matricula,
        turma: aluno.turma,
        totalProntuarios: prontsAluno.length,
        totalAgendamentos: agendsAluno.length,
        agendamentosConcluidos: agendsAluno.filter(a => a.status === "concluido").length,
        totalPresencas: presentes,
        totalFaltas: totalFreqs - presentes,
        percentualPresenca: totalFreqs > 0 ? Math.round((presentes / totalFreqs) * 100) : 0,
      };
    });

    res.json(resultado);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/desempenho/:alunoId", async (req, res) => {
  try {
    const alunoId = parseInt(req.params.alunoId);
    const [aluno] = await db.select().from(usuariosTable).where(eq(usuariosTable.id, alunoId)).limit(1);
    if (!aluno) { res.status(404).json({ error: "Aluno não encontrado" }); return; }

    const prontuarios = await db.select().from(prontuariosTable).then(rows => rows.filter(p => p.responsavel === aluno.nome));
    const agendamentos = await db.select().from(agendamentosTable).then(rows => rows.filter(a => a.alunoId === alunoId));
    const frequencias = await db.select().from(frequenciasTable).then(rows => rows.filter(f => f.alunoId === alunoId));

    const tiposAtendimento: Record<string, number> = {};
    prontuarios.forEach(p => { tiposAtendimento[p.tipo] = (tiposAtendimento[p.tipo] ?? 0) + 1; });

    const evolucaoMensal: Record<string, number> = {};
    prontuarios.forEach(p => {
      const mes = p.data.slice(0, 7);
      evolucaoMensal[mes] = (evolucaoMensal[mes] ?? 0) + 1;
    });

    res.json({
      aluno: { id: aluno.id, nome: aluno.nome, matricula: aluno.matricula, turma: aluno.turma },
      totalProntuarios: prontuarios.length,
      tiposAtendimento,
      evolucaoMensal,
      agendamentos: agendamentos.length,
      agendamentosConcluidos: agendamentos.filter(a => a.status === "concluido").length,
      frequencias: frequencias.length,
      presencas: frequencias.filter(f => f.presente).length,
      faltas: frequencias.filter(f => !f.presente).length,
      percentualPresenca: frequencias.length > 0 ? Math.round((frequencias.filter(f => f.presente).length / frequencias.length) * 100) : 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
