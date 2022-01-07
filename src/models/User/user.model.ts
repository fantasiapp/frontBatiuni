import { UserProfile } from "../data/data.model";

export class User {
  type: boolean = false;
  imageUrl: string | null = null;
  userData: Object | null = null;
  companyData: Object | null = null;
  profile: UserProfile | null = null;
};