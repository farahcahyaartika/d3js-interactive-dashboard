import * as d3 from 'd3';


export class AbstractChart {
    constructor(data, attribute, parentDomElement, titleDomElement) {
        this.data = data;
        this.attribute = attribute;
        this.attributeGroup = attribute + "Group";
        this.attributeDimension = attribute + "Dimension";
        this.parentDomElement = parentDomElement;
        // this needs to be implemented by the subclasses
        this.chart = null;
        this.observers = [];
        this.currentFilters = data[this.attributeGroup].map(a => a.key)
        this.initState = true;

        this.titleDomElement = titleDomElement;
        this.titleDomElement.innerHTML = attribute.charAt(0).toUpperCase() + attribute.slice(1) + " Chart";

        // the click listener will do the following:
        this.clickListener = (evt, filterElement) => {
            // determine the selected value

         
                let label = filterElement.key;
                let value = filterElement.value;
                console.log("clicked!", label, value);

                // save current filter attributes
                if (this.currentFilters.includes(label))
                    this.currentFilters = this.currentFilters.filter(e => e !== label)
                else
                    this.currentFilters.push(label);

                // do the filtering
                if (this.currentFilters.length > 0)
                    this.data[this.attributeDimension].filter(a =>
                        this.currentFilters.includes(a)
                    );
                else
                    this.data[this.attributeDimension].filter(null);

                console.log("current filters " + this.attributeDimension, this.currentFilters, this.data[this.attributeDimension].currentFilter());

                // update background color

                // if (this.initBackgroundColor)
                //     this.updateBackgroundColor(firstPoint.index);

                // once you have filtered the data, you call;
                // (this works, if all observers have a reference to the SAME
                // data object, which seems to be the case in the current impl
                this.observers.forEach(obs => obs.update());
        }
    }

    update() {
        // update chart
        // this.chart.data.labels = this.data[this.attributeGroup].map(a => a.key);
        // this.chart.data.datasets[0].data = this.data[this.attributeGroup].map(a => a.value);
        this.countFilteredData();
        // this.chart.update();
        // console.log("dimension updated!", this.attribute, this.data[this.attributeGroup]);
    }

    countFilteredData() {
        const sumAttr = this.data.sumAttr;
        var filteredDataCount = this.data.groupAll().reduceSum(function (d) { return d[sumAttr]; }).value();
        filteredDataCount = d3.format(",")(filteredDataCount)
        document.getElementById("filter-count").innerHTML = filteredDataCount;
    }

    addObserver(obs) {
        this.observers.push(obs);
    }

}
