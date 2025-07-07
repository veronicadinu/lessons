import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  stop() {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported in this browser.');
      return;
    }

    if (this.synth.speaking) {
      // If already speaking, cancel the current utterance
      this.synth.cancel();
    }
  }

  speak(text: string): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported in this browser.');
      return;
    }

    if (this.synth.speaking) {
      // If already speaking, cancel the current utterance
      this.synth.cancel();
    }

    if (text.trim().length === 0) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Select US English voice if available
    const voices = this.synth.getVoices();
    const usVoice = voices.find(
      (voice) =>
        voice.lang === 'en-US' || voice.lang.startsWith('en-US')
    );
    if (usVoice) {
      utterance.voice = usVoice;
    }

    this.synth.speak(utterance);
  }


    // ✅ Add pause function
  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }


  
  // ✅ Add resume function
  resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }






}
