import { Component, OnInit } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { User } from '../models/user';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';


@Component({
  selector: 'app-top',
  imports: [ToolbarModule, ButtonModule, AvatarModule, ChipModule, MenuModule, CommonModule, SpeedDialModule  ],
  templateUrl: './top.component.html',
  styleUrl: './top.component.css'
})
export class TopComponent implements OnInit {

  user: User | undefined
      items: MenuItem[] | undefined;


  constructor(public oidc: OidcSecurityService){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.oidc.userData$.subscribe(u =>{
      this.user = u.userData
    })
  }

  logout(){
    this.oidc.logoff().subscribe()
  }


  login(){
    this.oidc.authorize()
  }



}
