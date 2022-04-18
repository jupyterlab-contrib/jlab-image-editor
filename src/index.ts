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

import { refreshIcon } from '@jupyterlab/ui-components';

import { ImageEditorFactory } from './factory';
import { IImageEditorTracker } from './tokens';
import { ImageEditorWidget } from './widget';
import { brushIcon } from './icons';
import {
  ImageEditorPanelWrapper,
  Operator
} from './components/ImageEditorPanel';

import { addJupyterLabThemeChangeListener } from '@jupyter-notebook/web-components';

const FACTORY = 'ImageEditor';

namespace CommandIDs {
  export const crop = 'image-editor:crop';
  export const applyCrop = 'image-editor:apply-crop';
  export const cancelCrop = 'image-editor:cancel-crop';
  export const openRotate = 'image-editor:open-rotate';
  export const applyRotate = 'image-editor:apply-rotate';
  export const openFilter = 'image-editor:open-filter';
  export const applyFilter = 'image-editor:apply-filter';
  export const openFlip = 'image-editor:open-flip';
  export const applyFlip = 'image-editor:apply-flip';
  export const openDraw = 'image-editor:open-draw';
  export const applyDraw = 'image-editor:apply-draw';
  export const applyClear = 'image-editor:apply-clear';
}

const extension: JupyterFrontEndPlugin<IImageEditorTracker> = {
  id: 'image-editor:plugin',
  autoStart: true,
  optional: [ILayoutRestorer, ICommandPalette],
  provides: IImageEditorTracker,
  activate
};

export default extension;

function activate(
  app: JupyterFrontEnd,
  restorer: ILayoutRestorer | null,
  palette: ICommandPalette | null
): IImageEditorTracker {
  const namespace = 'image-editor';
  const tracker = new WidgetTracker<DocumentWidget<ImageEditorWidget>>({
    namespace
  });
  addJupyterLabThemeChangeListener();

  // Handle state restoration.
  if (restorer) {
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
      return [
        {
          name: CommandIDs.crop,
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: CommandIDs.crop,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.openRotate,
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: CommandIDs.openRotate,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: 'docmanager:save-as',
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: 'docmanager:save-as',
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.openFilter,
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: CommandIDs.openFilter,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.openFlip,
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: CommandIDs.openFlip,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.openDraw,
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: CommandIDs.openDraw,
            args: {
              toolbar: true
            }
          })
        },
        {
          name: CommandIDs.applyClear,
          widget: new CommandToolbarButton({
            commands: app.commands,
            id: CommandIDs.applyClear,
            args: {
              toolbar: true
            }
          })
        }
      ];
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

  app.commands.addCommand(CommandIDs.openRotate, {
    label: args => (args?.toolbar ? 'Rotate' : 'Open Rotate'),
    icon: refreshIcon,
    execute: () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      prPanel.operation = Operator.Rotate;
      app.shell.activateById(prPanel.id);
    }
  });

  app.commands.addCommand(CommandIDs.applyRotate, {
    label: args => (args?.toolbar ? 'Apply Rotate' : 'Apply Rotate'),
    icon: refreshIcon,
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      widget.content.applyRotate(args.type as string);
    }
  });

  app.commands.addCommand(CommandIDs.crop, {
    label: args => (args?.toolbar ? 'Crop' : 'Crop'),
    execute: () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      prPanel.operation = Operator.Crop;
      app.shell.activateById(prPanel.id);
      widget.content.crop();
    }
  });

  app.commands.addCommand(CommandIDs.openFilter, {
    label: args => (args?.toolbar ? 'Filter' : 'Filter'),
    execute: () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      prPanel.operation = Operator.Filter;
      app.shell.activateById(prPanel.id);
    }
  });

  app.commands.addCommand(CommandIDs.applyFilter, {
    label: args => (args?.toolbar ? 'Apply Filter' : 'Apply Filter'),
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      widget.content.filter(args.type as string, args.options);
    }
  });

  app.commands.addCommand(CommandIDs.openFlip, {
    label: args => (args?.toolbar ? 'Flip' : 'Flip'),
    execute: () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      prPanel.operation = Operator.Flip;
      app.shell.activateById(prPanel.id);
    }
  });

  app.commands.addCommand(CommandIDs.applyFlip, {
    label: args => (args?.toolbar ? 'Apply Flip' : 'Apply Flip'),
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      widget.content.flip(args.type as string);
    }
  });

  app.commands.addCommand(CommandIDs.openDraw, {
    label: args => (args?.toolbar ? 'Draw' : 'Draw'),
    execute: () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      prPanel.operation = Operator.Draw;
      app.shell.activateById(prPanel.id);
    }
  });

  app.commands.addCommand(CommandIDs.applyDraw, {
    label: args => (args?.toolbar ? 'Apply Draw' : 'Apply Draw'),
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      widget.content.draw(args.type as string, args.color as string);
    }
  });

  app.commands.addCommand(CommandIDs.applyClear, {
    label: args => (args?.toolbar ? 'Clear' : 'Apply Clear'),
    execute: args => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      widget.content.clear();
    }
  });

  app.commands.addCommand(CommandIDs.applyCrop, {
    label: args => (args?.toolbar ? 'Apply' : 'Apply Crop'),
    execute: async () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      await widget.content.applyCrop();
    }
  });

  app.commands.addCommand(CommandIDs.cancelCrop, {
    label: args => (args?.toolbar ? 'Cancel' : 'Cancel Crop'),
    execute: () => {
      const widget = tracker.currentWidget;

      if (!widget) {
        return;
      }
      widget.content.cancelCrop();
    }
  });

  if (palette) {
    palette.addItem({
      command: CommandIDs.openRotate,
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
    palette.addItem({
      command: CommandIDs.openFilter,
      category: 'Image Editor Operations'
    });
    palette.addItem({
      command: CommandIDs.openFlip,
      category: 'Image Editor Operations'
    });
    palette.addItem({
      command: CommandIDs.openDraw,
      category: 'Image Editor Operations'
    });
    palette.addItem({
      command: CommandIDs.applyClear,
      category: 'Image Editor Operations'
    });
  }

  const prPanel = new ImageEditorPanelWrapper(app.commands, app.docRegistry);
  prPanel.id = 'imageEditorPanel';
  prPanel.title.icon = brushIcon;
  prPanel.title.caption = 'Image Editor Panel';

  // Let the application restorer track the running panel for restoration
  if (restorer) {
    restorer.add(prPanel, namespace);
  }

  // Add the panel to the sidebar
  app.shell.add(prPanel, 'left', { rank: 1000 });

  return tracker;
}
