import { Component, OnInit } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabel } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { SubjectsService } from '../services/subjects.service';
import { AddSubjectRequest } from '../models/addSubjectRequest';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';



const DateValidator = (control: AbstractControl) => {
      const value = control.value

      if(!value){
        return null
      }
      if(value.filter((x: any) => x != null).length !== 2){
        return {
          wrongDates: value
        }
      }

      return null
  };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result.split(',')[1]); // Removes the `data:*/*;base64,` prefix
      } else {
        reject('Failed to convert file to Base64');
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}


@Component({
  selector: 'app-add-subject',
  imports: [ TextareaModule, InputIconModule, InputGroupModule, InputGroupAddonModule, FloatLabel,BadgeModule, ToastModule,
    FileUpload,CommonModule,DatePickerModule,ButtonModule, ReactiveFormsModule,ProgressSpinnerModule],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.css'
})
export class AddSubjectComponent implements OnInit {

    uploadedFiles: any[] = [];

    loading = false


    form = new FormGroup({
      nameSubject: new FormControl<string>('', [Validators.required]),
      instructionAi: new FormControl<string>(''),
      files: new FormControl<string[]>([]),
      date: new FormControl<Date[]>([], [Validators.required, DateValidator]),
      timePerDay: new FormControl<Date | undefined>(undefined, [Validators.required]),
      maxLengthLesson: new FormControl<Date | undefined>(undefined),
      

    })


 

constructor(private messageService: MessageService, private subjectService: SubjectsService, private route: Router){}

onUpload(event:any) {
  this.uploadedFiles = [];

        for(let file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
    }


    onRemove(event: any){
     this.uploadedFiles.splice( this.uploadedFiles.indexOf(event.file) ,1)
    }

  
 ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  
 }


 onSubmit(){

  this.loading = true;
   
 (async ()=>{  const listabase64: string[] = []

  for(let f of this.uploadedFiles ){
    const base64 =  await fileToBase64(f)
    listabase64.push(base64)
  }

   this.form.get("files")?.setValue(listabase64)


   const data = this.form.value

   const sendBk:AddSubjectRequest = {
    nameSubject: data.nameSubject!,


      instructionAi: data.instructionAi,
      files: data.files,
      dateStart: data.date![0].toISOString(),
      dateEnd: data.date![1].toISOString(),
      timePerDay: data.timePerDay!.getHours() * 60 + data.timePerDay!.getMinutes(),
      maxLengthLesson: !data.maxLengthLesson ? undefined : data.maxLengthLesson.getHours() * 60 + data.maxLengthLesson.getMinutes()

   }

   console.log(data)

   this.subjectService.addSubject(sendBk).subscribe({
    next: r=>{
      console.log(r)
      this.loading = false
      this.route.navigate(['/subjects'])

     

    },
    error: error=>{
            this.loading = false
            console.error('Error fetching lessons data:', error);
    }
   })

 })()

   
  


 }

}
