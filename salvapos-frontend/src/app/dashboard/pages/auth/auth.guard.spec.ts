import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, Router],
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if user is authenticated', () => {
    spyOn(localStorage, 'getItem').and.returnValue('userToken');  // Simula que el usuario está autenticado

    const canActivate = guard.canActivate(null as any, null as any);

    expect(canActivate).toBeTrue();
  });

  it('should redirect to login if user is not authenticated', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);  // Simula que el usuario no está autenticado

    const navigateSpy = spyOn(router, 'navigate');  // Mock de la función navigate

    const canActivate = guard.canActivate(null as any, null as any);

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(canActivate).toBeFalse();
  });
});
