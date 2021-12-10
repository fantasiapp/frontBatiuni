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
    {id:5,job:"Economiste de la construction", isChecked:false},
    {id:6,job:"Dessinateur technique", isChecked:false},
    {id:7,job:"Conducteur de travaux bâtiment", isChecked:false},
    {id:8,job:"Chef d'équipe BTP", isChecked:false},
    {id:9, job:"Calculateur projeteur en béton armé", isChecked:false},
    {id:10,job:"Technicien Expert VRD", isChecked:false},
    {id:11,job:"Métreur", isChecked:false},
    {id:12,job:"Maître d’œuvre", isChecked:false},
    {id:13,job:"Ingénieur en Génie Civil", isChecked:false},
    {id:14,job:"Géomètre topographe", isChecked:false},
    {id:15,job:"Assistant d’entrepreneur du BTP", isChecked:false},
    {id:16,job:"Aide-conducteur de travaux", isChecked:false},
    {id:17,job:"Acousticien", isChecked:false},
    {id:18,job:"Ingénieur études de prix", isChecked:false},
    {id:19,job:"Peintre décorateur", isChecked:false},
    {id:20,job:"Chef de chantier", isChecked:false},
    {id:21,job:"Conducteur d’engins", isChecked:false},
    {id:22,job:"Agenceur de cuisines et de salles de bains", isChecked:false},
    {id:23,job:"Vitrier", isChecked:false},
    {id:24,job:"Vitrailliste", isChecked:false},
    {id:25,job:"Restaurateur d’art", isChecked:false},
    {id:26,job:"Menuisier", isChecked:false},
    {id:27,job:"Terrassier", isChecked:false},
    {id:28,job:"Maçon", isChecked:false},
    {id:29,job:"Dessinateur-Projeteur", isChecked:false},
    {id:30,job:"Couvreur-zingueur", isChecked:false},
    {id:31,job:"Serrurier", isChecked:false},
    {id:32,job:"Plombier", isChecked:false},
    {id:33,job:"Electricien", isChecked:false},
    {id:34,job:"Chauffagiste", isChecked:false},
    {id:35,job:"Carreleur faïenceur", isChecked:false},
    {id:36,job:"Câbleur", isChecked:false},
    {id:37,job:"Bainiste", isChecked:false},
    {id:38,job:"Collaborateur d’architecte", isChecked:false},
    {id:39,job:"Charpentier", isChecked:false},
    {id:40,job:"Designer", isChecked:false},
    {id:41,job:"Ferronnier d’art", isChecked:false},
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