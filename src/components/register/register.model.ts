import { Optional } from '../../common/types';

interface RegistrationRequirements {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: number;
  company: string;
  jobs: number[];
};

export type RegistrationModel = Optional<RegistrationRequirements>;