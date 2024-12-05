import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesLogComponent } from './sales-log.component';

describe('SalesLogComponent', () => {
  let component: SalesLogComponent;
  let fixture: ComponentFixture<SalesLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
