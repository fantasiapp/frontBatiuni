import { animate, group, query, style } from "@angular/animations";

export const FadeIn = [
  query(
    ':enter, :leave', style({ position: 'absolute' }), {
      optional: true,
    }
  ),
  group([
    query(
      ':enter', [
        style({ opacity: '0' }),
        animate('200ms 50ms ease-out', style({ opacity: '1' })),], {
        optional: true,
      }
    ), query(
      ':leave', [
        style({ opacity: '1' }),
        animate('200ms 50ms ease-out', style({ opacity: '0' })),], {
        optional: true,
      }
    )
  ]),
];