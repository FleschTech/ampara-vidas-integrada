
/**
 * Formata um número de CPF adicionando pontos e hífen
 * Exemplo: 12345678901 -> 123.456.789-01
 */
export const formatCPF = (cpf: string): string => {
  // Remove todos os caracteres não numéricos
  const cpfClean = cpf.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const cpfLimited = cpfClean.slice(0, 11);
  
  // Aplica a formatação xxx.xxx.xxx-xx
  if (cpfLimited.length <= 3) {
    return cpfLimited;
  } else if (cpfLimited.length <= 6) {
    return `${cpfLimited.slice(0, 3)}.${cpfLimited.slice(3)}`;
  } else if (cpfLimited.length <= 9) {
    return `${cpfLimited.slice(0, 3)}.${cpfLimited.slice(3, 6)}.${cpfLimited.slice(6)}`;
  } else {
    return `${cpfLimited.slice(0, 3)}.${cpfLimited.slice(3, 6)}.${cpfLimited.slice(6, 9)}-${cpfLimited.slice(9)}`;
  }
};
