import client from './client';

export async function gerarEnemCompleto({ ano, nivel, serie, quantidadePorArea = 10 } = {}) {
  const params = { quantidadePorArea };
  if (ano)   params.ano   = ano;
  if (nivel) params.nivel = nivel;
  if (serie) params.serie = serie;

  const resp = await client.get('/api/v1/simulados/enem-completo', { params });
  return resp.data.dados;
}

export async function gerarPorArea({ area, ano, nivel, serie, quantidade = 10 } = {}) {
  const params = { area, quantidade };
  if (ano)   params.ano   = ano;
  if (nivel) params.nivel = nivel;
  if (serie) params.serie = serie;

  const resp = await client.get('/api/v1/simulados/por-area', { params });
  return resp.data.dados;
}

export async function gerarPorDisciplina({ disciplina, ano, nivel, serie, quantidade = 10 } = {}) {
  const params = { disciplina, quantidade };
  if (ano)   params.ano   = ano;
  if (nivel) params.nivel = nivel;
  if (serie) params.serie = serie;

  const resp = await client.get('/api/v1/simulados/por-disciplina', { params });
  return resp.data.dados;
}

export async function listarSimuladosIA() {
  const resp = await client.get('/api/v1/simulados/ia');
  return resp.data.dados;
}

export async function obterSimuladoIA(id) {
  const resp = await client.get(`/api/v1/simulados/ia/${id}`);
  return resp.data.dados;
}
