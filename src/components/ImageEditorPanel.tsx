import { ReactWidget } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { CommandRegistry } from '@lumino/commands';
import { Message } from '@lumino/messaging';
import React from 'react';

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
    this._isCropping = false;
  }

  private _isCropping : boolean;
  public get isCropping() : boolean {
    return this._isCropping;
  }
  public set isCropping(v : boolean) {
    this._isCropping = v;
    this.update();
  }
  

  onBeforeShow(msg: Message): void {
    super.onBeforeShow(msg);
    this.update();
  }

  onBeforeHide(msg: Message): void {
    super.onBeforeHide(msg);
    this.onBeforeDetach(msg);
  }

  render(): JSX.Element | null {
    return (
      this.isAttached &&
      this.isVisible ? (
        <ImageEditorPanel
          commands={this._commands}
          docRegistry={this._docRegistry}
          isCropping={this.isCropping}
          setIsCropping={(v) => {this.isCropping = v;}}
        />
    ) : null);
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
  isCropping: boolean;
  setIsCropping: (v: boolean) => void;
}


/**
 * ImageEditorPanel component
 *
 * @param props ImageEditorPanel properties
 */
export function ImageEditorPanel(props: IImageEditorPanelProps): JSX.Element {
  // const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const applyCrop = () => {
    props.commands.execute('image-editor:apply-crop');
    props.setIsCropping(false);
    props.commands.execute('application:toggle-left-area');
  }

  const cancelCrop = () => {
    props.commands.execute('image-editor:cancel-crop');
    props.setIsCropping(false);
    props.commands.execute('application:toggle-left-area');
  }

  return (
    <div className="jp-ImageEditorPanel">
      {props.isCropping ? <button onClick={applyCrop}>Apply</button> : null}
      {props.isCropping ? <button onClick={cancelCrop}>Cancel</button> : null}
      {!props.isCropping ? "No advanced options to show." : null}
    </div>
  );
}
