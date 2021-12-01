type Optional<T> = T | null;

export interface AuthModel {
  token: Optional<string>;
  username: Optional<string>;
};