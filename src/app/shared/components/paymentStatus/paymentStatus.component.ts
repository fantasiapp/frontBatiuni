import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { StripeService } from "../../services/stripe";


@Component({
  selector: 'payment',
  templateUrl: './paymentStatus.component.html',
  styleUrls: ['./paymentStatus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStatus {

  stripe: any;

  message: string = "";
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
    private cd: ChangeDetectorRef,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.stripe = this.stripeService.stripe;
  }

  ngOnInit() {
    this.stripe.retrievePaymentIntent(this.clientSecret).then(({paymentIntent}: any) => {
      const message = document.querySelector('#message')!;
      this.message = paymentIntent.status;
      this.cd.markForCheck();

    })
  }

  navigateHome(){
    this.router.navigate(['home'])
  }
};