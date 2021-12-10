import { Component } from "@angular/core";

@Component({
  selector: 'options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsModel {
  search : string = ''
  showDropDown : Boolean =false;
  Options = [
    {id:1,job:"TCE", isChecked:false},
    {id:2,job:"Cuisiniste" , isChecked:false},
    {id:3,job:"Ingénieur en Aménagement et Urbanisme" , isChecked:false},
    {id:4,job:"Ingénieur d'affaires du BTP" , isChecked:false},
    {id:5,job:"Economiste de la construction", isChecked:false} ,
  ]
  
  optionsSearch  = this.Options
  userChoices : jobs[] = []
  filterOptions(e: Event) {
    let search:string = (e.target as any).value
  
    this.optionsSearch = this.Options.filter(option=>option.job.toLowerCase().includes(search.toLowerCase()))
}
  added(e: Event,id:number) {
    if((e.target as any).checked){
      this.Options[id-1].isChecked = true;
      let listtt = this.Options.filter(option => option.id == id)
      this.userChoices.push(listtt[0])
      // this.optionsSearch = this.optionsSearch.filter(option=>option.id != id); 
      // this.Options = this.Options.filter(option=>option.id != id); 
      }
      if(!(e.target as any).checked){
        this.userChoices = this.userChoices.filter(option => option.id != id)
      }
  }
  delete(e:Event, id:number) {
    this.Options[id-1] = {...this.Options[id-1], isChecked:false}
    let removed = this.userChoices.filter(option => option.id == id)
    this.userChoices = this.userChoices.filter(option => option.id != id)
  }
};
interface jobs{
  id: number 
  job: string
  isChecked:boolean
}