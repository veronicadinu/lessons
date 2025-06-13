import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { SubjectInterface } from '../models/subject';


@Component({
  selector: 'app-my-subjects',
  imports: [ButtonModule, RouterModule, CardModule,CommonModule],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.css'
})
export class MySubjectsComponent implements OnInit {


   respons: SubjectInterface[] = []
  
    constructor(public subjectsService: SubjectsService){}
  
  
    ngOnInit(): void {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
        this.subjectsService.getSubjectsAll().subscribe({
      next: (r) => {
        
        this.respons = r;
        console.log('Subjects:', this.respons);
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
      }
    });
      
    }


    deleteSubject(id: number){
      this.subjectsService.deleteSubject(id).subscribe({

        next: (r)=>{
            this.respons = this.respons.filter((subj: SubjectInterface) => subj.id !== id)

        },
        error: (err)=>{
           console.error('Error fetching subjects:', err);
        }
      })
    }


    
  


}
