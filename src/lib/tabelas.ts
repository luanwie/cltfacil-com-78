/**
 * Utilitários para cálculo de INSS e IRRF usando tabelas por ano
 */

interface FaixaINSS {
  ate: number;
  aliquota: number;
  deducao: number;
}

interface TabelaINSS {
  ano: number;
  faixas: FaixaINSS[];
  teto: number;
  salarioMinimo: number;
}

interface FaixaIRRF {
  ate: number;
  aliquota: number;
  deducao: number;
}

interface TabelaIRRF {
  ano: number;
  faixas: FaixaIRRF[];
  deducaoPorDependente: number;
  limiteDependentes: number;
}

/**
 * Carrega tabela INSS por ano (fallback para 2024)
 */
export const getFaixasINSS = async (ano = new Date().getFullYear()): Promise<TabelaINSS> => {
  try {
    const tabela = await import(`@/data/tabelas/${ano}/INSS.json`);
    return tabela.default;
  } catch {
    const tabela = await import(`@/data/tabelas/2024/INSS.json`);
    return tabela.default;
  }
};

/**
 * Carrega tabela IRRF por ano (fallback para 2024)
 */
export const getFaixasIRRF = async (ano = new Date().getFullYear()): Promise<TabelaIRRF> => {
  try {
    const tabela = await import(`@/data/tabelas/${ano}/IRRF.json`);
    return tabela.default;
  } catch {
    const tabela = await import(`@/data/tabelas/2024/IRRF.json`);
    return tabela.default;
  }
};

/**
 * Calcula INSS progressivo
 */
export const calcularINSS = (
  salario: number,
  tabela: TabelaINSS
): { valor: number; aliquotaEfetiva: number; faixaMarginal: number } => {
  if (salario <= 0) return { valor: 0, aliquotaEfetiva: 0, faixaMarginal: 0 };

  const salarioLimitado = Math.min(salario, tabela.teto);

  // Encontra faixa aplicável
  const faixa = tabela.faixas.find((f) => salarioLimitado <= f.ate) || tabela.faixas[tabela.faixas.length - 1];

  // Cálculo pela fórmula da faixa
  const valor = Math.max(0, salarioLimitado * faixa.aliquota - faixa.deducao);

  const aliquotaEfetiva = salario > 0 ? valor / salario : 0;
  const faixaMarginal = faixa.aliquota;

  return {
    valor: Math.round(valor * 100) / 100,
    aliquotaEfetiva,
    faixaMarginal,
  };
};

/**
 * Calcula IRRF progressivo
 */
export const calcularIRRF = (
  baseCalculo: number,
  dependentes: number,
  pensaoAlimenticia: number,
  tabela: TabelaIRRF
): {
  valor: number;
  aliquotaEfetiva: number;
  baseCalculoFinal: number;
  totalDeducoes: number;
  faixaMarginal: number;
} => {
  if (baseCalculo <= 0)
    return { valor: 0, aliquotaEfetiva: 0, baseCalculoFinal: 0, totalDeducoes: 0, faixaMarginal: 0 };

  // Deduções
  const deducaoDependentes =
    Math.min(dependentes, tabela.limiteDependentes) * tabela.deducaoPorDependente;
  const totalDeducoes = deducaoDependentes + pensaoAlimenticia;
  const baseCalculoFinal = Math.max(0, baseCalculo - totalDeducoes);

  if (baseCalculoFinal <= 0)
    return { valor: 0, aliquotaEfetiva: 0, baseCalculoFinal, totalDeducoes, faixaMarginal: 0 };

  // Encontra faixa aplicável
  const faixa =
    tabela.faixas.find((f) => baseCalculoFinal <= f.ate) || tabela.faixas[tabela.faixas.length - 1];

  // Cálculo pela fórmula da faixa
  const valor = Math.max(0, baseCalculoFinal * faixa.aliquota - faixa.deducao);
  const aliquotaEfetiva = baseCalculo > 0 ? valor / baseCalculo : 0;
  const faixaMarginal = faixa.aliquota;

  return {
    valor: Math.round(valor * 100) / 100,
    aliquotaEfetiva,
    baseCalculoFinal,
    totalDeducoes,
    faixaMarginal,
  };
};

/**
 * Versões síncronas usando dados estáticos (para uso em componentes)
 */
import inss2025 from '@/data/tabelas/2025/INSS.json';
import irrf2025 from '@/data/tabelas/2025/IRRF.json';
import inss2024 from '@/data/tabelas/2024/INSS.json';
import irrf2024 from '@/data/tabelas/2024/IRRF.json';

export const getTabelaINSSSync = (ano = new Date().getFullYear()): TabelaINSS => {
  return ano >= 2025 ? inss2025 : inss2024;
};

export const getTabelaIRRFSync = (ano = new Date().getFullYear()): TabelaIRRF => {
  return ano >= 2025 ? irrf2025 : irrf2024;
};

export const calcularINSSSync = (salario: number, ano = new Date().getFullYear()) => {
  return calcularINSS(salario, getTabelaINSSSync(ano));
};

export const calcularIRRFSync = (
  baseCalculo: number,
  dependentes: number,
  pensao: number,
  ano = new Date().getFullYear()
) => {
  return calcularIRRF(baseCalculo, dependentes, pensao, getTabelaIRRFSync(ano));
};
