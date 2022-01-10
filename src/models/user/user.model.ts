import { UserProfile } from "../data/data.model";

export class User {
  type: boolean = false;
  imageUrl: string | null = null;
  profile: UserProfile | null = null;
};