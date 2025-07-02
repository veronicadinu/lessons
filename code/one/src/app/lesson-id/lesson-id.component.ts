import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { Lesson } from '../models/lesson';
import { SubjectsService } from '../services/subjects.service';
import { ActivatedRoute } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { EditorModule } from 'primeng/editor';
import { TextToSpeechService } from '../services/speech.service';
import { HtmltotextService } from '../services/htmltotext.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';



@Component({
  selector: 'app-lesson-id',
  imports: [ButtonModule, PanelModule,ToggleButtonModule,FormsModule,AccordionModule,EditorModule,ProgressSpinnerModule],
  templateUrl: './lesson-id.component.html',
  styleUrl: './lesson-id.component.css'
})
export class LessonIdComponent implements OnInit, OnDestroy {

  lesson:Lesson | null = null

  idLesson!: number

  isSpeeching = false



  constructor(public subjectService: SubjectsService,
              public route: ActivatedRoute,
              public tss: TextToSpeechService,
              public htmltotext: HtmltotextService){}


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

     this.idLesson = Number(this.route.snapshot.paramMap.get("id")) 

    this.subjectService.getLessonbyId(this.idLesson).subscribe({
      next: (data)=>{
        this.lesson = data
      },
      error: (error)=>{ console.error('Error fetching lessons data:', error); }
    }
      
    

    )
    
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

    this.tss.stop();
    this.isSpeeching = false
    
  }


  clickEditButton(){
    this.subjectService.updateLessonbyId(this.idLesson, this.lesson!).subscribe({
      next: data =>{ console.log("Succes")},
      error: error =>{}
    })
  }

  clickSpeech(){

    const text = this.htmltotext.extractTextFromHtml(this.lesson!.content).replaceAll("_", "")

    this.tss.speak(text)
    console.log(text)
    this.isSpeeching = true
  }

  stopSpeech(){
    this.tss.stop()
    this.isSpeeching = false
  }

}
