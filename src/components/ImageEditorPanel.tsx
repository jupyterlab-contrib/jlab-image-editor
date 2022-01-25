import { ReactWidget } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { CommandRegistry } from '@lumino/commands';
import { Message } from '@lumino/messaging';
import React, { useState } from 'react';

/**
 * React wrapper to mount and umount the React child component
 * when the widget is shown/hidden.
 *
 * In this case this is particularly interesting to trigger the
 * useEffect of the React widget to update the pull requests list
 * each time the user come back to the panel.
 */
export class ImageEditorPanelWrapper extends ReactWidget {
  constructor(commands: CommandRegistry, docRegistry: DocumentRegistry) {
    super();
    this._commands = commands;
    this._docRegistry = docRegistry;
  }

  onBeforeShow(msg: Message): void {
    super.onBeforeShow(msg);
    this.update();
  }

  onBeforeHide(msg: Message): void {
    super.onBeforeHide(msg);
    this.onBeforeDetach(msg);
  }

  render(): JSX.Element{
    return (
      this.isAttached &&
      this.isVisible ? (
        <ImageEditorPanel
          commands={this._commands}
          docRegistry={this._docRegistry}
        />
    );
  }

  private _commands: CommandRegistry;
  private _docRegistry: DocumentRegistry;
}

/**
 * ImageEditorPanel properties
 */
export interface IImageEditorPanelProps {
  /**
   * Jupyter Front End Commands Registry
   */
  commands: CommandRegistry;
  /**
   * Document registry
   */
  docRegistry: DocumentRegistry;
}


/**
 * ImageEditorPanel component
 *
 * @param props ImageEditorPanel properties
 */
export function ImageEditorPanel(props: IImageEditorPanelProps): JSX.Element {
  const [isCropping, setIsCropping] = useState<boolean>(false);
  // const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const applyCrop = () => {
    props.commands.execute('image-editor:apply-crop');
  }

  const cancelCrop = () => {
    props.commands.execute('image-editor:cancel-crop');
  }

  return (
    <div className="jp-ImageEditorPanel">
      <button onClick={e => {setIsCropping(!isCropping)}}>Crop</button>
      {isCropping ? <button onClick={applyCrop}>Apply</button> : null}
      {isCropping ? <button onClick={cancelCrop}>Cancel</button> : null}
    </div>
  );
}
