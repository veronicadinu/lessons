import { Component, OnInit } from '@angular/core';;
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-bottom',
  imports: [ButtonModule],
  templateUrl: './bottom.component.html',
  styleUrl: './bottom.component.css'
})
export class BottomComponent implements OnInit{

  constructor(){
    
  }


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

}
