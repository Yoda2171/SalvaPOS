export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  data: Producto[];
}

export interface Producto {
  id?: number;
  codigoBarras: string;
  nombre: string;
  precioCosto: number;
  precioVenta: number;
  cantidad: number;
  categoria: Categoria;
  imagen?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}
