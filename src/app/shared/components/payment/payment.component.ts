import { DOCUMENT } from "@angular/common";
import { Component, ChangeDetectionStrategy, Input, Inject } from "@angular/core";
import { loadStripe } from "@stripe/stripe-js";
import { HttpService } from "src/app/services/http.service";
import { environment } from "src/environments/environment";


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

  constructor(
    private http: HttpService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.enableStripe();
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
    this.stripe = await loadStripe(stripePublicKey);
    console.log("stripe loaded", this.stripe);
    this.initialize();
  }

  // Fetches a payment intent and captures the client secret
  initialize() {
    const req = this.http.post("payment", {'action':'createPaymentIntent'});
    console.log("requete")
    req.subscribe((response: any) => {
      console.log("response", response)
      
      let clientSecret = response.clientSecret

      console.log("client secret", clientSecret);
  
      const appearance = {
        theme: 'stripe',
      };
      this.elements = this.stripe.elements({ appearance, clientSecret });
  
      const paymentElement = this.elements.create("payment");
      paymentElement.mount("#payment-element");
    })
  }

  async handleSubmit(e: any){
    e.preventDefault();
    this.setLoading(true);

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: "http://localhost:4200/home"
      }
    })

    if (error.type === "card_error" || error.type === "validation_error") {
      console.log("erreur", error.messages)
    } else {
      console.log("unexpected error")
    }
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