import { parseTemplate } from "@angular/compiler";
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { StateContext, Store } from "@ngxs/store";
import { DataModel } from "src/models/new/data.state";
import { SubscribeUser } from "src/models/new/user/user.actions";
import { getUserDataService } from "../../services/getUserData.service";
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
    private getUserDataService: getUserDataService,
    private store: Store,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.stripe = this.stripeService.stripe;
  }

  ngOnInit(ctx: StateContext<DataModel>) {
    this.stripe.retrievePaymentIntent(this.clientSecret).then(({paymentIntent}: any) => {
      const message = document.querySelector('#message')!;
      this.message = paymentIntent.status;
      if (this.message == "succeeded" && paymentIntent.description == "Subscription creation") {
        this.store.dispatch(new SubscribeUser())
      } 
      this.cd.markForCheck();

    })
  }

  navigateHome(){
    this.router.navigate(['home'])
  }
};