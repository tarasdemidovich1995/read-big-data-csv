import { Injectable } from '@angular/core';
import { CSVDecoderStream } from '../entities/csv-decoder';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  public csv(url: string): Promise<ReadableStream> {
    return fetch(url).then((response: Response) => response.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new CSVDecoderStream())
    );
  }
}
