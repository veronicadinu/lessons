import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { ActivatedRoute } from '@angular/router';
import { Questions } from '../models/questions';
import { Quiz } from '../models/quiz';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';

@Component({
  selector: 'app-quitz',
  imports: [DatePipe,StepperModule,ButtonModule,ListboxModule,FormsModule],
  templateUrl: './quitz.component.html',
  styleUrl: './quitz.component.css'
})
export class QuitzComponent implements OnInit {

  quizId!: number 

  quiz!: Quiz 

  questios: Questions[] = []  // api questions



  constructor(public serviceSubject: SubjectsService, public route: ActivatedRoute){}


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.


    this.quizId = Number(this.route.snapshot.paramMap.get("id"))
    

    this.serviceSubject.getOneQuiz(this.quizId).subscribe({
      next: (data)=>{ 
        this.quiz = data
      },
      error: (error)=>{console.error('Error fetching quiz data:', error)}
    })


    this.serviceSubject.getQuestionsbyQuizId(this.quizId).subscribe({
      next: (data)=>{
        this.questios = data

      },
      error: (error) =>{console.error('Error fetching questions for quiz data:', error)}
    })

    
    
  }


  submit(){
   
  console.log(this.questios)
     this.serviceSubject.updateQuestionCorrectLetter(this.quizId, this.questios).subscribe({
       next: ()=>{},
       error: ()=>{}
     })

  }


  disableButton(){
    return this.questios.some(q=> q.answer == null)
  }

  get score(){

  return  this.questios.filter(q=> q.answer === q.correctLetter).length

  }

}
