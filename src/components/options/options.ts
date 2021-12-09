import { Component } from "@angular/core";

@Component({
  selector: 'options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsModel {
  search : string = ''
  Options = ['Anas','Hamza','Majed']
  filtred: string[] = this.Options
  filterOptions(e: Event) {
    
    let search:string = (e.target as any).value
    this.filtred = this.Options.filter(option=>option.toLowerCase().includes(search.toLowerCase()))
}
};