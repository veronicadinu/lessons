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
import { jsPDF } from "jspdf";



@Component({
  selector: 'app-lesson-id',
  imports: [ButtonModule, PanelModule,ToggleButtonModule,FormsModule,AccordionModule,EditorModule,ProgressSpinnerModule],
  templateUrl: './lesson-id.component.html',
  styleUrl: './lesson-id.component.css'
})
export class LessonIdComponent implements OnInit, OnDestroy {

  lesson:Lesson | null = null

  idLesson!: number

  isSpeeching = false;



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

  clickPause(){
    this.tss.pause()
    this.isSpeeching= false

  }

  clickResume(){
    this.tss.resume()
    this.isSpeeching = true

  }

  stopSpeech(){
    this.tss.stop()
    this.isSpeeching = false
  }


 async downloadLesson(){

  if (!this.lesson || !this.lesson.content) return;

  // Extract plain text from HTML content
  const text = this.htmltotext.extractTextFromHtml(this.lesson.content).replaceAll("_", "");

  // Create a new jsPDF instance
  const doc = new jsPDF();

 // Define max width for text area on the PDF page (e.g., 180 for A4 width with margin)
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const maxLineWidth = pageWidth - margin * 2;

  // Split text into lines that fit max width
  const lines = doc.splitTextToSize(text, maxLineWidth);

  // Starting Y position on the page
  let y = margin;

  // Define line height (height between lines)
  const lineHeight = 10;

  // Loop through lines and add them to the PDF, adding new pages as needed
  for (let i = 0; i < lines.length; i++) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }

    // Convert PDF to Blob and wrap it as a File
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], "lesson.pdf", { type: "application/pdf" });

  
  // Check if Web Share API with file support is available
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Lesson PDF',
        text: 'Check out this lesson.',
        files: [file]
      });
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  } else {
    alert("Sharing is not supported on this browser. Please download the PDF instead.");
  }


    

  }
  

}
