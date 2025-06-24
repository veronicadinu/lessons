import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmltotextService {

  constructor() { }

  extractTextFromHtml(html: string): string {
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Get the text content of the element (strips all tags)
  return tempDiv.textContent || tempDiv.innerText || '';
}
}
