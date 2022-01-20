import { ImageEditorWidget } from './widget';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { CommandRegistry } from '@lumino/commands';

function resizeEditor() {
  var editor = document.querySelector('.tui-image-editor');
  var container = document.querySelector('.tui-image-editor-canvas-container');
  var height = (container as HTMLElement).style.maxHeight;

  (editor as HTMLElement).style.height = height;
}

export namespace ImageEditorDocumentWidget {
    export interface IOptions<T>
      extends DocumentWidget.IOptions<ImageEditorWidget, DocumentRegistry.IModel> {
      commands: CommandRegistry;
    }
  }

export class ImageEditorDocumentWidget extends DocumentWidget<ImageEditorWidget> {

  constructor(options: ImageEditorDocumentWidget.IOptions<ImageEditorWidget>) {
    super(options)
    
    this.context.ready.then(async value => {
        await this.content.ready.promise;
        const base64Response = await fetch(`data:image/${this.context.contentsModel?.type};base64,${this.context.model.toString()}`);
        const blob = await base64Response.blob();

        this.content.setContent(URL.createObjectURL(blob), this.context.path);
    });
  }

  rotate() {
    this.content.editor.rotate(30);
  }

  crop() {
    this.content.editor.startDrawingMode('CROPPER');
  }

  async applyCrop() {
    await this.content.editor.crop(this.content.editor.getCropzoneRect());
    this.content.editor.stopDrawingMode();
    resizeEditor();
  }

  cancelCrop() {
    this.content.editor.stopDrawingMode();
  }

  updateModel() {
    requestAnimationFrame(()=> {
      const canvas_data = this.content.editor.toDataURL().replace(/^data:image\/\w+;base64,/g, "");
      this.context.model.fromString(canvas_data);
    });
  }
}
