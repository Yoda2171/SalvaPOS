export interface Venta {
  id: number;
  total: number;
  fecha: Date;
  estado: string;
  detalles: Detalle[];
  pagos: string[];
}

export interface Detalle {
  id: number;
  venta: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  cantidad: number;
}

export interface Pago {
  metodoPagoId: number;
  monto: number;
}
