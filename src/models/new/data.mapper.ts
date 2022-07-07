import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { DataTypes } from "./data.interfaces";
import { addValues, addRecord, update } from "./state.operators";
import { patch } from "@ngxs/store/operators";
import { Availability } from "src/app/shared/components/calendar/calendar.ui";

export type Alias = "FavoritePost" | "ViewPost";
export type TranslatedName = DataTypes | Alias | "userName";

export const NameMapping: { [key in TranslatedName]?: string } = {
  JobForCompany: "jobs",
  LabelForCompany: "labels",
  Role: "role",
  Job: "job",
  Label: "label",
  UserProfile: "user",
  Company: "company",
  File: "files",
  Post: "posts",
  userName: "username",
  Candidate: "candidates",
  DetailedPost: "details",
  Supervision: "supervisions",
  Disponibility: "availabilities",
  Mission: "missions",
  DatePost: "dates",
} as const;

const ReverseMapping = {
  jobs: "JobForCompany",
  labels: "LabelForCompany",
  role: "Role",
  job: "Job",
  label: "Label",
  labelNew: 'LabelNew',
  user: "UserProfile",
  company: "Company",
  files: "File",
  file: "File",
  posts: "Post",
  username: "userName",
  candidates: "Candidate",
  details: "DetailedPost",
  supervisions: "Supervision",
  availabilities: "Disponibility",
  missions: "Mission",
  dates: "DatePost",
} as const;

//build type system for the field array
//force types on the functions that manipulates them
type PropertyMapping = typeof ReverseMapping;
export type OriginalName<T> = T extends keyof PropertyMapping
  ? PropertyMapping[T]
  : T;

export function getOriginalName(name: string) {
  return ReverseMapping[name as keyof PropertyMapping] || name;
}

export function availabilityToName(availability: Availability) {
  if (availability == "available") return "Disponible";
  else if (availability == "availablelimits")
    return "Disponible Sous Conditions";
  else if (availability == "unavailable") return "Non Disponible";

  return availability;
}

export function nameToAvailability(
  name: "Disponible" | "Disponible Sous Conditions" | "Non Disponible"
): Exclude<Availability, "selected" | "nothing"> {
  if (name == "Disponible") return "available";
  else if (name == "Disponible Sous Conditions") return "availablelimits";
  else return "unavailable";
}

@Injectable({
  providedIn: "root",
})
export class DataReader {
  constructor(private store: Store) {}

  getFieldIndex(data: any, type: DataTypes, child: DataTypes) {
    //HACK
    return data[type + "Fields"].indexOf(child);
  }

  getValueById(data: any, type: DataTypes, id: number) {
    return data[type + "Values"][id];
  }

  getField(data: any, type: DataTypes, id: number, child: DataTypes) {
    const index = this.getFieldIndex(data, type, child);
    return this.getValueById(data, type, id)[index];
  }

  readCurrentUserId(data: any) {
    return data["currentUser"];
  }

  readCurrentUser(data: any) {
    const id = this.readCurrentUserId(data);
    return this.getValueById(data, "UserProfile", id);
  }

  readCurrentCompanyId(data: any) {
    const userId = this.readCurrentUserId(data);
    return this.getField(data, "UserProfile", userId, "Company");
  }

  readCurrentCompany(data: any) {
    const id = this.readCurrentCompanyId(data);
    return this.getValueById(data, "Company", id);
  }

  readStaticData(data: any) {
    
    const suffix = "Values",
      keys = Object.keys(data).filter(key => key.endsWith('Values')),
      names = keys.map((key) => key.slice(0, -suffix.length)) as DataTypes[],
      operations = names.map((name, i) => {
        const records = data.hasOwnProperty(name + 'Fields') ? data[name+'Fields']: ['name']
        return addRecord(name, records,data[keys[i]])
      });

    return operations;
  }

  readInitialData(data: any) {
    const suffix = "Values",
      keys = Object.keys(data).filter((key) => key.endsWith("Values")),
      names = keys.map((key) => key.slice(0, -suffix.length)) as DataTypes[],
      operations = names.map((name, i) =>
        addRecord(name, data[name + "Fields"], data[keys[i]])
      );

    return operations;
  }

  readCurrentSession(data: any) {
    const companyId = this.readCurrentCompanyId(data),
      roles = this.getField(data, "Company", companyId, "Role");
    const time = data.timestamp;
    return patch({
      session: {
        currentUser: data["currentUser"],
        view: roles == 1 ? "PME" : "ST",
        time: time,
      },
    });
  }

  readUpdates(data: any) {
    return Object.keys(data).map((name) =>
      update(name as DataTypes, data[name])
    );
  }
}
