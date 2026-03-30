import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usuariosTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatUser(u: typeof usuariosTable.$inferSelect) {
  return { id: u.id, nome: u.nome, email: u.email, iniciais: u.iniciais, papel: u.papel, matricula: u.matricula, turma: u.turma };
}

router.post("/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);
    if (!user.length || user[0].senha !== senha) {
      res.status(401).json({ error: "E-mail ou senha incorretos" });
      return;
    }
    res.json(formatUser(user[0]));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Dados inválidos" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) { res.status(401).json({ error: "Não autenticado" }); return; }
  try {
    const user = await db.select().from(usuariosTable).where(eq(usuariosTable.id, parseInt(userId as string))).limit(1);
    if (!user.length) { res.status(401).json({ error: "Usuário não encontrado" }); return; }
    res.json(formatUser(user[0]));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/usuarios", async (req, res) => {
  try {
    const users = await db.select().from(usuariosTable);
    res.json(users.map(formatUser));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha, papel, matricula, turma } = req.body;
    const iniciais = nome.trim().split(" ").filter(Boolean).slice(0, 2).map((p: string) => p[0].toUpperCase()).join("");
    const [created] = await db.insert(usuariosTable).values({ nome, email, senha, iniciais, papel: papel ?? "aluno", matricula, turma }).returning();
    res.status(201).json(formatUser(created));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao criar usuário" });
  }
});

router.put("/usuarios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { papel, turma } = req.body;
    const [updated] = await db.update(usuariosTable).set({ papel, turma }).where(eq(usuariosTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Não encontrado" }); return; }
    res.json(formatUser(updated));
  } catch (err) {
    req.log.error(err);
    res.status(400).json({ error: "Erro ao atualizar" });
  }
});

export default router;
