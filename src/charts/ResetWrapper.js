export class ResetWrapper {
    constructor(parentDomElement) {
        this.parentDomElement = parentDomElement;
        this.observers = [];

        this.clickListener = () => {
            // once you have filtered the data, you call;
            // (this works, if all observers have a reference to the SAME
            // data object, which seems to be the case in the current impl
            this.observers.forEach(obs => obs.resetAll());
        }

        this.parentDomElement.addEventListener("click", this.clickListener);
    }
    addObserver(obs) {
        this.observers.push(obs);
    }

    update() {

    }
}