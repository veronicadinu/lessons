import { Component, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-test',
  imports: [SkeletonModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit{


isLoading = true;

  constructor(){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.loadQuiz();

    
    
  }

  loadQuiz(){
    setTimeout(()=>{
      this.isLoading = false;
    }, 2000)
  }

}
