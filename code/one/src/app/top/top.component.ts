import { Component, OnInit, ViewChild } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { CreditService } from '../services/credit.service';
 import { DialogModule } from 'primeng/dialog';
// import { loadStripe } from '@stripe/stripe-js';





@Component({
  selector: 'app-top',
  imports: [ToolbarModule, ButtonModule, AvatarModule, ChipModule, MenuModule, CommonModule, SpeedDialModule, RouterModule, DrawerModule,
    DialogModule],
  templateUrl: './top.component.html',
  styleUrl: './top.component.css'
})
export class TopComponent implements OnInit {

      @ViewChild('drawerRef') drawerRef!: Drawer;

    closeCallback(e: any ): void {
        this.drawerRef.close(e);
    }

    visible: boolean = false;

  user: User | undefined
  items: MenuItem[] | undefined;

    visibles: boolean = false;

    showDialog() {
        this.visibles = true;
    }

    selectedPlan = ''

    //stripePromp = loadStripe('pk_test_51Ro0YE2NTKR366Vs35Dvcq32Iwlz2c2L8TzhH9hvewgVyPejxNx522BxqkVcxuUGUJDO8wxGZb4BY1QBt5qGAhjL00rljV5hs5 ')

  constructor(public oidc: OidcSecurityService, public credits: CreditService){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.oidc.userData$.subscribe(u =>{
      this.user = u.userData

         if(this.user){
            this.credits.getFreeCredit().subscribe({next: ()=>{
            
            }})
          }
    })
  }

  logout(){
    this.oidc.logoff().subscribe()
  }


  login(){
    this.oidc.authorize()
  }






buyCredits(amount: number) {
  alert(`Bought ${amount} credits!`);
}


}
