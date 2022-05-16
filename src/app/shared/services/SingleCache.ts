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

    public static checkImageInCache(name: string) {
        console.log('getImageByName, ob:', this.instance.ob)
        return this.instance.ob[name] !== undefined
    }

    public static getImageByName (name: string) {
        if (this.instance.ob[name] !== undefined) {
            return this.instance.ob[name]
        }
        else {
            return false
        }
    }

    public static setImageByName (name: string, value: any)  {
        if (!this.checkImageInCache(name)) {
            console.log('setImageByName, ob:', this.instance.ob)
            this.instance.ob[name] = value
            console.log('setImageByName, ob:', this.instance.ob)
        }
    }
}