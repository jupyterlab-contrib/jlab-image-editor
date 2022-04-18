import { Widget } from '@lumino/widgets';
import { PromiseDelegate } from '@lumino/coreutils';
import ImageEditor from 'tui-image-editor';
import { DocumentRegistry } from '@jupyterlab/docregistry';

function resizeEditor() {
  const editor = document.querySelector('.tui-image-editor');
  const container = document.querySelector(
    '.tui-image-editor-canvas-container'
  );
  const height = (container as HTMLElement).style.maxHeight;

  (editor as HTMLElement).style.height = height;
}

function hexToRGBa(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = alpha || 1;

  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

export class ImageEditorWidget extends Widget {
  private _editor: any;
  private context: DocumentRegistry.Context;
  private _ready = new PromiseDelegate<void>();

  get ready(): PromiseDelegate<void> {
    return this._ready;
  }

  constructor(
    context: DocumentRegistry.Context,
    maxWidth: number,
    maxHeight: number,
    cornerSize: number,
    rotatingPointOffset: number
  ) {
    super({
      node: document.createElement('div')
    });
    this.context = context;
    this.node.appendChild(document.createElement('div')).className =
      'tui-image-editor';
    this._loadImageEditor(maxWidth, maxHeight, cornerSize, rotatingPointOffset);
    context.ready.then(async value => {
      await this.ready.promise;
      const base64Response = await fetch(
        `data:image/${
          context.contentsModel?.type
        };base64,${context.model.toString()}`
      );
      const blob = await base64Response.blob();

      this.setContent(URL.createObjectURL(blob), context.path);
    });

    this._ready.resolve(void 0);
  }

  applyRotate(type: string) {
    if (type === 'clock') {
      this._editor.rotate(30);
    } else {
      this._editor.rotate(-30);
    }
    this.updateModel();
  }

  crop() {
    this._editor.startDrawingMode('CROPPER');
  }

  async applyCrop() {
    await this._editor.crop(this._editor.getCropzoneRect());
    this._editor.stopDrawingMode();
    resizeEditor();
    this.updateModel();
  }

  cancelCrop() {
    this._editor.stopDrawingMode();
  }

  filter(type: string, options: any) {
    this._editor.applyFilter(type, options);
    this.updateModel();
  }

  flip(type: string) {
    if (type === 'X') {
      this._editor.flipX();
    } else if (type === 'Y') {
      this._editor.flipY();
    } else {
      this._editor.resetFlip();
    }
    this.updateModel();
  }

  draw(type: string, color: string) {
    const settings = {
      width: 12,
      color: hexToRGBa(color, 0.5)
    };
    this._editor.stopDrawingMode();
    if (type === 'freeDrawing') {
      this._editor.startDrawingMode('FREE_DRAWING', settings);
    } else if (type === 'straightLine') {
      this._editor.startDrawingMode('LINE_DRAWING', settings);
    }
    this.updateModel();
  }

  clear() {
    this._editor.clearObjects();
  }

  private updateModel() {
    requestAnimationFrame(() => {
      const canvas_data = this._editor
        .toDataURL()
        .replace(/^data:image\/\w+;base64,/g, '');
      this.context.model.fromString(canvas_data);
    });
  }

  private _loadImageEditor(
    maxWidth: number,
    maxHeight: number,
    cornerSize: number,
    rotatingPointOffset: number
  ): void {
    this._editor = new ImageEditor(
      this.node.querySelector('.tui-image-editor') as HTMLElement,
      {
        cssMaxWidth: maxWidth,
        cssMaxHeight: maxHeight,
        selectionStyle: {
          cornerSize: cornerSize,
          rotatingPointOffset: rotatingPointOffset
        }
      }
    );
  }

  private setContent(newValue: string, imageName: string): void {
    if (this._editor === undefined) {
      return;
    }

    const oldValue = this._editor.toDataURL();

    if (oldValue !== newValue) {
      if (newValue.length) {
        this._editor.loadImageFromURL(newValue, imageName);
      }
    }
  }
}
