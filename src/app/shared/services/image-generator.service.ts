import { Injectable } from "@angular/core";

export type ImageGenerationOptions = {
  size: number;
  background: string;
  font: string;
  color: string;
  textAlign: CanvasTextAlign;
  output: 'base64'; //for now
};

export const defaultOptions: ImageGenerationOptions = {
  size: 150,
  background: '#3498db',
  color: '#ecf0f1',
  font: '40px Poppins',
  textAlign: 'center',
  output: 'base64'
};

//primitive image generator
@Injectable()
export class ImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 150;
    this.ctx = this.canvas.getContext('2d')!;
  }

  generate(text: string, options: ImageGenerationOptions = defaultOptions) {
    options = { ...options, ...defaultOptions };
    const size = this.canvas.width = this.canvas.height = options.size;
    this.ctx.fillStyle = options.background;
    this.ctx.fillRect(0, 0, size, size);
    this.ctx.textAlign = options.textAlign;
    this.ctx.font = options.font;
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = options.color;
    this.ctx.fillText(text, size/2, size/2);
    return this.canvas.toDataURL('image/jpeg');
  }
};