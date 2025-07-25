import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { SubjectInterface } from '../models/subject';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-my-subjects',
  imports: [ButtonModule, RouterModule, CardModule,CommonModule,IconFieldModule, InputIconModule,FloatLabelModule, FormsModule],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.css'
})
export class MySubjectsComponent implements OnInit {


   responsiveOptions = [
  {
    breakpoint: '1024px', // Desktop and up
    numVisible: 3,
    numScroll: 1
  },
  {
    breakpoint: '768px', // Tablet
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '560px', // Mobile
    numVisible: 1,
    numScroll: 1
  }
];

 

   respons: SubjectInterface[] = []

   search: string = ''

  
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



   get filteredSubjects(): SubjectInterface[] {
  if (!this.search) return this.respons; // if search empty, show all

  return this.respons.filter(subject =>
    subject.nameSubject.toLowerCase().includes(this.search.toLowerCase())
  );
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
