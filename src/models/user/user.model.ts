import { Profile } from "../data/data.model";

export class User {
  viewType: boolean = false;
  imageUrl: string | null = null;
  profile: Profile | null = null;
};