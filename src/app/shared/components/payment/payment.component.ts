import { DOCUMENT } from "@angular/common";
import { Component, ChangeDetectionStrategy, Input, Inject } from "@angular/core";
// import { loadStripe } from "@stripe/stripe-js";
import { HttpService } from "src/app/services/http.service";


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
    // this.stripe = await loadStripe("pk_test_51LDlcoAdZaSfQS2YnaAxXmcMVSuiUoWC1PSBzclR9QJRgYFxviIAevlu18bWrZ5jnI0A2snkqEqHt1YOlZnSnuWa00FhcebxRK");
    console.log("stripe loaded", this.stripe);
    this.initialize();
  }

  // Fetches a payment intent and captures the client secret
  initialize() {
    const req = this.http.post("create-payment-intent", {'action':'payment'});
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