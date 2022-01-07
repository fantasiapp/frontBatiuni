export class Mapping {
    userData : any;
    companyData : any;
    constructor(private data: any) {
        let userKey = Object.keys(data.UserprofileValues)
        let companyKey = Object.keys(data.CompanyValues)
        this.userData = this.zip(data.UserprofileFields, data.UserprofileValues,userKey[0])
        this.companyData = this.zip(data.CompanyFields, data.CompanyValues,companyKey[0])
    }
    
    zip(param :any, param2: any,key:any){
        return param.map((item:any,id:any)=>({[item]:param2[key][id]}))
    }
}


