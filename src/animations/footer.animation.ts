import { animate, state, style, transition, trigger } from "@angular/animations";

export const footerTranslate = [
    trigger('footerTranslate', [
      state('false', style({
        transform: 'translateY(100%)'
      })),
      state('true', style({
        transform: 'translateY(0%)'
      })),
      transition('* <=> *', [animate('0s')])
    ])
];