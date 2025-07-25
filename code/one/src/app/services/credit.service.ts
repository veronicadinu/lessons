import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreditResponse } from '../models/creditResponse';

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  constructor(private http: HttpClient) { }


  getFreeCredit(){
    return this.http.get('/api/credits/free')
  }


  getCredits(){
    return this.http.get<CreditResponse>('/api/credits/amount')
  }


  getUpdateCredits(body: {credits: number}){
    return this.http.put<CreditResponse>('/api/credits/updates', body)
  }



}
