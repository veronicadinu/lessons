
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SubjectsService } from '../services/subjects.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
   
 respons:any

  constructor(public subjects: SubjectsService){}


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

 


}
