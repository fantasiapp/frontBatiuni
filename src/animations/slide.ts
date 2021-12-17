import { trigger, transition, animate, style, state, } from '@angular/animations'

//refactor into keyframes

export default function slide({direction, time = '1s'}: {
  direction: 'left' | 'right' | 'top' | 'bottom';
  time?: string;
}) {
  let transform = '';
  switch ( direction ) {
    case 'left':
      transform = 'translate(-100%, 0)';
      break;
    case 'right':
      transform = 'translate(100%, 0)';
      break;
    case 'top':
      transform = 'translate(0, -100%)';
      break;
    case 'bottom':
      transform = 'translate(0, 100%)';
      break;
  };

  return trigger('slide-' + direction, [
    state('void', style({transform})),
    transition(':enter, :leave', [
      animate(time)
    ])
  ]);
};