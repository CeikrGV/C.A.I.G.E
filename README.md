# CAIGE - Sistema de Gestão para Clínica 

O **CAIGE** é uma aplicação web desenvolvida para gerenciar o cadastro de pacientes, prontuários, agendamentos e controle de frequência. Criado com foco na usabilidade de alunos e professores da Univale.

## 🚀 Tecnologias Utilizadas

* **Frontend:** React, TypeScript, Tailwind CSS, Vite
* **Backend:** Node.js, Express
* **Banco de Dados:** PostgreSQL (Hospedado no Neon.tech)
* **ORM:** Drizzle ORM

## ⚙️ Como rodar o projeto localmente

1. Clone este repositório:
```bash
   git clone https://github.com/CeikrGV/C.A.I.G.E
```
2. Instale as dependências:
```bash
pnpm install
```
3. Inicie o servidor (Frontend + Backend) com a variável do banco de dados:
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_Kb7YjvXzwyk8@ep-snowy-math-amn82qh5.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
pnpm dev:all
```
4. Acesse o sistema pelo navegador:

* Frontend: http://localhost:5173

* Backend (API): http://localhost:3001

👥 Perfis de Acesso
O sistema possui controle de rotas e visibilidade baseado no perfil do usuário:

* Professor: Acesso total a painéis de gestão, visualização de todos os alunos e controle completo de prontuários.

* Aluno: Acesso focado no registro de atividades, agenda própria e gerenciamento de pacientes vinculados.

🔐 Credenciais de Teste
Para acessar e avaliar o sistema no ambiente de desenvolvimento, utilize as credenciais padrão geradas pelo script de seed:

Acesso Professor (Visão Completa):

* E-mail: caige@univale.br
* Senha: caige123

Acesso Aluno (Visão Limitada):

* E-mail: joao.pedro@univale.br
* Senha: aluno123

(Nota de Segurança: Estas credenciais são exclusivas para o banco de dados de desenvolvimento local. O sistema não utiliza essas senhas em ambiente de produção).