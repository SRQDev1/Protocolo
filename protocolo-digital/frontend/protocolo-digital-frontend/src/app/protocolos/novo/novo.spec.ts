import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Novo } from './novo';

describe('Novo', () => {
  let component: Novo;
  let fixture: ComponentFixture<Novo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Novo,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Novo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
