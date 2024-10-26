import { MetodoPago } from './metodoPago.interface';

export interface Venta {
  id?: number;
  total: number;
  fecha: Date;
  estado: string;
  detalles: DetalleVenta[];
  pagos: Pago[];
}

export interface DetalleVenta {
  id?: number;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pago {
  id?: number;
  monto?: number | null;
  metodoPago: MetodoPago;
}

export interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  cantidad: number;
}
