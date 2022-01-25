import {
    ILayoutRestorer,
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
    CommandToolbarButton,
    ICommandPalette,
    WidgetTracker
} from '@jupyterlab/apputils';

import { DocumentWidget } from '@jupyterlab/docregistry';

import { refreshIcon } from  '@jupyterlab/ui-components';
 
import { ImageEditorFactory } from './factory';
import { IImageEditorTracker } from './tokens';
import { ImageEditorWidget } from './widget';
import { ImageEditorPanelWrapper } from './components/ImageEditorPanel';

const FACTORY = 'ImageEditor';

namespace CommandIDs {
  export const rotateClockwise = 'image-editor:rotate-clockwise';
  export const crop = 'image-editor:crop';
  export const applyCrop = 'image-editor:apply-crop';
  export const cancelCrop = 'image-editor:cancel-crop';
}

const extension: JupyterFrontEndPlugin<IImageEditorTracker> = {
    id: '@jupyterlab/image-editor-extension:plugin',
    autoStart: true,
    optional: [ILayoutRestorer, ICommandPalette],
    provides: IImageEditorTracker,
    activate
};

export default extension;

function activate(
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer | null,
    palette: ICommandPalette | null,
  ): IImageEditorTracker {
  
    const namespace = 'image-editor';
    const tracker = new WidgetTracker<DocumentWidget<ImageEditorWidget>>({ namespace });
  
    // Handle state restoration.
    if(restorer) {
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
      });
    }
  
    const factory = new ImageEditorFactory({
      name: FACTORY,
      modelName: 'base64',
      fileTypes: ['png', 'jpg', 'jpeg'],
      defaultFor: ['png', 'jpg', 'jpeg'],
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
        // {
        //   name: CommandIDs.applyCrop,
        //   widget: new CommandToolbarButton(
        //   {
        //     commands: app.commands,
        //     id: CommandIDs.applyCrop,
        //     args: {
        //       toolbar: true
        //     }
        //   })
        // },
        // {
        //   name: CommandIDs.cancelCrop,
        //   widget: new CommandToolbarButton(
        //   {
        //     commands: app.commands,
        //     id: CommandIDs.cancelCrop,
        //     args: {
        //       toolbar: true
        //     }
        //   })
        // },
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
      const types = app.docRegistry.getFileTypesForPath(widget.context.path);

      if (types.length > 0) {
        widget.title.icon = types[0].icon!;
      }
  
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
        widget.content.rotate();
      }
    })

    app.commands.addCommand(CommandIDs.crop, {
      label: (args) => args?.toolbar ? 'Crop': 'Crop',
      execute: () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        widget.content.crop();
      }
    })

    app.commands.addCommand(CommandIDs.applyCrop, {
      label: (args) => args?.toolbar ? 'Apply': 'Apply Crop',
      execute: async () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        await widget.content.applyCrop();
      }
    })

    app.commands.addCommand(CommandIDs.cancelCrop, {
      label: (args) => args?.toolbar ? 'Cancel': 'Cancel Crop',
      execute: () => {
        const widget = tracker.currentWidget;

        if(!widget){
          return
        }
        widget.content.cancelCrop();
      }
    })

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
    }

    const prPanel = new ImageEditorPanelWrapper(app.commands, app.docRegistry);
    prPanel.id = 'imageEditorPanel';
    prPanel.title.caption = 'Image Editor Panel';

    // Let the application restorer track the running panel for restoration
    restorer.add(prPanel, namespace);

    // Add the panel to the sidebar
    app.shell.add(prPanel, 'right', { rank: 1000 });

    return tracker
  }
