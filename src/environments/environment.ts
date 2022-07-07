export const environment = {
  production: false,
  backUrl: "https://batiuni.fantasiapp.tech:5001",
  // backUrl: 'http://localhost:8000',
  version: "current",
  firebase: {
    apiKey: "AIzaSyAMVlZ-T4vt6YgMXRoIiTTVTtH5VwDvukk",
    authDomain: "batiuni-8cd43.firebaseapp.com",
    projectId: "batiuni-8cd43",
    storageBucket: "batiuni-8cd43.appspot.com",
    messagingSenderId: "22329345218",
    appId: "1:22329345218:web:03e1d61a808b6d4364a75b",
    measurementId: "G-5T8VEBRJ80",
    vapidKey: "BOE-EvJVFUEDNSlBO2n-64sxMoUyD3ADlAyD5ZsXEAzSrsocZkivkBH-dM5USsl5rUOTtq9iQ4HWZh5EAKDRjuo",
  }
};

let temp = {boost3: "",
boost7: "",
boost0: "",};

switch (environment.backUrl[environment.backUrl.length - 1]) {
  case "1":
    temp = {
      boost3: "prod_M0BREvMmK263p4",
      boost7: "prod_M0BRA3MiH6A92x",
      boost0: "prod_M0BR3WcVYr4za8",
    };
    break;
  case "2":
    temp = {
      boost3: "prod_M0V2RzWQAHxQtX",
      boost7: "prod_M0V3Ao15zvtPjL",
      boost0: "prod_M0V3LGtyd1G8QX",
    };
    break;
  case "3":
    temp = {
      boost3: "prod_M0V7ybe5P6pl7Q",
      boost7: "prod_M0V7dhGlCfSemw",
      boost0: "prod_M0V8V6gkS4484n",
    };
    break;
  case "4":
    temp = {
      boost3: "prod_M0BtJQKNIQBjvF",
      boost7: "prod_M0BuvRUprcxujw",
      boost0: "prod_M0BuUhllo4RnKr",
    };
    break;
}

export const productList = temp;