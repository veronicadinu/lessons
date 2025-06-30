import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Push } from '../models/push';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  constructor(public http: HttpClient) { }


  addSubscription(body: Push){
    return this.http.post('/api/subscription', body )
  }
}
