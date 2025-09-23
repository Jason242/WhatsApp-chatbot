declare module 'qrcode' {
  interface QRCodeToBufferOptions {
    type?: 'png' | 'svg' | 'utf8';
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }

  export function toBuffer(text: string, options?: QRCodeToBufferOptions): Promise<Buffer>;
}
