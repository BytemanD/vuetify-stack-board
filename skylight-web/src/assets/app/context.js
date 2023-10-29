
export class CookieContext{
    constructor() {
    }
    setClusterId(clusterId){
        return localStorage.setItem('clusterId', clusterId)
    }
    setRegion(region){
        return localStorage.setItem('region', region)
    }
    getClusterId(){
        return localStorage.getItem('clusterId')
    }
    getClusterName(){
        return localStorage.getItem('clusterName')
    }
    getRegion(){
        return localStorage.getItem('region')
    }
}
