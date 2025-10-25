# Certificadora3

Sistema de Gestão de Palestras e Certificados

Este projeto foi desenvolvido para a disciplina de Certificadora 3 e tem como objetivo facilitar o gerenciamento de eventos, inscrições, controle de presença e emissão de certificados digitais.

## Funcionalidades

- Cadastro e gerenciamento de palestras
- Inscrição de participantes em palestras
- Controle de presença dos inscritos
- Emissão de certificados digitais para participantes presentes
- Painel administrativo para gestão de usuários e papéis
- Geração de QR Code para inscrição rápida
- Modal de confirmação de inscrição ao acessar o QR Code

## Tecnologias Utilizadas

- Next.js (React)
- Firebase Firestore
- TypeScript
- Tailwind CSS
- Lucide Icons
- qrcode.react

## Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/certificadora3.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o Firebase (adicione suas credenciais em `src/app/firebase/page.ts`)
4. Execute o projeto:
   ```bash
   npm run dev
   ```
5. Acesse `http://localhost:3000/palestra` no navegador.

## Observações
- Para testar o QR Code em outros dispositivos, utilize o IP local do seu computador na URL.
- O sistema está em desenvolvimento e pode sofrer alterações.

---
Projeto desenvolvido para fins acadêmicos na disciplina Certificadora 3.
