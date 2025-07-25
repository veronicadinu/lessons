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
import { SplitButtonModule } from 'primeng/splitbutton';



@Component({
  selector: 'app-lesson-id',
  imports: [ButtonModule, PanelModule,ToggleButtonModule,FormsModule,AccordionModule,EditorModule,ProgressSpinnerModule,SplitButtonModule],
  templateUrl: './lesson-id.component.html',
  styleUrl: './lesson-id.component.css'
})
export class LessonIdComponent implements OnInit, OnDestroy {

  lesson:Lesson | null = null

  idLesson!: number

  langauges: string = ''

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
        this.lesson = data;

        this.subjectService.getSubjetId(this.lesson.subjectId).subscribe({next: (s)=>{
              this.langauges= s.language
        }})
      },
      error: (error)=>{ console.error('Error fetching lessons data:', error); }
    }
      
    

    )

  
    
  }


  get isTtsEnabled() {
    if (!this.langauges) {
      return false;
    }
    return this.tss.isLanguageSupported(this.langauges);
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


// clickSpeech() {
//   console.log('🧪 Test button clicked');

//   const text = 'This is a test of the speech synthesis system.';
//   const lang = 'en-US';

//   this.tss.speak(text, lang);
// }

  clickSpeech(){

    const text = this.htmltotext.extractTextFromHtml(this.lesson!.content).replaceAll("_", "").replaceAll("\n", " ").substring(0, 5000)

    console.log(text)

    this.tss.speak(text, this.langauges)
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


async downloadLesson() {
  if (!this.lesson || !this.lesson.content) return;

  // Extract plain text from HTML content, remove underscores
  const text = this.htmltotext.extractTextFromHtml(this.lesson.content).replaceAll("_", "");

  // Create a new jsPDF instance
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;

  // Set font and size for better readability
  const fontSize = 8;
  doc.setFont("roboto");
  doc.setFontSize(fontSize);

  // Calculate line height (leading)
  const lineHeight = fontSize * 0.5; // 1.5 line spacing

  // Split text into lines that fit within maxLineWidth
  const lines = doc.splitTextToSize(text, maxLineWidth);

  let y = margin;
  let pageNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    // If the next line would exceed page height minus bottom margin, add a new page
    if (y + lineHeight > pageHeight - margin) {
      // Add page number at bottom center before adding new page
      doc.setFontSize(10);
      doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pageNumber++;

      doc.addPage();
      doc.setFontSize(fontSize);
      y = margin;
    }

    // Draw justified text: jsPDF doesn't support full justification, but
    // we can do left align which looks neat.
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }

  // Add page number on the last page
  doc.setFontSize(10);
  doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save("lesson.pdf");
}


}
