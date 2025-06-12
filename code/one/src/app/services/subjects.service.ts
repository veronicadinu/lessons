import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  constructor(private http: HttpClient) { }

   getSubjectsAll(){
    return this.http.get('/api/subjectsAll')  //token added by interceptor
   }

   
   addSubject(body: any){
    return this.http.post('/api/addSubject', body)
   }


}
