import { DataTypes, Interface } from "./data.interfaces";
import { OriginalName } from "./data.mapper";

//Generate interfaces from field arrays
type OriginalChildName<A extends DataTypes, B extends keyof Interface<A>> =
  OriginalName<B>;

type IsDataType<K extends string> = K extends DataTypes ? true : false;

type IsChild<K extends string, V extends string> =
  K extends DataTypes ? V extends keyof Interface<K> ? true : false : false;

type Length<T extends string[]> = 
  T extends { length: infer L } ? L : never;

type Rest<T extends string[]> = T extends [...(infer Rest), infer L] ? Rest : string[];
type Last<T extends string[]> = T extends [...(infer Rest), infer L] ? L : string;

type Path<T extends string[]> =
  Length<T> extends 0 ? true :
  Length<T> extends 1 ? IsDataType<Last<T>> :
  IsChild<Last<Rest<T>>, Last<T>> & Path<Rest<T>>;