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
  export const crop = 'image-editor:crop';
  export const applyCrop = 'image-editor:apply-crop';
  export const cancelCrop = 'image-editor:cancel-crop';
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

function resizeEditor() {
  var editor = document.querySelector('.tui-image-editor');
  var container = document.querySelector('.tui-image-editor-canvas-container');
  var height = (container as HTMLElement).style.maxHeight;

  (editor as HTMLElement).style.height = height;
}

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
        },
        {
          name: CommandIDs.crop,
          widget: new CommandToolbarButton(
          {
            commands: app.commands,
            id: CommandIDs.crop,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.applyCrop,
          widget: new CommandToolbarButton(
          {
            commands: app.commands,
            id: CommandIDs.applyCrop,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.cancelCrop,
          widget: new CommandToolbarButton(
          {
            commands: app.commands,
            id: CommandIDs.cancelCrop,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: 'docmanager:save-as',
          widget: new CommandToolbarButton(
          {
            commands: app.commands,
            id: 'docmanager:save-as',
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
      label: (args) => args?.toolbar ? 'Rotate': 'Rotate an Image Editor',
      icon: refreshIcon,
      execute: () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        widget.content.editor.rotate(30);
        
        const canvas_data = widget.content.editor.toDataURL();
        widget.context.model.fromString(canvas_data.replace(/^data:image\/\w+;base64,/g, ""));
      }
    })

    app.commands.addCommand(CommandIDs.crop, {
      label: (args) => args?.toolbar ? 'Crop': 'Crop',
      execute: () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        widget.content.editor.startDrawingMode('CROPPER');
      }
    })

    app.commands.addCommand(CommandIDs.applyCrop, {
      label: (args) => args?.toolbar ? 'Apply': 'Apply Crop',
      execute: async () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        const imageEditor = widget.content.editor;
        await imageEditor.crop(imageEditor.getCropzoneRect());
        imageEditor.stopDrawingMode();
        resizeEditor();
        const canvas_data = widget.content.editor.toDataURL();
        widget.context.model.fromString(canvas_data.replace(/^data:image\/\w+;base64,/g, ""));
      }
    })

    app.commands.addCommand(CommandIDs.cancelCrop, {
      label: (args) => args?.toolbar ? 'Cancel': 'Cancel Crop',
      execute: () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        widget.content.editor.stopDrawingMode();
      }
    })

    // app.commands.addCommand(CommandIDs.saveAs, {
    //   label: (args) => args?.toolbar ? 'Save': 'Save As',
    //   execute: async () => {
    //     const widget = tracker.currentWidget;

    //     if(!widget){
    //       return
    //     }
    //     console.log(widget.context.model.toString());
    //     console.log(widget.content.editor.toDataURL())
        
    //     await widget.context.saveAs();
    //   }
    // })

    if (palette) {
      palette.addItem({
        command: CommandIDs.rotateClockwise,
        category: 'Image Editor Operations'
      });
      palette.addItem({
        command: CommandIDs.crop,
        category: 'Image Editor Operations'
      });
      palette.addItem({
        command: CommandIDs.applyCrop,
        category: 'Image Editor Operations'
      });
      palette.addItem({
        command: CommandIDs.cancelCrop,
        category: 'Image Editor Operations'
      });
      // palette.addItem({
      //   command: CommandIDs.saveAs,
      //   category: 'Image Editor Operations'
      // });
    }

    return tracker
  }
