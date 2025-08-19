/**
 * Utilitários de formatação de moeda e valores
 */

export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.round(value * 100) / 100);
};

export const formatPercent = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const roundToCents = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const parseBRL = (value: string): number => {
  // Remove formatação e converte para número
  return parseFloat(value.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
};