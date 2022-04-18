import {
  ABCWidgetFactory,
  DocumentRegistry,
  DocumentWidget
} from '@jupyterlab/docregistry';
import { ImageEditorWidget } from './widget';

export class ImageEditorFactory extends ABCWidgetFactory<
  DocumentWidget<ImageEditorWidget>,
  DocumentRegistry.IModel
> {
  protected createNewWidget(
    context: DocumentRegistry.Context
  ): DocumentWidget<ImageEditorWidget> {
    return new DocumentWidget<ImageEditorWidget>({
      context,
      content: new ImageEditorWidget(context, 700, 500, 20, 70)
    });
  }
}

export namespace ImageEditorFactory {
  export type IImageEditorFactoryOptions =
    DocumentRegistry.IWidgetFactoryOptions;
}
