import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TagFreq {
  tag: string;
  freq: number;
}

@Injectable({
  providedIn: 'root'
})
export class TagFreqService {

  tagMap: Map<string, number> = new Map();
  tagNotifier = new BehaviorSubject([]);

  constructor() { }

  resetMap() {
    this.tagMap = new Map();
  }

  /**
   * Add each word from the file name to the wordMap via the `addWord` method
   * Ignore all words less than 2 characters long
   * Strip out all parantheses, brackets, and a few other words
   * @param filename
   */
  public addString(tagString: string): void {
    // Strip out: {}()[] as well as 'for', 'her', 'the', 'and', & ','
    const regex = /{|}|\(|\)|\[|\]|\b(for|her|the|and)\b|,/gi;
    tagString = tagString.replace(regex, '');
    const wordArray = Array.from(new Set(tagString.split(' '))); // only unique
    wordArray.forEach(word => {
      if (!(word.length < 3)) {
        this.addTag(word.toLowerCase());
      }
    });
  }

  /**
   * Populate the frequency map
   * @param tag
   */
  private addTag(tag: string): void {
    if (this.tagMap.has(tag)) {
      this.tagMap.set(tag, this.tagMap.get(tag) + 1);
    } else {
      this.tagMap.set(tag, 1);
    }
  }

  /**
   * Remove all elements with 3 or fewer occurences
   */
  public cleanMap(): void {
    this.tagMap.forEach((value, key) => {
      if (value < 2) {
        this.tagMap.delete(key);
      }
    });
  }

  /**
   * Get most frequent word from the map,
   * remove it from the map,
   * and return it with its frequency as an object
   */
  private getMostFrequent(total: number) {
    let currLargestFreq = 0;
    let currLargestWord = '';

    this.tagMap.forEach((value, key) => {
      if (value > currLargestFreq) {
        currLargestFreq = value;
        currLargestWord = key;
      }
    });

    this.tagMap.delete(currLargestWord);

    return {
      tag: currLargestWord,
      freq: currLargestFreq
    };
  }

  /**
   * Computes the array `numberOfTags` objects long with most frequent words
   * Creates `height` property, scaled between 8 and 22 proportionally
   * calls `.next` on BehaviorSubject
   * @param total: total number of files displayed
   **/
  public computeFrequencyArray(total: number, numberOfTags: number): void {
    const finalResult: TagFreq[] = []; // array of objects

    this.cleanMap();

    for (let i = 0; i < numberOfTags && i < total; i++) {
      if (this.tagMap.size > 0) {
        finalResult[i] = this.getMostFrequent(total);
      }
    }

    this.tagNotifier.next(finalResult);
  }
}
