import { DOCUMENT, Location } from "@angular/common";
import { Component, ChangeDetectionStrategy, Input, Inject, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Navigate } from "@ngxs/router-plugin";
import { Store } from "@ngxs/store";
import { loadStripe } from "@stripe/stripe-js";
import { HttpService } from "src/app/services/http.service";
import { environment } from "src/environments/environment";
import { DataQueries } from "src/models/new/data.state";
import { StripeService } from "../../services/stripe";
import { InfoService } from "../info/info.component";
import { PopupService } from "../popup/popup.component";


@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment {


  stripe: any;

  @Input()
  items = [{id: "booster"}]

  elements: any;

  state: any;

  _product: string = "";
  get product(){
    return this._product;
  }
  set product(_product){
    this._product = _product
  }

  _price: number = 0;
  get price(){
    return this._price;
  }
  set price(_price){
    this._price = _price
  }

  constructor(
    private http: HttpService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private cd: ChangeDetectorRef,
    private store: Store,
    private popup: PopupService,
    private location: Location,
    private info: InfoService,
    private stripeService: StripeService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      this.state = navigation.extras.state;
    }
    this.stripe = this.stripeService.stripe;
  }

  ngOnInit() {
    console.log('state', this.state)
    if (!this.state) {
      this.router.navigate(['home']);
    } else {
      let req: any;
      if (this.state.type == 'boost') {
        req = this.createReqBoost();
      } else if (this.state.type == 'subscription') {
        req = this.createReqSubscription();
      }
      this.initialize(req)
    }
  }

  createReqBoost(){
    return this.http.post("payment", {
                      'action':'createPaymentIntent', 
                      'product': this.state.product,
                      'post': this.state.post,
                      'duration': this.state.duration
                    });
  }

  createReqSubscription(){
    return this.http.post("subscription", {
                      'action':'createSubscription', 
                      'product': this.state.product,
                      'priceId': this.state.priceId
                    });
  }

  // Fetches a payment intent and captures the client secret
  initialize(req: any) {
    console.log("requete")
    req.subscribe((response: any) => {
      if (response['createPaymentIntent'] !== "OK" && response['createSubscription'] !== "OK") { 
        console.log("error, navigate home")
        this.info.show("error", "Un problème est survenu")
        this.router.navigate(['home'])
        return;
      } 
      this.product = response['productName'];
      this.price = response['price']/100;

      this.cd.markForCheck();
      let clientSecret = response.clientSecret
  
      const appearance = {
        theme: 'flat',
      };
      this.elements = this.stripe.elements({ appearance, clientSecret });

      const paymentElement = this.elements.create("payment");
      paymentElement.mount("#payment-element");
    })
  }

  async handleSubmit(e: any){
    e.preventDefault();
    this.setLoading(true);

    const user = this.store.selectSnapshot(DataQueries.currentUser)

    //get redirect URL
    const urlTree = this.router.createUrlTree(['home']);
    const path = this.location.prepareExternalUrl(urlTree.toString());
    let returnUrl = window.location.origin + path;

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + "/payment-status",
        receipt_email: user.email,
      }
    })

    console.log("error", error);

    if (error.type === "card_error" || error.type === "validation_error") {
      this.showMessage(error.message)
    } else {
      this.showMessage("unexpected error")
    }

    this.setLoading(false)
  }

  showMessage(messageText: string) {
    console.log("show message", messageText)
    const messageContainer = document.querySelector("#payment-message")!;
  
    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;
  
    console.log(messageContainer);
    setTimeout(function () {
      messageContainer.classList.add("hidden");
      messageContainer.textContent = "";
    }, 4000);
  }
  // Show a spinner on payment submission
  setLoading(isLoading: boolean){
    if (isLoading) {
    // Disable the button and show a spinner
    (this.document.querySelector("#submit")! as HTMLButtonElement).disabled = true;
    this.document.querySelector("#spinner")!.classList.remove("hidden");
    this.document.querySelector("#button-text")!.classList.add("hidden");
  } else {
    (this.document.querySelector("#submit")! as HTMLButtonElement).disabled = false;
    this.document.querySelector("#spinner")!.classList.add("hidden");
    this.document.querySelector("#button-text")!.classList.remove("hidden");
  }
  }

  close(){

  }
};