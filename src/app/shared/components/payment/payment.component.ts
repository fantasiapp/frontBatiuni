import { DOCUMENT, Location } from "@angular/common";
import { Component, ChangeDetectionStrategy, Input, Inject, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { Navigate } from "@ngxs/router-plugin";
import { Store } from "@ngxs/store";
import { loadStripe } from "@stripe/stripe-js";
import { HttpService } from "src/app/services/http.service";
import { environment } from "src/environments/environment";
import { DataQueries } from "src/models/new/data.state";
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
    private location: Location,
    private info: InfoService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      this.state = navigation.extras.state;
    }
  }

  ngOnInit() {
    console.log('state', this.state)
    if (!this.state) {
      this.router.navigate(['home']);
    } else {
      this.enableStripe();
    }
  }

  async enableStripe() {
    let stripePublicKey: string = "";
    switch (environment.backUrl[environment.backUrl.length - 1]){
      case '1': //work
        stripePublicKey = "pk_test_51LI7VAENZMpowJJs4IU6aHmyl7zySnvOTAxPifeOOGoauUw7tnkc2kV2QIkhwuzTyD1Ck1yQfzLj8uj2b8FYO4Yd00PBR2hrwB";
        break;
      case '2': //current
        stripePublicKey = "pk_test_51LI7eOIb3fLk25W9IACp2g2UCSAdGG3tE023c9TjXACEj3JC8tFjNMyOSDM42PjOJiMTR1Hv3oAg24Km0UwuvJ8900l1uh4TEq";
        break;
      case '3': //distrib
        stripePublicKey = "pk_test_51LI7spCFcn8ExoZNdTcJOSmzMDsIJWNg6StjlFDWLBQB4PSc9zm4ynlaMkidpqrx3E5wGA1HyG7DdlyG5Z31eZgw00M1AOHpBJ";
        break;
      case '4': //temp
        stripePublicKey = "pk_test_51LI7b7GPflszP2pB9SHmOB0ma7N1zgoX5W0uBCIF2j22I8lqE5WgqBFLJA34D75UHlJGHzZhfMfSiUm2R9wO0Aos000EW2okEq";
        break;
    }
    console.log("stripe public key", stripePublicKey)
    this.stripe = await loadStripe(stripePublicKey);
    console.log("stripe loaded", this.stripe);
    this.initialize();
  }

  // Fetches a payment intent and captures the client secret
  initialize() {
    const req = this.http.post("payment", {
                      'action':'createPaymentIntent', 
                      'product': this.state.product,
                      'post': this.state.post,
                      'duration': this.state.duration
                    });
    console.log("requete")
    req.subscribe((response: any) => {
      console.log("response", response.toString())
      if (response['createPaymentIntent'] !== "OK") { 
        console.log("error, navigate home")
        this.info.show("error", "Un problème est survenu")
        this.router.navigate(['home'])
        return;
      } 
      this.product = response['productName'];
      this.price = response['price']/100;


      console.log("productName", this.product)
      console.log("price", this.price)

      this.cd.markForCheck();
      let clientSecret = response.clientSecret

      console.log("client secret", clientSecret);
  
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
    console.log("return url", returnUrl)

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: returnUrl,
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
};