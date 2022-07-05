
import { Component, ChangeDetectionStrategy, Input, Inject } from "@angular/core";
import { HttpService } from "src/app/services/http.service";


@Component({
  selector: 'payment',
  templateUrl: './payment-checkout.component.html',
  styleUrls: ['./payment-checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCheckout {

  @Input()
  items = [{id: "booster"}]

  constructor(private http: HttpService){
  }

  ngOnInit() {
  }

  handleSubmit(e: any){
    const req =this.http.post("payment", {"action": "paymentCheckout"})

    req.subscribe((response: any) => {
      console.log("response")
      console.log(response);
      window.location.href = response.checkoutUrl
    })
  }
};