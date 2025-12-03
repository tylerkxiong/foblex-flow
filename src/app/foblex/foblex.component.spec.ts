import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoblexComponent } from './foblex.component';

describe('FoblexComponent', () => {
  let component: FoblexComponent;
  let fixture: ComponentFixture<FoblexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoblexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoblexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
