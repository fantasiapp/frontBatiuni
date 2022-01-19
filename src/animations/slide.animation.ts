import { animate, group, query, style } from "@angular/animations";
import { animatingStyle } from "./common.animation";

export const SlideChildrenLeft = [
  query(
    ':enter, :leave', animatingStyle, {
      optional: true,
    }
  ),
  group([
    query(
      ':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('200ms 100ms ease-out', style({ transform: 'translateX(0%)' })),], {
        optional: true,
      }
    ), query(
      ':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('200ms 50ms ease-out', style({ transform: 'translateX(100%)' })),], {
        optional: true,
      }
    )
  ]),
];

export const SlideChildrenRight = [
  query(
    ':enter, :leave', animatingStyle, {
      optional: true,
    }
  ),
  group([
    query(
      ':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms 50ms ease-out', style({ transform: 'translateX(0%)' })),], {
        optional: true,
      }
    ), query(
      ':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('200ms 50ms ease-out', style({ transform: 'translateX(-100%)' })),], {
        optional: true,
      }
    )
  ]),
];