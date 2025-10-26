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

---

## 🔧 Comandos Úteis

```bash
# Executar em modo desenvolvimento
npm run dev

# Gerar build de produção
npm run build

# Iniciar build em produção
npm run start
```

---

## 📝 Observações

- Projeto em constante desenvolvimento; novas funcionalidades podem ser adicionadas.  
- Compatibilidade de QR Code depende do navegador.  
- Criado exclusivamente para **fins acadêmicos**.  

---

📚 **Desenvolvido com dedicação para a disciplina _Certificadora 3_.**
