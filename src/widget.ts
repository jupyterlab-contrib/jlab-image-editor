import { Widget } from '@lumino/widgets';
import { PromiseDelegate } from '@lumino/coreutils';
import ImageEditor from 'tui-image-editor';


export class ImageEditorWidget extends Widget {
    private _editor: any;
    private _ready = new PromiseDelegate<void>();

    get editor(): any {
        return this._editor;
    }

    get ready(): PromiseDelegate<void> {
        return this._ready;
    }

    constructor(maxWidth: number, maxHeight: number, cornerSize: number, rotatingPointOffset: number) {
        super();
        this._loadImageEditor(maxWidth, maxHeight, cornerSize, rotatingPointOffset);
      }

    private _loadImageEditor(maxWidth: number, maxHeight: number, cornerSize: number, rotatingPointOffset: number): void {
        this._editor = new ImageEditor(this.node,{
            cssMaxWidth: maxWidth,
            cssMaxHeight: maxHeight,
            selectionStyle: {
                cornerSize: cornerSize,
                rotatingPointOffset: rotatingPointOffset
            }
        })

        this._ready.resolve(void 0);
    }

    setContent(newValue: string, imageName: string): void {
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
