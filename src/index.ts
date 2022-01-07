import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

// import {
//   ICommandPalette
// } from '@jupyterlab/apputils';

import {
  Widget
} from '@lumino/widgets';

// import ImageEditor from 'tui-image-editor';
// import FileSaver from 'file-saver';

/**
 * Initialization data for the image-editor extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'image-editor:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension image-editor is activated!');

    const command = 'image-editor:open-editor';

    app.commands.addCommand(command, {
      label: 'Open Image Editor',
      caption: 'Open the Image Editor',
      isEnabled: () => true,
      execute: () => {

        const content = new Widget();
        content.id = 'image-editor:main-image-editor';
        // const instance = new ImageEditor(content.node, {
        //   cssMaxWidth: 700,
        //   cssMaxHeight: 500,
        //   selectionStyle: {
        //     cornerSize: 20,
        //     rotatingPointOffset: 70,
        //   }
        // });

        app.shell.add(content, 'main');

        // console.log(instance);
      },
    });
  }
};

export default plugin;
