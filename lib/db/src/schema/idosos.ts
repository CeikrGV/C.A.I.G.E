import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const idososTable = pgTable("idosos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  dataNascimento: text("data_nascimento").notNull(),
  sexo: text("sexo").notNull(),
  cpf: text("cpf").notNull(),
  telefone: text("telefone").notNull(),
  bairro: text("bairro").notNull(),
  rua: text("rua").notNull(),
  numero: text("numero").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  cep: text("cep").notNull(),
  status: text("status").notNull().default("ativo"),
  responsavelNome: text("responsavel_nome").notNull(),
  responsavelTelefone: text("responsavel_telefone").notNull(),
  responsavelParentesco: text("responsavel_parentesco").notNull(),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertIdosoSchema = createInsertSchema(idososTable).omit({ id: true, criadoEm: true });
export type InsertIdoso = z.infer<typeof insertIdosoSchema>;
export type Idoso = typeof idososTable.$inferSelect;
