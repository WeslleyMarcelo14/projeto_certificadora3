# Configuração do Google Authentication

## Passo 1: Configurar o Google Cloud Console

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

## Passo 2: Configurar Firebase Admin SDK

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto `projetocertificadora3`
3. Vá para "Configurações do projeto" > "Contas de serviço"
4. Clique em "Gerar nova chave privada"
5. Baixe o arquivo JSON com as credenciais

## Passo 3: Configurar variáveis de ambiente

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

## Passo 4: Executar o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000` e teste o login com Google!

## Funcionalidades Implementadas

✅ Landing page moderna e responsiva
✅ Botão de login com Google
✅ Autenticação via NextAuth.js
✅ Integração com Firebase
✅ Interface adaptativa (logado/não logado)
✅ Gerenciamento de sessão
✅ Design moderno com Tailwind CSS

## Estrutura dos Componentes

- `GoogleAuthButton.tsx` - Componente de botão de login/logout
- `LandingHero.tsx` - Página inicial completa
- `Providers.tsx` - Provider de autenticação
- API Route: `api/auth/[...nextauth]/route.ts` - Configuração NextAuth

## Sistema de Usuários

✅ **Sistema automático de cargos:**
- **Primeiro usuário** = Administrador (automaticamente)
- **Demais usuários** = Participantes (automaticamente)
- Administradores podem alterar cargos de outros usuários
- Todos os dados são salvos automaticamente no Firestore

### Cargos disponíveis:
- **Participante**: Pode se inscrever em palestras e gerar certificados
- **Palestrante**: Pode criar e gerenciar suas próprias palestras
- **Organizador**: Pode gerenciar todas as palestras e ver relatórios
- **Administrador**: Acesso total, incluindo gestão de usuários

## Próximos Passos Recomendados

1. Implementar proteção de rotas
2. Adicionar middleware de autenticação
3. Configurar email de verificação (opcional)
4. Implementar logout global
5. Adicionar avatars de usuário
6. Expandir funcionalidades para participantes