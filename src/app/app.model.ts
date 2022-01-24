import { Optional } from "./shared/common/types";
import { DeviceInfo } from "@capacitor/device";

export interface AppModel {
  device: Optional<DeviceInfo>;
};