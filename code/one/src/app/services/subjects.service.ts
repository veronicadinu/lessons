import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddSubjectRequest } from '../models/addSubjectRequest';
import { AddSubjectResponse } from '../models/addSubjectResponse';
import { Observable } from 'rxjs';
import { SubjectInterface } from '../models/subject';
import { Lesson } from '../models/lesson';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  constructor(private http: HttpClient) { }

   getSubjectsAll(){
    return this.http.get<SubjectInterface[]>('/api/subjectsAll')  //token added by interceptor
   }

   
   addSubject(body: AddSubjectRequest){
    return this.http.post<AddSubjectResponse>('/api/addSubject', body)
   }


   deleteSubject(id:number){
    return this.http.delete(`/api/delete/${id}`)
   }


    getSubjetId(id:number){
      return this.http.get<SubjectInterface>(`/api/subject/${id}`)
    }
   

    getLessonsbysubjectId(id:number){
      return this.http.get<Lesson[]>(`/api/lessons/subjectId/${id}`)
    }

    getLessonbyId(id: number){
      return this.http.get<Lesson>(`/api/lesson/${id}`)
    }


    updateLessonbyId(id: number, body: Lesson){
         return this.http.put(`/api/lesson/edit/${id}`, body)
    }


}
