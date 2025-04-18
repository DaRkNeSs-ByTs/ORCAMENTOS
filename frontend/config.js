// Configurações do frontend
const config = {
  // URL da API
  apiUrl: (() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:3000`;
    } else {
      return 'https://orcamentos-ochre.vercel.app/api';
    }
  })(),

  // Configurações de paginação
  pagination: {
    itemsPerPage: 10,
    maxItemsPerPage: 100,
    defaultPage: 1
  },

  // Configurações de cache
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000, // 5 minutos
    maxSize: 50, // número máximo de itens em cache
    storageKey: 'orcamentos_cache'
  },

  // Configurações de validação
  validation: {
    minYear: 2000,
    maxYear: 2100,
    minValue: 0,
    maxValue: 999999.99,
    maxLength: {
      solicitante: 100,
      loja: 100,
      servico: 500
    }
  },

  // Configurações de requisições
  request: {
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    retryDelay: 1000, // 1 segundo
    maxRetryDelay: 5000 // 5 segundos
  },

  // Configurações de erro
  error: {
    showDetails: process.env.NODE_ENV === 'development',
    defaultMessage: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
    networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
    timeoutError: 'A requisição demorou muito para responder. Tente novamente.'
  }
};

export default config; 