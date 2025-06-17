import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Lesson } from '../models/lesson';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subject-id',
  imports: [ButtonModule, CommonModule, RouterModule],
  templateUrl: './subject-id.component.html',
  styleUrl: './subject-id.component.css'
})
export class SubjectIdComponent implements OnInit {

  subject: string = ""

  subjectId!: number 

  lessons : Lesson[]= []

 


  constructor(public serverSubject: SubjectsService, public route: ActivatedRoute){}


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.subjectId = Number(this.route.snapshot.paramMap.get("id")) 

   
        this.serverSubject.getLessonsbysubjectId(this.subjectId).subscribe({
          next: (data)=>{

           console.log('Lesson data:', data)
           this.lessons = data

          },
          error: (error)=>{console.error('Error fetching lessons data:', error);}
        })

    this.serverSubject.getSubjetId(this.subjectId).subscribe({
      next: (data)=>{

       console.log('Subject data:', data); 
        this.subject = data.nameSubject


      },
      error: (error)=>{console.error('Error fetching subject data:', error);}
    })

    


    
  }

    



}
