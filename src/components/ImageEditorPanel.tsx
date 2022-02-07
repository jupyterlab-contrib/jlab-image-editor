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
    this._isFilter = false;
    this._isFlip = false;
    this._isRotate = false;
  }

  private _isCropping : boolean;
  public get isCropping() : boolean {
    return this._isCropping;
  }
  public set isCropping(v : boolean) {
    this._isCropping = v;
    this.update();
  }
  
  private _isFilter : boolean;
  public get isFilter() : boolean {
    return this._isFilter;
  }
  public set isFilter(v : boolean) {
    this._isFilter = v;
    this.update();
  }

  private _isFlip : boolean;
  public get isFlip() : boolean {
    return this._isFlip;
  }
  public set isFlip(v : boolean) {
    this._isFlip = v;
    this.update();
  }

  private _isRotate : boolean;
  public get isRotate() : boolean {
    return this._isRotate;
  }
  public set isRotate(v : boolean) {
    this._isRotate = v;
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
          isFilter={this.isFilter}
          setIsFilter={(v) => {this.isFilter = v;}}
          isFlip={this.isFlip}
          setIsFlip={(v) => {this.isFlip = v;}}
          isRotate={this.isRotate}
          setIsRotate={(v) => {this.isRotate = v;}}
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
  isFilter: boolean;
  setIsFilter: (v: boolean) => void;
  isFlip: boolean;
  setIsFlip: (v: boolean) => void;
  isRotate: boolean;
  setIsRotate: (v: boolean) => void;
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

  const applyFilter = (type: string, options: any) => {
    props.commands.execute('image-editor:apply-filter', {type, options});
  }

  const applyFlip = (type: string) => {
    props.commands.execute('image-editor:apply-flip', {type});
  }

  const applyRotate = (type: string) => {
    props.commands.execute('image-editor:apply-rotate', {type});
  }

  return (
    <div className="jp-ImageEditorPanel">
      {props.isCropping ? <button onClick={applyCrop}>Apply</button> : null}
      {props.isCropping ? <button onClick={cancelCrop}>Cancel</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('Grayscale', null)}>Grayscale</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('Invert', null)}>Invert</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('Sepia', null)}>Sepia</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('vintage', null)}>Sepia2</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('Blur', { blur: 0.1 })}>Blur</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('Sharpen', null)}>Sharpen</button> : null}
      {props.isFilter ? <button onClick={() => applyFilter('Emboss', null)}>Emboss</button> : null}
      {props.isFlip ? <button onClick={() => applyFlip('X')}>FlipX</button> : null}
      {props.isFlip ? <button onClick={() => applyFlip('Y')}>FlipY</button> : null}
      {props.isFlip ? <button onClick={() => applyFlip('reset')}>Reset</button> : null}
      {props.isRotate ? <button onClick={() => applyRotate('clock')}>Clockwise</button> : null}
      {props.isRotate ? <button onClick={() => applyRotate('counter')}>Counter-Clockwise</button> : null}
      {(!props.isCropping && !props.isFilter && !props.isFlip && !props.isRotate) ? "No advanced options to show." : null}
    </div>
  );
}
