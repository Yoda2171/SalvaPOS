import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyProductosComponent } from './body-productos.component';

describe('BodyProductosComponent', () => {
  let component: BodyProductosComponent;
  let fixture: ComponentFixture<BodyProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyProductosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BodyProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
