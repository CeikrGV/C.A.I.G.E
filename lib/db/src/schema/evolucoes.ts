import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const evolucoesTable = pgTable("evolucoes", {
  id: serial("id").primaryKey(),
  idosoId: integer("idoso_id").notNull(),
  data: text("data").notNull(),
  peso: numeric("peso", { precision: 5, scale: 2 }),
  pressaoSistolica: integer("pressao_sistolica"),
  pressaoDiastolica: integer("pressao_diastolica"),
  frequenciaCardiaca: integer("frequencia_cardiaca"),
  glicemia: integer("glicemia"),
  mobilidade: text("mobilidade"),
  humor: text("humor"),
  observacoes: text("observacoes"),
  registradoPor: text("registrado_por").notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertEvolucaoSchema = createInsertSchema(evolucoesTable).omit({ id: true, criadoEm: true });
export type InsertEvolucao = z.infer<typeof insertEvolucaoSchema>;
export type Evolucao = typeof evolucoesTable.$inferSelect;
