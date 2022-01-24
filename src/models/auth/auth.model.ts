import { Optional } from "../../app/shared/common/types";

export interface AuthModel {
  token: Optional<string>;
  username: Optional<string>;
  pendingEmail: Optional<string>;
};