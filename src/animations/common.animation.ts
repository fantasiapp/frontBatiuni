import { style } from "@angular/animations";

//better than position absolute ?
export const animatingStyle = style({
  position: 'absolute',
  left: 0, /*top: '0',*/
  padding: 'inherit',
  height: '100%',
  overflow: 'hidden'
});