import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddSubjectRequest } from '../models/addSubjectRequest';
import { AddSubjectResponse } from '../models/addSubjectResponse';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  constructor(private http: HttpClient) { }

   getSubjectsAll(){
    return this.http.get('/api/subjectsAll')  //token added by interceptor
   }

   
   addSubject(body: AddSubjectRequest){
    return this.http.post<AddSubjectResponse>('/api/addSubject', body)
   }


}
