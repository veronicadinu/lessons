import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopComponent } from "./top/top.component";
import { BottomComponent } from "./bottom/bottom.component";

import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopComponent, BottomComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'one';

  constructor(private oidc: OidcSecurityService){}

  ngOnInit(): void {

     this.oidc.checkAuth().subscribe((loginResponse: LoginResponse) => {
      });
    
    
  }


 

}
