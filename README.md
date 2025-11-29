# 🎓 Certificadora3

> **Sistema de Gestão de Palestras e Certificados**  
> Projeto acadêmico desenvolvido para a disciplina **Certificadora 3**, com o objetivo de facilitar o gerenciamento de eventos, inscrições, controle de presença e emissão de certificados digitais.

---

## 🧭 Sumário
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Stack & Versões](#-stack--versões)
- [Instalação (Windows)](#-instalação-windows)
- [Instalação (Linux)](#-instalação-linux)
- [Como Executar Localmente](#️-como-executar-localmente)
- [Comandos Úteis](#-comandos-úteis)
- [Dicas de Teste](#-dicas-de-teste)
- [Deploy](#-deploy)
- [Observações](#-observações)

---

## ✨ Funcionalidades

- 📅 **Cadastro e gerenciamento** de palestras  
- 🧑‍🤝‍🧑 **Inscrição** de participantes  
- ✅ **Controle de presença**  
- 🎓 **Emissão de certificados digitais**  
- 🧰 **Painel administrativo** para gestão de usuários e papéis  
- 🔗 **QR Code** para inscrição rápida  
- 🪪 **Modal de confirmação** ao acessar o QR Code  

---

## 💻 Tecnologias Utilizadas

- **Next.js** (React Framework)
- **Firebase Firestore**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- **qrcode.react**
- **NextAuth**
- **Radix UI Components**

---

## ⚙️ Stack & Versões

| Categoria | Pacote | Versão |
|------------|---------|---------|
| **Core** | next | ^14.2.3 |
|  | react | ^18 |
|  | react-dom | ^18 |
|  | typescript | ^5 |
| **UI / Estilo** | tailwindcss | ^3.4.18 |
|  | tailwindcss-animate | ^1.0.7 |
|  | clsx | ^2.1.1 |
|  | class-variance-authority | ^0.7.1 |
|  | tailwind-merge | ^3.3.1 |
|  | lucide-react | ^0.546.0 |
|  | qrcode.react | ^4.2.0 |
|  | @radix-ui/react-checkbox | ^1.3.3 |
|  | @radix-ui/react-label | ^2.1.7 |
|  | @radix-ui/react-select | ^2.2.6 |
|  | @radix-ui/react-slot | ^1.2.3 |
| **Outros** | firebase | ^12.4.0 |
|  | next-auth | ^4.24.11 |
|  | react-icons | ^5.5.0 |
|  | sonner | ^2.0.7 |

---

## 🪟 Instalação (Windows)

Baixe e instale as ferramentas:

- 🧰 [**Git**](https://git-scm.com/downloads)
- 💻 [**Node.js (LTS)**](https://nodejs.org/en/download)
- 📝 [**Visual Studio Code**](https://code.visualstudio.com/Download)

> **Opcional:** [GitHub Desktop](https://desktop.github.com/) para gerenciar commits graficamente.

Verifique as versões após a instalação:

```bash
node -v
npm -v
git --version
```

---

## 🐧 Instalação (Linux / Ubuntu)

```bash
# 1️⃣ Atualize o sistema
sudo apt update && sudo apt upgrade -y

# 2️⃣ Instale dependências básicas
sudo apt install -y git curl build-essential

# 3️⃣ Instale Node.js LTS via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Reinicie o terminal, então:
nvm install --lts
nvm use --lts

# 4️⃣ Verifique
node -v
npm -v
git --version
```

---

## 🧑‍💻️ Como Executar Localmente

### Opção 1: Execução Local (Sem Docker)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/certificadora3.git
cd certificadora3

# 2. Instale as dependências
npm install
```

### 🔑 Configuração do Firebase

Crie o arquivo `src/app/firebase/page.ts`:

```ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### ▶️ Execute o projeto

```bash
npm run dev
```

Acesse **http://localhost:3000/palestra** no navegador.

### Opção 2: Execução com Docker 🐳

#### Pré-requisitos
- Docker instalado no sistema
- Docker Compose (opcional, mas recomendado)

#### Instalação do Docker

**Linux (Ubuntu/Debian):**
```bash
# Instalar Docker
sudo apt update
sudo apt install -y docker.io docker-compose

# Adicionar usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Reinicie o sistema ou faça logout/login para aplicar as permissões
```

**Windows/Mac:**
- Baixe o [Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### Executar com Docker

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/certificadora3.git
cd certificadora3

# 2. Certifique-se de que o arquivo .env.local existe com as configurações do Firebase

# 3. Construir a imagem Docker
docker build -t projeto-certificadora3 .

# 4. Rodar o container
docker run -d -p 3000:3000 --env-file .env.local --name certificadora3-app projeto-certificadora3

# 5. Verificar se está rodando
docker ps

# 6. Ver logs em tempo real
docker logs -f certificadora3-app
```

#### Comandos Docker Úteis

```bash
# Parar o container
docker stop certificadora3-app

# Iniciar o container novamente
docker start certificadora3-app

# Remover o container
docker rm certificadora3-app

# Remover a imagem
docker rmi projeto-certificadora3

# Ver todos os containers (incluindo parados)
docker ps -a

# Entrar no container (para debug)
docker exec -it certificadora3-app sh

# Reconstruir após mudanças no código
docker stop certificadora3-app
docker rm certificadora3-app
docker build -t projeto-certificadora3 .
docker run -d -p 3000:3000 --env-file .env.local --name certificadora3-app projeto-certificadora3
```

#### Usando Docker Compose (Recomendado)

```bash
# Construir e iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reconstruir após mudanças
docker-compose up -d --build
```

> **📝 Nota:** O Docker usa o arquivo `.env.local` para as variáveis de ambiente. Certifique-se de configurá-lo antes de rodar os containers.

Acesse **http://localhost:3000** no navegador.

---

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Executar em modo desenvolvimento
npm run dev

# Gerar build de produção
npm run build

# Iniciar build em produção
npm run start
```

### Docker
```bash
# Construir imagem
docker build -t projeto-certificadora3 .

# Rodar container
docker run -d -p 3000:3000 --env-file .env.local --name certificadora3-app projeto-certificadora3

# Gerenciar containers
docker ps              # Ver containers rodando
docker logs -f certificadora3-app  # Ver logs
docker stop certificadora3-app     # Parar
docker start certificadora3-app    # Iniciar
docker rm certificadora3-app       # Remover

# Docker Compose
docker-compose up -d        # Iniciar
docker-compose down         # Parar e remover
docker-compose logs -f      # Ver logs
docker-compose up -d --build  # Reconstruir
```

---

## 🔑 Configuração do Google Authentication

### Passo 1: Configurar o Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs e Serviços" > "Credenciais"
4. Clique em "+ CRIAR CREDENCIAIS" > "ID do cliente OAuth 2.0"
5. Configure os seguintes campos:
   - **Tipo de aplicativo**: Aplicativo da Web
   - **Nome**: Meninas Digitais Auth
   - **URIs de origem autorizados**: 
     - `http://localhost:3000` (desenvolvimento)
     - `https://seudominio.com` (produção)
   - **URIs de redirecionamento autorizados**:
     - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
     - `https://seudominio.com/api/auth/callback/google` (produção)

6. Copie o **Client ID** e **Client Secret** gerados

### Passo 2: Configurar Firebase Admin SDK

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto `projetocertificadora3`
3. Vá para "Configurações do projeto" > "Contas de serviço"
4. Clique em "Gerar nova chave privada"
5. Baixe o arquivo JSON com as credenciais

### Passo 3: Configurar variáveis de ambiente

Edite o arquivo `.env.local` e adicione as seguintes variáveis:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua-chave-secreta-muito-forte-aqui

# Google OAuth (obtidos no Passo 1)
GOOGLE_CLIENT_ID=seu-google-client-id-aqui
GOOGLE_CLIENT_SECRET=seu-google-client-secret-aqui

# Firebase Admin SDK (obtidos do arquivo JSON no Passo 2)
FIREBASE_PROJECT_ID=projetocertificadora3
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@projetocertificadora3.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave privada aqui\n-----END PRIVATE KEY-----\n"
```

## 🎯 Sistema de Gestão de Usuários

### ✅ Como funciona:

1. **Primeiro usuário** que fizer login = **Administrador** (automaticamente)
2. **Todos os outros usuários** = **Participantes** (automaticamente)
3. **Administradores** podem alterar cargos através da interface web
4. **Removidos todos os dados simulados** - apenas usuários reais via Google

### 📍 Onde gerenciar usuários:

Após fazer login como administrador:
- **Dashboard**: http://localhost:3000/dashboard
- **Gestão de Usuários**: http://localhost:3000/admin/users
- **Palestras**: http://localhost:3000/palestra
- **Relatórios**: http://localhost:3000/relatorios

### 🔧 Cargos disponíveis:

- **👑 Administrador**: Acesso total + gestão de usuários
- **🎯 Organizador**: Gerencia palestras + relatórios
- **🎤 Palestrante**: Cria e gerencia suas palestras
- **👤 Participante**: Inscreve-se em palestras + certificados

### 🗃️ Onde ficam os dados:

- **Firebase Firestore**
- **Coleção**: `users`
- **Campos**: `name`, `email`, `role`, `image`, `createdAt`, `updatedAt`

---

## 📝 Observações

- Projeto em constante desenvolvimento; novas funcionalidades podem ser adicionadas.  
- Compatibilidade de QR Code depende do navegador.  
- Criado exclusivamente para **fins acadêmicos**.  

---

📚 **Desenvolvido com dedicação para a disciplina _Certificadora 3_.**

# Link do video de como instalar as ferramentas: https://youtu.be/DMZd5TtsKzM
