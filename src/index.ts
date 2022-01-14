import {
    ILayoutRestorer,
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
    CommandToolbarButton,
    ICommandPalette,
    WidgetTracker,
    IWidgetTracker
} from '@jupyterlab/apputils';

import { Token } from '@lumino/coreutils';
import { refreshIcon } from  '@jupyterlab/ui-components';

import { ImageEditorDocumentWidget } from './editor';  
import { ImageEditorFactory } from './factory';

const FACTORY = 'ImageEditor';

namespace CommandIDs {
  export const rotateClockwise = 'image-editor:rotate-clockwise';
}

type IImageEditorTracker = IWidgetTracker<ImageEditorDocumentWidget>;
export const IImageEditorTracker = new Token<IImageEditorTracker>('image-editor/tracki');

const extension: JupyterFrontEndPlugin<IImageEditorTracker> = {
    id: '@jupyterlab/image-editor-extension:plugin',
    autoStart: true,
    requires: [ILayoutRestorer, ICommandPalette],
    provides: IImageEditorTracker,
    activate
};

export default extension;

function activate(
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer,
    palette: ICommandPalette,
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
      commands: app.commands,
      toolbarFactory: () => {
        return [{
          name: CommandIDs.rotateClockwise,
          widget: new CommandToolbarButton(
          {
            commands: app.commands,
            id: CommandIDs.rotateClockwise,
            args: {
              toolbar: true
            }
          })
        }
      ]
      }
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

    app.commands.addCommand(CommandIDs.rotateClockwise, {
      label: (args) => args?.toolbar ? '': 'Rotate an Image Editor',
      icon: refreshIcon,
      execute: () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        widget.content.editor.rotate(30);
      }
    })

    if (palette) {
      palette.addItem({
        command: CommandIDs.rotateClockwise,
        category: 'Image Editor Operations'
      });
    }

    return tracker
  }
