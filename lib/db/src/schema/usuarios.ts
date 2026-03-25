import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usuariosTable = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  iniciais: text("iniciais").notNull(),
  papel: text("papel").notNull().default("aluno"),
  matricula: text("matricula"),
  turma: text("turma"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertUsuarioSchema = createInsertSchema(usuariosTable).omit({ id: true, criadoEm: true });
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuariosTable.$inferSelect;
