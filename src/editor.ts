import { ImageEditorWidget } from './widget';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';

export namespace ImageEditorDocumentWidget {
    export interface IOptions<T>
      extends DocumentWidget.IOptions<ImageEditorWidget, DocumentRegistry.IModel> {
    }
  }

export class ImageEditorDocumentWidget extends DocumentWidget<ImageEditorWidget> {

  constructor(options: ImageEditorDocumentWidget.IOptions<ImageEditorWidget>) {
    super(options)
  }
}
