import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})


export class StripeService {

  stripe: any;
  isInitiated: boolean = false;

  constructor(private store: Store) {
    this.init()
  }

  init(){
    console.log("init stripe service")
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
    console.log("stripe public key", stripePublicKey)
    this.stripe = await loadStripe(stripePublicKey);
    console.log("stripe loaded", this.stripe);
  }
}

