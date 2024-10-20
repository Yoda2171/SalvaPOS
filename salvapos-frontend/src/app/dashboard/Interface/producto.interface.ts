export interface Producto {
  id: number;
  codigoBarras: string;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  cantidad: number;
  categoria: {
    id: number;
    nombre: string;
  };
}
