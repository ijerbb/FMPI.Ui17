import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

import { NavSidemenuComponent } from './nav-sidemenu.component';

describe('NavSidemenuComponent', () => {
  let component: NavSidemenuComponent;
  let fixture: ComponentFixture<NavSidemenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterModule.forRoot([]), NavSidemenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavSidemenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
