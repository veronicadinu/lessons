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
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';




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
  imports: [ TextareaModule, InputIconModule, InputGroupModule, InputGroupAddonModule, 
    FloatLabel,BadgeModule, ToastModule, FileUpload,CommonModule,DatePickerModule,ButtonModule, ReactiveFormsModule],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.css'
})
export class AddSubjectComponent implements OnInit {

    uploadedFiles: any[] = [];


    form = new FormGroup({
      nameSubject: new FormControl('', [Validators.required]),
      instructionAi: new FormControl('', [Validators.required]),
      files: new FormControl<string[]>([]),
      date: new FormControl([], [Validators.required]),
      timePerDay: new FormControl('', [Validators.required]),
      maxLengthLesson: new FormControl(''),
      

    })


 

constructor(private messageService: MessageService){}

onUpload(event:any) {
  this.uploadedFiles = [];

        for(let file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
    }

  
 ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  
 }


 onSubmit(){
   
 (async ()=>{

    const listabase64: string[] = []

  for(let f of this.uploadedFiles ){
    const base64 =  await fileToBase64(f)
    listabase64.push(base64)
  }

   this.form.get("files")?.setValue(listabase64)


   const data = this.form.value

   console.log(data)

 })()

   
  


 }

}
