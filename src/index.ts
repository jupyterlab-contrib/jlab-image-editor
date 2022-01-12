import {
    ILayoutRestorer,
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
    ICommandPalette,
    WidgetTracker,
    IWidgetTracker
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { Token } from '@lumino/coreutils';

import { ImageEditorDocumentWidget } from './editor';  
import { ImageEditorFactory } from './factory';

const FACTORY = 'ImageEditor';

type IImageEditorTracker = IWidgetTracker<ImageEditorDocumentWidget>;
export const IImageEditorTracker = new Token<IImageEditorTracker>('image-editor/tracki');

const extension: JupyterFrontEndPlugin<IImageEditorTracker> = {
    id: '@jupyterlab/image-editor-extension:plugin',
    autoStart: true,
    requires: [ILayoutRestorer, ICommandPalette],
    optional: [ILauncher],
    provides: IImageEditorTracker,
    activate
};

export default extension;

function activate(
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    palette: ICommandPalette,
    launcher: ILauncher | null
  ): IImageEditorTracker {
  
    const namespace = 'image-editor';
    const tracker = new WidgetTracker<ImageEditorDocumentWidget>({ namespace });
  
    // Handle state restoration.
    restorer.restore(tracker, {
      command: 'docmanager:open',
      args: widget => ({ path: widget.context.path, factory: FACTORY }),
      name: widget => widget.context.path
    });
  
    const factory = new ImageEditorFactory({
      name: FACTORY,
      modelName: 'base64',
      fileTypes: ['png', 'jpg', 'jpeg'],
      defaultFor: ['png', 'jpg', 'jpeg'],
      commands: app.commands
    });
  
    factory.widgetCreated.connect((sender, widget) => {
      widget.title.icon = 'jp-MaterialIcon jp-ImageIcon'; // TODO change
  
      // Notify the instance tracker if restore data needs to update.
      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
      tracker.add(widget);
    });
    app.docRegistry.addWidgetFactory(factory);

    return tracker
  }
