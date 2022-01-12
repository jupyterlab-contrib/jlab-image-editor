import { ImageEditorDocumentWidget } from './editor';
import { CommandRegistry } from '@lumino/commands';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { ImageEditorWidget } from './widget';

export class ImageEditorFactory extends ABCWidgetFactory<ImageEditorDocumentWidget, DocumentRegistry.IModel>{
    private _commands: CommandRegistry;

    constructor(options: ImageEditorFactory.IImageEditorFactoryOptions){
        super(options);
        this._commands = options.commands;
    }

    protected createNewWidget(context: DocumentRegistry.Context): ImageEditorDocumentWidget {
        return new ImageEditorDocumentWidget({
            context,
            commands: this._commands,
            content: new ImageEditorWidget(700, 500, 20, 70)
        })
    }
}

export namespace ImageEditorFactory {
    export interface IImageEditorFactoryOptions
      extends DocumentRegistry.IWidgetFactoryOptions {
      commands: CommandRegistry;
    }
}
