import { CacheObject } from "../common/interfaces"


export class SingleCache {

    private static instance : SingleCache  = new SingleCache()

    public ob: CacheObject = {}

    public static getInstance(): SingleCache {
        return this.instance
    }

    public static setCache(object: Object): void {
        this.instance.ob = object
    }

    public static getCache(): Object {
        return this.instance.ob
    }

    private SingleCache() {}

    public static checkValueInCache(name: string) {
        return this.instance.ob[name] !== undefined
    }

    public static getValueByName (name: string) {
        if (this.instance.ob[name] !== undefined) {
            return this.instance.ob[name]
        }
        else {
            return false
        }
    }

    public static setValueByName (name: string, value: any)  {
        if (!this.checkValueInCache(name)) {
            this.instance.ob[name] = value
        }
    }

    public static compareValue (name: string, valueToCompare: any) {
        return this.instance.ob[name] == valueToCompare
    }
}