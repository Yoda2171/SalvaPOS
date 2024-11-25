export interface SoldProductDto {
  nombreProducto: string;
  categoriaProducto: string;
  cantidadTotalVendida: number;
  precioUnitario: number;
  totalVendido: number;
}

export interface SoldMetodoPago {
  nombreMetodoPago: string;
  cantidadVentas: number;
  totalVendido: number;
}

export interface SoldCategoria {
  nombreCategoria: string;
  cantidadTotalVendida: number;
  totalVendido: number;
}

export interface SoldVenta {
  fechaVenta: string;
  nombreUsuario: string;
  cantidadVentas: number;
  totalVendido: number;
}
