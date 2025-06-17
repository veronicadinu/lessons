import { Component, OnInit } from '@angular/core';
import { SubjectsService } from '../services/subjects.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Lesson } from '../models/lesson';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventSourceInput } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-subject-id',
  imports: [ButtonModule, CommonModule, RouterModule, FullCalendarModule],
  templateUrl: './subject-id.component.html',
  styleUrl: './subject-id.component.css'
})
export class SubjectIdComponent implements OnInit {

   calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],

    events: [],

    eventClick: e => {
      console.log(e);
      this.router.navigateByUrl('/lesson/'+ e.event.id)
    },

    height:'100%',

    contentHeight: 'auto',

    aspectRatio: 1.5,

    dayMaxEventRows: false,

    eventDisplay: 'block'





  


   
  };

  subject: string = ""

  subjectId!: number 

  lessons : Lesson[]= []

 


  constructor(public serverSubject: SubjectsService, public route: ActivatedRoute, public router: Router){}


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.subjectId = Number(this.route.snapshot.paramMap.get("id")) 

   
        this.serverSubject.getLessonsbysubjectId(this.subjectId).subscribe({
          next: (data)=>{

           console.log('Lesson data:', data)
           this.lessons = data

           const events: EventSourceInput = this.lessons.map(l => {
            return {title: l.title + '-' + l.durationMinutes +'min',
               date: l.date.split('T')[0],
               id: l.id + "",
               color: l.done ? "green" : "red"
              }
           });

           this.calendarOptions.events = events;

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


  get allDone(){
    return this.lessons.every(l => l.done === true)
  }

    



}
