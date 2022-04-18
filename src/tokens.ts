import { Token } from '@lumino/coreutils';
import { IWidgetTracker } from '@jupyterlab/apputils';
import { DocumentWidget } from '@jupyterlab/docregistry';
import { ImageEditorWidget } from './widget';

export type IImageEditorTracker = IWidgetTracker<
  DocumentWidget<ImageEditorWidget>
>;
export const IImageEditorTracker = new Token<IImageEditorTracker>(
  'image-editor/tracki'
);
