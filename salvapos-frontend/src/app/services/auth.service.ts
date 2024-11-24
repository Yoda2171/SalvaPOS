import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://mi-backend.com/api'; // Cambia esto con la URL de tu API backend

    constructor(private http: HttpClient) { }

    // Método para registrar un nuevo usuario
    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user);
    }

    // Método para iniciar sesión
    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials);
    }

    // Método para obtener el rol del usuario desde el almacenamiento local
    getUserRole(): string {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?.role || ''; // Devuelve el rol del usuario
    }

    // Método para verificar si el usuario está autenticado
    isAuthenticated(): boolean {
        return !!localStorage.getItem('userToken');  // Verifica si el token está presente en el localStorage
    }

    // Método para cerrar sesión
    logout(): void {
        localStorage.removeItem('userToken');  // Elimina el token
        localStorage.removeItem('user');  // Elimina los datos del usuario
    }
}
