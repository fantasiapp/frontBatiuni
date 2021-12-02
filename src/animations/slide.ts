import { trigger, transition, animate, style, state, } from '@angular/animations'

export default function slide({direction, time = 1000}: {
  direction: 'left' | 'right' | 'top' | 'bottom';
  time?: number;
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
      animate(1000)
    ])
  ]);
};