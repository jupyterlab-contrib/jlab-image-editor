import { Button } from '@jupyter-notebook/react-components';
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
    this._operation = null;
  }

  private _operation: Operator | null;
  public get operation(): Operator | null {
    return this._operation;
  }
  public set operation(v: Operator | null) {
    this._operation = v;
    this.update();
  }

  onBeforeShow(msg: Message): void {
    super.onBeforeShow(msg);
    this.update();
  }

  render(): JSX.Element | null {
    return this.isAttached && this.isVisible ? (
      <ImageEditorPanel
        commands={this._commands}
        docRegistry={this._docRegistry}
        operation={this.operation}
        setOperation={v => {
          this.operation = v;
        }}
      />
    ) : null;
  }

  private _commands: CommandRegistry;
  private _docRegistry: DocumentRegistry;
}

export enum Operator {
  Crop,
  Filter,
  Flip,
  Rotate,
  Draw,
  Clear
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
  const [brushColor, setBrushColor] = useState<string>('#000000');
  const [drawingType, setDrawingType] = useState<
    'freeDrawing' | 'straightLine' | null
  >(null);

  const applyCrop = () => {
    props.commands.execute('image-editor:apply-crop');
    props.setOperation(null);
    props.commands.execute('application:toggle-left-area');
  };

  const cancelCrop = () => {
    props.commands.execute('image-editor:cancel-crop');
    props.setOperation(null);
    props.commands.execute('application:toggle-left-area');
  };

  const applyFilter = (type: string, options: any) => {
    props.commands.execute('image-editor:apply-filter', { type, options });
  };

  const applyFlip = (type: string) => {
    props.commands.execute('image-editor:apply-flip', { type });
  };

  const applyRotate = (type: string) => {
    props.commands.execute('image-editor:apply-rotate', { type });
  };

  const applyDraw = (
    type: 'freeDrawing' | 'straightLine' | null,
    color: string
  ) => {
    if (type !== null) {
      setDrawingType(type);
      props.commands.execute('image-editor:apply-draw', { type, color });
    }
  };

  const applyClear = () => {
    props.commands.execute('image-editor:apply-clear');
  };

  let child: React.ReactNode = null;

  switch (props.operation) {
    case Operator.Crop:
      child = [
        <Button appearance="accent" onClick={applyCrop}>
          Apply
        </Button>,
        <Button appearance="neutral" onClick={cancelCrop}>
          Cancel
        </Button>
      ];
      break;
    case Operator.Filter:
      child = [
        <Button
          appearance="neutral"
          onClick={() => applyFilter('Grayscale', null)}
        >
          Grayscale
        </Button>,
        <Button
          appearance="neutral"
          onClick={() => applyFilter('Invert', null)}
        >
          Invert
        </Button>,
        <Button appearance="neutral" onClick={() => applyFilter('Sepia', null)}>
          Sepia
        </Button>,
        <Button
          appearance="neutral"
          onClick={() => applyFilter('vintage', null)}
        >
          Sepia2
        </Button>,
        <Button
          appearance="neutral"
          onClick={() => applyFilter('Blur', { blur: 0.1 })}
        >
          Blur
        </Button>,
        <Button
          appearance="neutral"
          onClick={() => applyFilter('Sharpen', null)}
        >
          Sharpen
        </Button>,
        <Button
          appearance="neutral"
          onClick={() => applyFilter('Emboss', null)}
        >
          Emboss
        </Button>
      ];
      break;
    case Operator.Flip:
      child = [
        <Button appearance="neutral" onClick={() => applyFlip('X')}>
          FlipX
        </Button>,
        <Button appearance="neutral" onClick={() => applyFlip('Y')}>
          FlipY
        </Button>,
        <Button appearance="neutral" onClick={() => applyFlip('reset')}>
          Reset
        </Button>
      ];
      break;
    case Operator.Rotate:
      child = [
        <Button appearance="neutral" onClick={() => applyRotate('clock')}>
          Clockwise
        </Button>,
        <Button appearance="neutral" onClick={() => applyRotate('counter')}>
          Counter-Clockwise
        </Button>
      ];
      break;
    case Operator.Draw:
      child = [
        <Button
          appearance={drawingType === 'freeDrawing' ? 'accent' : 'neutral'}
          onClick={() => applyDraw('freeDrawing', brushColor)}
        >
          Free Drawing
        </Button>,
        <Button
          appearance={drawingType === 'straightLine' ? 'accent' : 'neutral'}
          onClick={() => applyDraw('straightLine', brushColor)}
        >
          Straight Line
        </Button>,
        <label className="pickColor">
          Pick Color
          <input
            type="color"
            value={brushColor}
            onChange={e => {
              setBrushColor(e.target.value);
              applyDraw(drawingType, e.target.value);
            }}
          />
        </label>
      ];
      break;
    case Operator.Clear:
      child = (
        <Button appearance="neutral" onClick={applyClear}>
          Clear
        </Button>
      );
      break;
    default:
      child = 'No advanced options to show.';
  }

  return <div className="jp-ImageEditorPanel">{child}</div>;
}
