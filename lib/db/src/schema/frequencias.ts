import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const frequenciasTable = pgTable("frequencias", {
  id: serial("id").primaryKey(),
  alunoId: integer("aluno_id").notNull(),
  data: text("data").notNull(),
  presente: boolean("presente").notNull().default(true),
  tipoAtividade: text("tipo_atividade").notNull(),
  observacoes: text("observacoes"),
  registradoPor: text("registrado_por").notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertFrequenciaSchema = createInsertSchema(frequenciasTable).omit({ id: true, criadoEm: true });
export type InsertFrequencia = z.infer<typeof insertFrequenciaSchema>;
export type Frequencia = typeof frequenciasTable.$inferSelect;
