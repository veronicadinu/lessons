import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitzComponent } from './quitz.component';

describe('QuitzComponent', () => {
  let component: QuitzComponent;
  let fixture: ComponentFixture<QuitzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuitzComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuitzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
