import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SuperAdminGuard } from './super-admin.guard';
import { RouterTestingModule } from '@angular/router/testing';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [SuperAdminGuard]
    });

    guard = TestBed.inject(SuperAdminGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation if user is superadmin', () => {
    // Establecer el valor de userRole como superadmin en el localStorage
    localStorage.setItem('userRole', 'superadmin');
    
    const canActivate = guard.canActivate({} as any, {} as any);
    expect(canActivate).toBeTrue();
  });

  it('should redirect if user is not superadmin', () => {
    // Establecer el valor de userRole como algo que no sea superadmin
    localStorage.setItem('userRole', 'user');
    
    const canActivate = guard.canActivate({} as any, {} as any);
    expect(canActivate).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/home']);
  });
});
