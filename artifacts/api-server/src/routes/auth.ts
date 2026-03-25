import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usuariosTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email)).limit(1);

    if (!user.length || user[0].senha !== senha) {
      res.status(401).json({ error: "E-mail ou senha incorretos" });
      return;
    }

    const u = user[0];
    res.json({ id: u.id, nome: u.nome, email: u.email, iniciais: u.iniciais });
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
  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  try {
    const user = await db.select().from(usuariosTable).where(eq(usuariosTable.id, parseInt(userId as string))).limit(1);
    if (!user.length) {
      res.status(401).json({ error: "Usuário não encontrado" });
      return;
    }
    const u = user[0];
    res.json({ id: u.id, nome: u.nome, email: u.email, iniciais: u.iniciais });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
