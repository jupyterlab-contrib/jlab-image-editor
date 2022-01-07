import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import ImageEditor from 'tui-image-editor';
// import FileSaver from 'file-saver';

namespace CommandIDs {
  export const open = 'image-editor:open-editor';
  export const openFile = 'image-editor:open-file';
}

/**
 * Initialization data for the image-editor extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'image-editor:plugin',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    restorer: ILayoutRestorer
  ) => {
    console.log('JupyterLab extension image-editor is activated!');

    let editorPanel: MainAreaWidget | null = null;
    let imageEditor: ImageEditor | null = null;

    // Namespace for the tracker
    const namespace = 'documents-example';
    // Creating the tracker for the document
    const tracker = new WidgetTracker<MainAreaWidget>({ namespace });

    // Handle state restoration.
    if (restorer) {
      // When restoring the app, if the document was open, reopen it
      restorer.restore(tracker, {
        command: CommandIDs.open,
        name: widget => ''
      });
    }

    app.commands.addCommand(CommandIDs.open, {
      label: 'Open Image Editor',
      caption: 'Open the Image Editor',
      isEnabled: () => true,
      execute: () => {
        const content = new Widget();
        content.id = 'ImageEditor-Container';
        editorPanel = new MainAreaWidget({ content });
        editorPanel.title.label = 'Image Editor';

        const node = document.createElement('input');
        node.type = 'file';
        node.onchange = (event: Event) => {
          if (event) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const file = event.target.files[0];
            app.commands.execute(CommandIDs.openFile, { file });
          }
        };
        const input = new Widget({ node });
        editorPanel.toolbar.addItem('Open file into Image Editor', input);

        imageEditor = new ImageEditor(content.node, {
          cssMaxWidth: 700,
          cssMaxHeight: 500,
          selectionStyle: {
            cornerSize: 20,
            rotatingPointOffset: 70
          }
        });

        editorPanel.disposed.connect(() => {
          imageEditor = null;
          editorPanel = null;
        });

        app.shell.add(editorPanel, 'main');
      }
    });

    app.commands.addCommand(CommandIDs.openFile, {
      label: 'Open file into Image Editor',
      caption: 'Open file into Image Editor',
      isEnabled: () => imageEditor !== null,
      isVisible: () => imageEditor !== null,
      execute: args => {
        if (imageEditor !== null && args.file !== null) {
          console.log(args);
          imageEditor.loadImageFromFile(args.file as any).then(result => {
            console.log(result);
            if (imageEditor !== null) {
              imageEditor.clearUndoStack();
            }
          });
        }
      }
    });

    if (palette) {
      palette.addItem({
        command: CommandIDs.open,
        category: 'Image Editor'
      });

      palette.addItem({
        command: CommandIDs.openFile,
        category: 'Image Editor'
      });
    }
  }
};

export default plugin;
