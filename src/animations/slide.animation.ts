import { animate, group, query, style } from "@angular/animations";

export const SlideChildrenLeft = [
  query(
    ':enter, :leave', style({ position: 'absolute', width: '100%' }), {
      optional: true,
    }
  ),
  group([
    query(
      ':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0%)' })),], {
        optional: true,
      }
    ), query(
      ':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(100%)' })),], {
        optional: true,
      }
    )
  ]),
];

export const SlideChildrenRight = [
  query(
    ':enter, :leave', style({ position: 'absolute', width: '100%' }), {
      optional: true,
    }
  ),
  group([
    query(
      ':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0%)' })),], {
        optional: true,
      }
    ), query(
      ':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(100%)' })),], {
        optional: true,
      }
    )
  ]),
];