import { Component, OnInit } from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Quiz } from '../models/quiz';
import { SubjectsService } from '../services/subjects.service';
import { CommonModule, DatePipe,  } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-all-quitz',
  imports: [ListboxModule,RouterModule,DatePipe,CommonModule,FormsModule],
  templateUrl: './all-quitz.component.html',
  styleUrl: './all-quitz.component.css'
})
export class AllQuitzComponent implements OnInit {


  constructor(public serverSubject: SubjectsService, public route: ActivatedRoute){}

   quizzes: Quiz[] = []

   subjectId!: number

   searchQuiz: string = '';




  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.subjectId = Number(this.route.snapshot.paramMap.get("subjectId")) 
    

    
    this.serverSubject.getQuizzesbySubjectId(this.subjectId).subscribe({
      next: (data)=>{
        console.log(data)
           this.quizzes = data
      },
      error: (error)=>{console.error('Error fetching quizzes data:', error);}
    })


  }


  get filterQuiz(){

    const search = this.searchQuiz.toLowerCase() || ''
    return this.quizzes.filter(q => q.id.toString().includes(search) || (q.date && q.date.toLowerCase().includes(search)))
  }




}
