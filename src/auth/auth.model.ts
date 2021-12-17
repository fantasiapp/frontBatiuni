import { Optional } from "../common/types";

export interface AuthModel {
  token: Optional<string>;
  username: Optional<string>;
};