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
    this._operation = null;
  }

  private _operation : Operator | null;
  public get operation(): Operator | null {
    return this._operation
  }
  public set operation(v: Operator | null) {
    this._operation = v;
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
          operation={this.operation}
          setOperation={(v) => {this.operation = v;}}
        />
    ) : null);
  }

  private _commands: CommandRegistry;
  private _docRegistry: DocumentRegistry;
}


export enum Operator {
  Crop,
  Filter,
  Flip,
  Rotate
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
  operation: Operator | null;
  setOperation: (v: Operator | null) => void;
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
    props.setOperation(null);
    props.commands.execute('application:toggle-left-area');
  }

  const cancelCrop = () => {
    props.commands.execute('image-editor:cancel-crop');
    props.setOperation(null);
    props.commands.execute('application:toggle-left-area');
  }

  const applyFilter = (type: string, options: any) => {
    props.commands.execute('image-editor:apply-filter', {type, options});
  }

  const applyFlip = (type: string) => {
    props.commands.execute('image-editor:apply-flip', {type});
  }

  const applyRotate = (type: string) => {
    props.commands.execute('image-editor:apply-rotate', {type});
  }

  let child: React.ReactNode = null;

  switch (props.operation) {
    case Operator.Crop:
      child = [<button onClick={applyCrop}>Apply</button>, <button onClick={cancelCrop}>Cancel</button>]
      break;
    case Operator.Filter:
      child = [<button onClick={() => applyFilter('Grayscale', null)}>Grayscale</button>,
                <button onClick={() => applyFilter('Invert', null)}>Invert</button>,
                <button onClick={() => applyFilter('Sepia', null)}>Sepia</button>,
                <button onClick={() => applyFilter('vintage', null)}>Sepia2</button>,
                <button onClick={() => applyFilter('Blur', { blur: 0.1 })}>Blur</button>,
                <button onClick={() => applyFilter('Sharpen', null)}>Sharpen</button>,
                <button onClick={() => applyFilter('Emboss', null)}>Emboss</button>
              ]
      break;
    case Operator.Flip:
      child = [<button onClick={() => applyFlip('X')}>FlipX</button>,
                <button onClick={() => applyFlip('Y')}>FlipY</button>,
                <button onClick={() => applyFlip('reset')}>Reset</button>
              ]
      break;
    case Operator.Rotate:
      child = [<button onClick={() => applyRotate('clock')}>Clockwise</button>,
                <button onClick={() => applyRotate('counter')}>Counter-Clockwise</button>
              ]
      break
    default:
      child = "No advanced options to show."
      break;
  }

  return (
    <div className="jp-ImageEditorPanel">
      {child}
    </div>
  );
}
