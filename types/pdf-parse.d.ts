declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PDFData {
    text: string;
    numpages: number;
    info: object;
    metadata: object;
    version: string;
  }
  
  function parse(dataBuffer: Buffer | Uint8Array): Promise<PDFData>;
  export default parse;
}