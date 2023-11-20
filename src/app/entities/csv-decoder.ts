 class CSVDecoder {
  public onChunk: (chunk: string) => void = null;
  public onEnd: VoidFunction = null;
  public partialChunk: string = '';
  public decode(data: string) {
      const normalisedData = this.partialChunk + data;
      const chunks = normalisedData.split('\n');
      if (!this.partialChunk) {
        chunks.shift();
      }
      this.partialChunk = chunks.pop();
      chunks.forEach(this.onChunk);
  };
  public end() {
      if (this.partialChunk.trim() !== '') {
          this.onChunk(this.partialChunk);
      }
      if (this.onEnd) {
          this.onEnd();
      }
  }
}

export class CSVDecoderStream {
  public decoder: CSVDecoder = new CSVDecoder();
  public readable: ReadableStream = new ReadableStream({
    start: (controller) => {
      this.decoder.onChunk = (chunk) => controller.enqueue(chunk);
      this.decoder.onEnd = () => controller.close();
    },
  });
  public writable: WritableStream = new WritableStream({
    write: (data) => {
      this.decoder.decode(data);
    },
    close: () => {
      this.decoder.end();
    }
  });
}
