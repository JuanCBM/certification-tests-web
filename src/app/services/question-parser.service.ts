import { Injectable } from '@angular/core';
import { Question, AnswerOption } from '../models';

/**
 * Parses a plain text questions file with the following format:
 *
 * #BLOCK 1
 * Q: What is ...?
 * A) Option one
 * B) *Option two  <-- asterisk marks the correct option
 * C) Option three
 * D) Option four
 *
 * #BLOCK 2
 * Q: Another question?
 * A) *Correct
 * B) Wrong
 *
 * - Blocks are optional; if provided as "#BLOCK n" they will be assigned as blockId=n (including 0 for unassigned)
 * - Empty lines separate questions. Lines starting with // are comments.
 */
@Injectable({ providedIn: 'root' })
export class QuestionParserService {
  parse(text: string): Question[] {
    const lines = text.split(/\r?\n/);
    const questions: Question[] = [];

    // Default block is 0 (unassigned). You can also explicitly set "#BLOCK 0"
    let currentBlock: number | undefined = 0;
    let qText: string | null = null;
    let options: AnswerOption[] = [];
    let correctId: string | null = null;
    let imageUrls: string[] = [];

    const flush = () => {
      if (qText && options.length >= 2 && correctId) {
        const id = `${questions.length + 1}`;
        const q: Question = { id, text: qText.trim(), options: [...options], correctAnswerId: correctId, blockId: currentBlock };
        if (imageUrls.length) q.imageUrls = [...imageUrls];
        questions.push(q);
      }
      qText = null;
      options = [];
      correctId = null;
      imageUrls = [];
    };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flush(); continue; }
      if (line.startsWith('//')) { continue; }
      const blockMatch = /^#BLOCK\s+(\d+)/i.exec(line);
      if (blockMatch) {
        flush();
        currentBlock = parseInt(blockMatch[1], 10);
        continue;
      }
      if (line.startsWith('Q:')) {
        flush();
        qText = line.replace(/^Q:\s*/, '');
        continue;
      }
      // Handle reference image tags like <image>assets/path.png</image>
      const imgMatch = /^<image>(.+?)<\/image>$/i.exec(line);
      if (imgMatch) {
        const path = imgMatch[1].trim();
        if (path) {
          imageUrls.push(path);
        }
        continue;
      }
      const optMatch = /^([A-Z])[\)\.]\s*(\*?)(.+)$/.exec(line);
      if (optMatch) {
        const id = optMatch[1];
        const isCorrect = !!optMatch[2];
        const text = optMatch[3].trim();
        options.push({ id, text });
        if (isCorrect) correctId = id;
        continue;
      }
      // If none matched and we have qText, treat as continuation of question text
      if (qText) {
        qText += ' ' + line;
      }
    }
    flush();
    return questions;
  }
}
