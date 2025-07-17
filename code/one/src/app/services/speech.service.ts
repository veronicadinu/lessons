import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voicesSubject = new BehaviorSubject<SpeechSynthesisVoice[]>([]);

  constructor() {
    this.synth = window.speechSynthesis;
    if (this.synth) {
      this.voicesSubject.next([
        ...this.synth.getVoices().filter((x) => !x.localService),
        ...this.synth.getVoices().filter((x) => x.localService),
      ]);
      // ✅ Load voices when available
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.voicesSubject.next([
            ...this.synth.getVoices().filter((x) => !x.localService),
            ...this.synth.getVoices().filter((x) => x.localService),
          ]);
          console.log('✅ xxxVoices loaded:', this.voicesSubject.value);
        };
      }
    }
  }

  voices() {
    return this.voicesSubject.asObservable();
  }

  isLanguageSupported(lang: string) {
    if (this.voicesSubject.value.length === 0) {
      return false;
    }
    return (
      this.voicesSubject.value.findIndex(
        (x) => x.lang.toLowerCase() === lang.toLowerCase()
      ) > -1
    );
  }

  stop() {
    if (!this.synth) {
      console.warn('SpeechSynthesis not supported in this browser.');
      return;
    }

    //if (this.synth.speaking) {
      // If already speaking, cancel the current utterance
      this.synth.cancel();
   // }
  }

  speak(text: string, lang: string = 'en-US'): void {
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

    // ✅ Use previously loaded voices
    const voices = this.voicesSubject.value;

    // If voices not loaded yet, wait and retry
    if (!voices.length) {
      console.warn('🕐 Voices not ready yet. Retrying...');
      setTimeout(() => this.speak(text, lang), 500);
      return;
    }

    // Match available voice
    const selectedVoice = voices.find(
      (voice) => voice.lang.toLowerCase() === lang.toLowerCase()
    );

    if (selectedVoice) {
      console.log('Found voice', selectedVoice);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = lang; // fallback if voice not matched
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
    
      this.synth.resume();
  }
}
