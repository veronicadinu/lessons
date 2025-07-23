import { Component, OnInit } from '@angular/core';
import { CreditService } from '../services/credit.service';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  credit = 0 


  constructor(public credits: CreditService){

  }


  ngOnInit(): void {

    this.credits.getCredits().subscribe({
      next: (r)=>{
       this.credit = r.credit
      }
    })
    
  }

}
