"use strict";(self.webpackChunkbatiuni=self.webpackChunkbatiuni||[]).push([[811],{7811:(y,d,o)=>{o.r(d),o.d(d,{DeviceWeb:()=>w});var a=o(8239),v=o(8384);class w extends v.Uw{getId(){var e=this;return(0,a.Z)(function*(){return{uuid:e.getUid()}})()}getInfo(){var e=this;return(0,a.Z)(function*(){if("undefined"==typeof navigator||!navigator.userAgent)throw e.unavailable("Device API not available in this browser");const i=navigator.userAgent,s=e.parseUa(i);return{model:s.model,platform:"web",operatingSystem:s.operatingSystem,osVersion:s.osVersion,manufacturer:navigator.vendor,isVirtual:!1,webViewVersion:s.browserVersion}})()}getBatteryInfo(){var e=this;return(0,a.Z)(function*(){if("undefined"==typeof navigator||!navigator.getBattery)throw e.unavailable("Device API not available in this browser");let i={};try{i=yield navigator.getBattery()}catch(s){}return{batteryLevel:i.level,isCharging:i.charging}})()}getLanguageCode(){return(0,a.Z)(function*(){return{value:navigator.language}})()}parseUa(e){const i={},s=e.indexOf("(")+1;let c=e.indexOf(") AppleWebKit");-1!==e.indexOf(") Gecko")&&(c=e.indexOf(") Gecko"));const n=e.substring(s,c);if(-1!==e.indexOf("Android")){const t=n.replace("; wv","").split("; ").pop();t&&(i.model=t.split(" Build")[0]),i.osVersion=n.split("; ")[1]}else if(i.model=n.split("; ")[0],"undefined"!=typeof navigator&&navigator.oscpu)i.osVersion=navigator.oscpu;else if(-1!==e.indexOf("Windows"))i.osVersion=n;else{const t=n.split("; ").pop();if(t){const r=t.replace(" like Mac OS X","").split(" ");i.osVersion=r[r.length-1].replace(/_/g,".")}}i.operatingSystem=/android/i.test(e)?"android":/iPad|iPhone|iPod/.test(e)&&!window.MSStream?"ios":/Win/.test(e)?"windows":/Mac/i.test(e)?"mac":"unknown";const m=!!window.InstallTrigger,f=!!window.ApplePaySession,h=!!window.chrome,g=/Edg/.test(e),u=/FxiOS/.test(e),p=/CriOS/.test(e),x=/EdgiOS/.test(e);if(f||h&&!g||u||p||x){let t;t=u?"FxiOS":p?"CriOS":x?"EdgiOS":f?"Version":"Chrome";const r=e.split(" ");for(const l of r)if(l.includes(t)){const S=l.split("/")[1];i.browserVersion=S}}else if(m||g){const l=e.split("").reverse().join("").split("/")[0].split("").reverse().join("");i.browserVersion=l}return i}getUid(){if("undefined"!=typeof window){let e=window.localStorage.getItem("_capuid");return e||(e=this.uuid4(),window.localStorage.setItem("_capuid",e),e)}return this.uuid4()}uuid4(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){const i=16*Math.random()|0;return("x"===e?i:3&i|8).toString(16)})}}}}]);