import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agendamentosTable = pgTable("agendamentos", {
  id: serial("id").primaryKey(),
  idosoId: integer("idoso_id").notNull(),
  alunoId: integer("aluno_id").notNull(),
  data: text("data").notNull(),
  hora: text("hora").notNull(),
  tipo: text("tipo").notNull(),
  status: text("status").notNull().default("agendado"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertAgendamentoSchema = createInsertSchema(agendamentosTable).omit({ id: true, criadoEm: true });
export type InsertAgendamento = z.infer<typeof insertAgendamentoSchema>;
export type Agendamento = typeof agendamentosTable.$inferSelect;
