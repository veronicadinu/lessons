import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllQuitzComponent } from './all-quitz.component';

describe('AllQuitzComponent', () => {
  let component: AllQuitzComponent;
  let fixture: ComponentFixture<AllQuitzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllQuitzComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllQuitzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
