import { environment } from "../environments/environment";

let temp = {
    boost3: "",
    boost7: "",
    boost0: "",
    subscriptionST: "",
    subscriptionPME: "",
    subscriptionSTPME: "",
  };
  switch (environment.backUrl[environment.backUrl.length - 1]) {
    case "1":
      temp = {
        boost3: "prod_M0BREvMmK263p4",
        boost7: "prod_M0BRA3MiH6A92x",
        boost0: "prod_M0BR3WcVYr4za8",
        subscriptionST: "prod_M0wwP5ZavsuY90",
        subscriptionPME: "prod_M0wLzHMEIAgYlP",
        subscriptionSTPME: "prod_M53uZdeJXKtOBm",
      };
      break;
    case "2":
      temp = {
        boost3: "prod_M0V2RzWQAHxQtX",
        boost7: "prod_M0V3Ao15zvtPjL",
        boost0: "prod_M0V3LGtyd1G8QX",
        subscriptionST: "prod_M5jxsLfSFiLF5F",
        subscriptionPME: "prod_M5jyKu2Ws2WlHA",
        subscriptionSTPME: "prod_M5k2y2IbTz0GzA",
      };
      break;
    case "3":
      temp = {
        boost3: "prod_M0V7ybe5P6pl7Q",
        boost7: "prod_M0V7dhGlCfSemw",
        boost0: "prod_M0V8V6gkS4484n",
        subscriptionST: "",
        subscriptionPME: "",
        subscriptionSTPME: "",
      };
      break;
    case "4":
      temp = {
        boost3: "prod_M0BtJQKNIQBjvF",
        boost7: "prod_M0BuvRUprcxujw",
        boost0: "prod_M0BuUhllo4RnKr",
        subscriptionST: "",
        subscriptionPME: "",
        subscriptionSTPME: "",
      };
      break;
  }
  
  export const productList = temp;