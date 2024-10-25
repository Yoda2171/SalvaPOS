export interface MetodoPago {
  tipo: string; // 'efectivo', 'tarjeta de debito', 'transferencia', 'cheque', 'tarjeta de credito'
  monto?: number | null; // Monto a pagar con este método
}
