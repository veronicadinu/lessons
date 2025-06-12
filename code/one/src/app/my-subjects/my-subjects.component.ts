import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-subjects',
  imports: [ButtonModule, RouterModule],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.css'
})
export class MySubjectsComponent implements OnInit {
   respons:any
  
    constructor(public subjects: SubjectsService){}
  
  
    ngOnInit(): void {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
        this.subjects.getSubjectsAll().subscribe({
      next: (r) => {
        this.respons = r;
        console.log('Subjects:', this.respons);
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
      }
    });
      
    }


    
  


}
