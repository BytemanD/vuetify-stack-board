
class Dialog {
    constructor(params) {
        this.show = false;
        this.params = params;
    }
    open() {
        this.display()
    }
    display() {
        this.show = true;
    }
    hide() {
        this.show = false;
    }
}

export default Dialog;
