---

<div align="center">

# 📄🤖 DocuMind

### Transformando documentos em conhecimento com Inteligência Artificial

<img src="https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk" />
<img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite" />
<img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/PgVector-Vector%20Database-4B8BBE?style=for-the-badge" />
<img src="https://img.shields.io/badge/OpenAI-GPT--4o-10A37F?style=for-the-badge&logo=openai" />
<img src="https://img.shields.io/badge/LangChain4j-AI-blueviolet?style=for-the-badge" />

<br><br>

> **Uma plataforma Full Stack para leitura inteligente de documentos utilizando IA Generativa, RAG (Retrieval-Augmented Generation) e Banco Vetorial.**

</div>

---

# 🚀 Executando o Projeto

## 📥 1. Clone o Repositório

```bash
git clone https://github.com/SEU-USUARIO/DocuMind.git

cd DocuMind
```

---

## 🐳 2. Inicie o Banco de Dados

Abra o Docker Desktop e execute:

```bash
docker compose up -d
```

O PostgreSQL iniciará automaticamente com a extensão **PgVector** instalada.

```
Host............. localhost
Porta............ 5432
Banco............ documind_db
```

---

## ☕ 3. Execute o Backend

### Linux / macOS

```bash
./mvnw spring-boot:run
```

### Windows

```bash
mvnw.cmd spring-boot:run
```

Servidor disponível em:

```
http://localhost:8080
```

---

## ⚛️ 4. Execute o Frontend

Abra outro terminal:

```bash
cd documind-frontend

npm install

npm run dev
```

Aplicação disponível em:

```
http://localhost:5173
```

---

# ⚙️ Configuração

## application.properties

```properties
spring.application.name=DocuMind

server.port=8080

####################################################
# PostgreSQL
####################################################

spring.datasource.url=jdbc:postgresql://localhost:5432/documind_db
spring.datasource.username=documind_user
spring.datasource.password=documind_password

####################################################
# Hibernate
####################################################

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

####################################################
# OpenAI
####################################################

openai.api.key=${OPENAI_API_KEY}

openai.chat-model.name=gpt-4o

openai.embedding-model.name=text-embedding-ada-002

####################################################
# PgVector
####################################################

langchain4j.vector-store.pgvector.host=localhost
langchain4j.vector-store.pgvector.port=5432
langchain4j.vector-store.pgvector.database=documind_db
langchain4j.vector-store.pgvector.dimension=1536
```

---

# 🔑 Variável de Ambiente

Crie uma variável de ambiente chamada:

```text
OPENAI_API_KEY
```

Ela deve conter sua chave da API da OpenAI.

---

# 🔒 Segurança

> [!WARNING]
> **Nunca faça commit da sua chave da OpenAI no GitHub.**

Adicione ao seu `.gitignore`:

```gitignore
.env

.env.local

application-local.properties

*.key
```

---

# 📋 Pré-requisitos

| Tecnologia | Versão |
|------------|---------|
| ☕ Java | 21+ |
| 📦 Maven | 3.9+ |
| 🐳 Docker | Última |
| 🐘 PostgreSQL | 16+ |
| ⚛️ Node.js | 20+ |
| 📦 npm | Atual |
| 🤖 OpenAI API Key | Obrigatória |

---

# 📈 Fluxo da Aplicação

```text
                 👤 Usuário
                     │
                     ▼
             Upload do Documento
                     │
                     ▼
         Extração e Fragmentação
                     │
                     ▼
          Geração dos Embeddings
                     │
                     ▼
     Armazenamento no PgVector
                     │
                     ▼
        Busca Semântica (RAG)
                     │
                     ▼
            GPT-4o responde
                     │
                     ▼
             Interface React
```

---

# 🏗️ Arquitetura

```text
                 React + Vite
                      │
                HTTP REST API
                      │
               Spring Boot API
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
 PostgreSQL       PgVector        OpenAI API
      │               │               │
      └───────────────┴───────────────┘
                LangChain4j
```

---

# 🛠️ Tecnologias

- ☕ Java 21
- 🌱 Spring Boot
- 🔐 Spring Security
- 🐘 PostgreSQL
- 📚 PgVector
- 🤖 OpenAI API
- 🧠 LangChain4j
- ⚛️ React
- ⚡ Vite
- 🐳 Docker
- 📦 Maven

---

# 🤝 Conecte-se Comigo

<div align="center">

## 👨‍💻 Mikhael Soel

**Software Engineer • Java Developer • AI Enthusiast**

<br>

<a href="https://linkedin.com/in/seu-perfil">
<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin"/>
</a>

<a href="https://github.com/seu-usuario">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github"/>
</a>

<a href="mailto:seu.email@exemplo.com">
<img src="https://img.shields.io/badge/E--mail-D14836?style=for-the-badge&logo=gmail"/>
</a>

</div>

---

<div align="center">

## ⭐ Gostou do projeto?

Se este projeto foi útil para você, considere deixar uma ⭐ no repositório.

Isso ajuda outras pessoas a encontrarem o projeto e incentiva o desenvolvimento contínuo.

<br>

### Desenvolvido com ❤️, ☕ Java, Spring Boot, React, LangChain4j e Inteligência Artificial.

</div>

---
