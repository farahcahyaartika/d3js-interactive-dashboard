// Sources: 
// https://www.tutorialsteacher.com/d3js/create-pie-chart-using-d3js 16/04/2022
// https://stackoverflow.com/questions/4011793/this-is-undefined-in-javascript-class-methods 02/05/2022
// https://d3-wiki.readthedocs.io/zh_CN/master/Ordinal-Scales 02/05/2022
// https://d3-graph-gallery.com/graph/pie_changeData.html 02/05/2022
// https://bl.ocks.org/mbostock/1346410 02/05/2022
// https://bl.ocks.org/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c 02/05/2022

import { AbstractChart } from './AbstractChart';
import * as d3 from 'd3';
// import { c } from 'tar';


export class PieChartWrapper extends AbstractChart {

    constructor(data, attribute, parentDomElement, titleDomElement) {
        super(data, attribute, parentDomElement, titleDomElement)

        this.resetLink = document.getElementById("pie-reset");

        // the click listener will do the following:
        const filter = (evt, filterElement) => {
            // determine the selected value

            console.log("pie error", this.data[this.attributeGroup].filter((d) => {
                return d.value == filterElement.value;
            }), filterElement.value, this.data[this.attributeGroup]);
            const label = this.data[this.attributeGroup].filter((d) => {
                return d.value == filterElement.value;
            })[0].key
            let value = d3.format(",")(filterElement.value);

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

            console.log("current filters " + this.attributeDimension, this.currentFilters, this.data[this.attributeGroup]);

            // once you have filtered the data, you call;
            // (this works, if all observers have a reference to the SAME
            // data object, which seems to be the case in the current impl
            this.observers.forEach(obs => obs.update());
        }

        filter.bind(this);

        const findKey = (value) => {
            return this.data[this.attributeGroup].filter((data) => {
                return data.value == value;
            })[0].key
        }

        findKey.bind(this);

        // Three function that change the tooltip when user hover / click / leave a cell
        var mouseover = function (event, d) {
            d3.select(this)
                .style("opacity", 0.5)
        }

        var mouseleave = function (event, d) {
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 1)
        }

        var click = function (event, d) {
            filter(event, d);
            const color = updateColor(d);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 1)
                .style("fill", color)
            console.log("pie clicked!", d)
        }

        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(this.data[this.attributeGroup].map(a => a.key));

        const updateColor = (filterElement) => {
            const label = this.data[this.attributeGroup].filter((d) => {
                return d.value == filterElement.value;
            })[0].key

            if (this.currentFilters.includes(label)) {
                console.log("color", color(label));
                return color(label);
            } else {
                return "#ccc"
            }
        }


        // PIE CHART

        var width = 300,
            height = 200,
            radius = Math.min(width, height) / 2;
        var svg = this.parentDomElement
            .attr("viewBox", [0, 0, width, height])
            .style("display", "block");

        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


        this.render = () => {

            // Generate the pie
            var pie = d3.pie();

            // Generate the arcs
            var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            // Store the displayed angles in _current.
            // Then, interpolate from _current to the new angles.
            // During the transition, _current is updated in-place by d3.interpolate.
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function (t) {
                    return arc(i(t));
                };
            }

            // Join new data
            var arcs = g.selectAll(".arc")
                .data(pie(this.data[this.attributeGroup].map(a => a.value)));

            arcs.exit().remove(); // remove unneeded arcs

            //Draw arc paths
            arcs
                .enter()
                .append("path")
                .attr("class", "arc")
                .attr("fill", function (d, i) {
                    return color(findKey(d.value));
                })
                .attr("d", arc)
                .each(function (d) { this._current = d; }) // store the initial angles
                .on("click", click)
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave)
                .append("title")
                .text((d, i) => {
                    const value = d3.format(",")(d.value);
                    return `${findKey(d.value)}\n${value}`
                });

            // Update existing arcs
            arcs.transition().duration(200).attrTween("d", arcTween);
        }

        this.render.bind(this);

        this.render();

        this.clickResetListener = () => {
            this.resetAll();
            this.observers.forEach(obs => obs.update());
        }

        // this.resetLink.addEventListener("click", this.clickResetListener);

    }

    // you only need to implement this method if you need to do something specific here
    update() {
        // update labels and values on the chart using this.data
        super.update();
        this.render();
    }

    resetAll() {
        this.data[this.attributeDimension].filterAll();
        this.initState = true;
        this.currentFilters = [];
        this.update();
    }

    // this is probably not needed
    addObserver(obs) {
        super.addObserver(obs);
    }

}