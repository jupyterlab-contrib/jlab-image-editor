import { Token } from '@lumino/coreutils';
import { IWidgetTracker } from '@jupyterlab/apputils';
import { ImageEditorDocumentWidget } from './editor';


type IImageEditorTracker = IWidgetTracker<ImageEditorDocumentWidget>;
export const IImageEditorTracker = new Token<IImageEditorTracker>('image-editor/tracki');
