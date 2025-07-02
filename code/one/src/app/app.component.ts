import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopComponent } from "./top/top.component";
import { BottomComponent } from "./bottom/bottom.component";

import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { User } from './models/user';
import { PushService } from './services/push.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopComponent, BottomComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

   title = 'one';

   readonly VAPID_PUBLIC_KEY = 'BE3NyGEPbOCKbStLgt9UFWKxba3jOIp9gd5s5yOqsM72D0I_5BFpu5vn3MwGqukVOmP4yREqoYIwyTnpdxleht4';

   user: User | undefined

  constructor(private oidc: OidcSecurityService, private swPush: SwPush, public push: PushService){}

  ngOnInit(): void {

     this.oidc.checkAuth().subscribe((loginResponse: LoginResponse) => {
      });



      this.oidc.userData$.subscribe({
        next: (data)=>{
          this.user = data.userData

          if(this.user && this.swPush.isEnabled){


            this.swPush.subscription.subscribe(s => {
              if (s) {
                return;
              }
              this.swPush.requestSubscription({
                serverPublicKey: this.VAPID_PUBLIC_KEY
              }).then(sub =>{
              // Send subscription to the backend
                this.push.addSubscription({
                  json: JSON.stringify(sub.toJSON())
                }).subscribe()

              }).catch(err => console.log('Could not subscribe to notifications', err))
            })

            
      
          }
        },
        error: (error)=>{console.log('Could not get the user', error)}
      })



    
    
    
  }


 

}
