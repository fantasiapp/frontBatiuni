import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { Router } from "@angular/router";
import { StripeService } from "../../services/stripe";


@Component({
  selector: 'payment',
  templateUrl: './paymentStatus.component.html',
  styleUrls: ['./paymentStatus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class paymentStatus {

  stripe: any;

  @Input()
  items = [{id: "booster"}]

  elements: any;

  state: any;

  clientSecret = new URLSearchParams(window.location.search).get(
    'payment_intent_client_secret'
  );

  constructor(
    private router: Router,
    private stripeService: StripeService,
  ) {
    const navigation = this.router.getCurrentNavigation();
  }

  ngOnInit() {
    this.stripe.retrievePaymentIntent(this.clientSecret).then(({paymentIntent}: any) => {
      const message = document.querySelector('#message')!;

      switch (paymentIntent.status) {
        case 'succeeded':
          message.textContent = 'Success! Payment received.';
          break;

        case 'processing':
          message.textContent = "Payment processing. We'll update you when payment is received.";
          break;

        case 'requires_payment_method':
          message.textContent = 'Payment failed. Please try another payment method.';
          // Redirect your user back to your payment page to attempt collecting
          // payment again
          break;

        default:
          message.textContent = 'Something went wrong.';
          break;
      }

    })
  }

  navigateHome(){
    this.router.navigate(['home'])
  }
};