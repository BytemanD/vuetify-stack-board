import { useNotification } from '@websitevirtuoso/vue3-v-snackbars'

const notification = useNotification({})

 class Notify {
    constructor(){
        this.notification = useNotification({})
    }
    success(msg){
        notification.success(msg, {timeout: 2 * 1000})
    }
    info(msg){
        notification.info(msg)
    }
    error(msg){
        notification.error(msg, {timeout: 5 * 1000})
    }
    warn(msg){
        notification.error(msg, {timeout: 5 * 1000})
    }
    warning(msg){
        this.warn(msg)
    }
}

export default new Notify()
