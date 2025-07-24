import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null;
  private voicesSubject = new BehaviorSubject<SpeechSynthesisVoice[]>([]);
  private maxChunkLength = 200;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('❌ SpeechSynthesis not supported in this browser.');
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.voicesSubject.next([
      ...voices.filter((v) => !v.localService),
      ...voices.filter((v) => v.localService),
    ]);
  }

  voices() {
    return this.voicesSubject.asObservable();
  }

  isLanguageSupported(lang: string): boolean {
    return this.voicesSubject.value.some(
      (v) => v.lang.toLowerCase() === lang.toLowerCase()
    );
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause(): void {
    if (this.synth?.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth?.paused) {
      this.synth.resume();
    }
  }

  speak(text: string, lang: string = 'en-US', retryCount: number = 0): void {
    if (!this.synth) {
      console.warn('SpeechSynthesis not available.');
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    const voices = this.voicesSubject.value;

    if (!voices.length) {
      if (retryCount >= 5) {
        console.warn('❌ Voices not loaded after multiple retries.');
        return;
      }
      setTimeout(() => this.speak(text, lang, retryCount + 1), 500);
      return;
    }

    const selectedVoice = voices.find(
      (v) => v.lang.toLowerCase() === lang.toLowerCase()
    );

    const chunks = this.chunkText(trimmed);
    this.stop();

    this.speakChunksSequentially(chunks, selectedVoice, lang);
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
    const sentences = text.match(sentenceRegex) || [text];

    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= this.maxChunkLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        if (sentence.length <= this.maxChunkLength) {
          currentChunk = sentence;
        } else {
          for (let i = 0; i < sentence.length; i += this.maxChunkLength) {
            chunks.push(sentence.slice(i, i + this.maxChunkLength).trim());
          }
          currentChunk = '';
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private speakChunksSequentially(
    chunks: string[],
    voice: SpeechSynthesisVoice | undefined,
    lang: string,
    index = 0
  ): void {
    if (!this.synth || index >= chunks.length) return;

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = lang;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      this.speakChunksSequentially(chunks, voice, lang, index + 1);
    };

    utterance.onerror = (e) => {
      console.error('❌ SpeechSynthesis error:', e.error);
    };

    this.synth.speak(utterance);
  }
}
