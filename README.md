# Sistema de Orçamentos

Sistema para gerenciamento de orçamentos e serviços, desenvolvido com Node.js, Express e Supabase.

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Banco de Dados**: Supabase
- **Hospedagem**: Vercel

## Configuração do Ambiente

1. Clone o repositório:

```bash
git clone https://github.com/DaRkNeSs-ByTs/ORCAMENTOS.git
cd ORCAMENTOS
```

2. Instale as dependências do backend:

```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:

- Crie um arquivo `.env` baseado no `.env.example`
- Configure as credenciais do Supabase

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Estrutura do Projeto

```
.
├── backend/           # API Node.js
│   ├── server.js     # Servidor Express
│   ├── database.sql  # Scripts SQL
│   └── ...
├── frontend/         # Interface do usuário
│   ├── index.html    # Página principal
│   ├── script.js     # Lógica do frontend
│   ├── style.css     # Estilos
│   └── ...
└── vercel.json       # Configuração do Vercel
```

## API Endpoints

- `GET /api/servicos` - Lista todos os serviços (com paginação)
- `POST /api/servicos` - Cria/atualiza um serviço
- `DELETE /api/servicos/:id` - Remove um serviço

## Deploy

O projeto está configurado para deploy automático no Vercel. Basta fazer push para a branch main.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

ISC
