import { ImageEditorDocumentWidget } from './editor';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { ImageEditorWidget } from './widget';

export class ImageEditorFactory extends ABCWidgetFactory<ImageEditorDocumentWidget, DocumentRegistry.IModel>{

    protected createNewWidget(context: DocumentRegistry.Context): ImageEditorDocumentWidget {
        return new ImageEditorDocumentWidget({
            context,
            content: new ImageEditorWidget(context, 700, 500, 20, 70)
        })
    }
}

export namespace ImageEditorFactory {
    export interface IImageEditorFactoryOptions
      extends DocumentRegistry.IWidgetFactoryOptions {
    }
}
