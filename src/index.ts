import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the image-editor extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'image-editor:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension image-editor is activated!');
  }
};

export default plugin;
