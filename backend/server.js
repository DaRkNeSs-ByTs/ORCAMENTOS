const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configuração do app
const app = express();

// Configuração do CORS
app.use(cors({
  origin: ['https://orcamentos-ochre.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Configuração do rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: JSON.stringify({ error: 'Muitas requisições, tente novamente mais tarde' })
});
app.use(limiter);

// Middleware para processar JSON
app.use(express.json({ limit: '10mb' }));

// Middleware para garantir respostas JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://orcamentos-ochre.vercel.app');
  next();
});

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
  },
  db: {
    schema: 'public'
  }
});

// Rota de teste que inclui verificação do Supabase
app.get('/api', async (req, res) => {
  try {
    // Testa a conexão com o Supabase
    const { data, error } = await supabase
      .from('servicos_view')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Erro ao testar conexão com Supabase:', error);
      if (error.code === '42P01') { // Tabela não existe
        return res.status(404).json({
          message: 'API funcionando!',
          supabase: 'Conectado',
          warning: 'A view servicos_view não foi encontrada no banco de dados'
        });
      }
      throw error;
    }

    res.json({
      message: 'API funcionando!',
      supabase: 'Conectado',
      registros: data?.[0]?.count || 0
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({
      message: 'API funcionando, mas com erro no Supabase',
      error: error.message
    });
  }
});

// Rota para pegar todos os registros
app.get('/api/servicos', async (req, res) => {
  try {
    // Validação dos parâmetros de paginação
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    console.log(`Buscando registros - página: ${page}, limite: ${limit}, offset: ${offset}`);

    // Busca os dados com paginação
    const { data, error, count } = await supabase
      .from('servicos_view')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('id', { ascending: false });

    if (error) {
      console.error('Erro ao buscar registros:', error);
      return res.status(500).json({
        error: 'Erro ao buscar registros',
        message: error.message,
        details: error.details || null
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: data || [],
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// Rota para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.path} não existe`
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Exporta o app para o Vercel
module.exports = app;
