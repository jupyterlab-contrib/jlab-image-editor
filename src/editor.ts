import { ImageEditorWidget } from './widget';
import { DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { CommandRegistry } from '@lumino/commands';

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

        // this.content.setContent(encodeURI(`${PageConfig.getBaseUrl()}/files/${this.context.path}`));
        this.content.setContent(URL.createObjectURL(blob), this.context.path);
    });
  }
}
