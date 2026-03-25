import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prontuariosTable = pgTable("prontuarios", {
  id: serial("id").primaryKey(),
  idosoId: integer("idoso_id").notNull(),
  tipo: text("tipo").notNull(),
  descricao: text("descricao").notNull(),
  responsavel: text("responsavel").notNull(),
  data: text("data").notNull(),
  hora: text("hora").notNull(),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertProntuarioSchema = createInsertSchema(prontuariosTable).omit({ id: true, criadoEm: true });
export type InsertProntuario = z.infer<typeof insertProntuarioSchema>;
export type Prontuario = typeof prontuariosTable.$inferSelect;
