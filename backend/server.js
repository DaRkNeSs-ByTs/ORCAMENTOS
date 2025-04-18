const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configuração do app
const app = express();

// Configuração do CORS
app.use(cors({
  origin: ['https://orcamentos-ochre.vercel.app', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para garantir respostas JSON
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://orcamentos-ochre.vercel.app');
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Configuração do rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: JSON.stringify({ error: 'Muitas requisições, tente novamente mais tarde' })
});
app.use(limiter);

// Middleware para processar JSON
app.use(express.json({ limit: '10mb' }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Conectar ao Supabase
const supabaseUrl = 'https://dgtqgycqwtnfovdrndnx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndHFneWNxd3RuZm92ZHJuZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDg2NDMsImV4cCI6MjA1OTM4NDY0M30.QwvJXzh-KOeR7HYy2nQqaUWpl8cOqYEBtWDaBbvs4og';

console.log('Ambiente:', process.env.NODE_ENV);
console.log('Supabase URL configurada:', !!supabaseUrl);
console.log('Supabase Key configurada:', !!supabaseKey);

// Inicialização do cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Rota de teste
app.get('/api', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servicos_view')
      .select('count')
      .limit(1);

    if (error) throw error;

    res.json({
      message: 'API funcionando!',
      supabase: 'Conectado',
      registros: data?.[0]?.count || 0
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({
      error: 'Erro ao conectar com o banco de dados',
      message: error.message
    });
  }
});

// Rota para buscar registros
app.get('/api/servicos', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    console.log(`[DEBUG] Buscando registros - página: ${page}, limite: ${limit}, offset: ${offset}`);

    const { data, error, count } = await supabase
      .from('servicos_view')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('id', { ascending: false });

    console.log('[DEBUG] Resposta do Supabase:', { data, error, count });

    if (error) {
      console.error('[ERROR] Erro do Supabase:', error);
      return res.status(500).json({
        error: 'Erro ao buscar registros',
        message: error.message,
        details: error.details
      });
    }

    if (!data) {
      console.log('[DEBUG] Nenhum dado encontrado');
      return res.json({
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);
    console.log('[DEBUG] Total de páginas:', totalPages);

    const response = {
      data: data,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    console.log('[DEBUG] Enviando resposta:', response);
    res.json(response);
  } catch (error) {
    console.error('[ERROR] Erro não tratado:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Rota para buscar um registro específico
app.get('/api/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        error: 'Registro não encontrado',
        message: `O registro com ID ${id} não foi encontrado`
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({
      error: 'Erro ao buscar registro',
      message: error.message
    });
  }
});

// Rota para adicionar/editar registro
app.post('/api/servicos', async (req, res) => {
  try {
    const { id, ...dados } = req.body;

    // Validação dos campos obrigatórios
    if (!dados.solicitante || !dados.loja || !dados.servico || !dados.orcamento) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'Os campos solicitante, loja, serviço e orçamento são obrigatórios'
      });
    }

    // Validação do orçamento
    if (isNaN(dados.orcamento) || dados.orcamento <= 0) {
      return res.status(400).json({
        error: 'Orçamento inválido',
        message: 'O orçamento deve ser um número maior que zero'
      });
    }

    // Validação do mês/ano
    if (dados.mesServico && (dados.mesServico < 1 || dados.mesServico > 12)) {
      return res.status(400).json({
        error: 'Mês inválido',
        message: 'O mês deve estar entre 1 e 12'
      });
    }

    if (dados.anoServico && (dados.anoServico < 2000 || dados.anoServico > 2100)) {
      return res.status(400).json({
        error: 'Ano inválido',
        message: 'O ano deve estar entre 2000 e 2100'
      });
    }

    const result = id
      ? await supabase.from('servicos').update(dados).eq('id', id).select().single()
      : await supabase.from('servicos').insert([dados]).select().single();

    if (result.error) {
      console.error('Erro ao salvar registro:', result.error);
      return res.status(500).json({
        error: 'Erro ao salvar registro',
        message: result.error.message
      });
    }

    res.status(id ? 200 : 201).json(result.data);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Rota para remover registro
app.delete('/api/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('servicos').delete().eq('id', id);

    if (error) {
      console.error('Erro ao remover registro:', error);
      return res.status(500).json({
        error: 'Erro ao remover registro',
        message: error.message
      });
    }

    res.json({ message: 'Registro removido com sucesso' });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.path} não existe`
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Configuração da porta
const PORT = process.env.PORT || 3000;

// Inicializa o servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`URL local: http://localhost:${PORT}`);
  });
}

// Exporta o app para o Vercel
module.exports = app;
