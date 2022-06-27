// Sources: 
// https://www.tutorialsteacher.com/d3js/create-bar-chart-using-d3js 16/04/2022
// https://d3-graph-gallery.com/graph/interactivity_tooltip.html 1/5/2022
// https://stackoverflow.com/questions/65134858/d3-mouse-is-not-a-function 1/5/2022
// https://observablehq.com/@d3/d3v6-migration-guide 1/5/2022
// http://using-d3js.com/04_07_ordinal_scales.html 1/5/2022
// https://www.youtube.com/watch?v=PNzbk0M_woQ 1/5/2022
// https://observablehq.com/@d3/selection-join 02/05/2022

import { AbstractChart } from './AbstractChart';
import * as d3 from 'd3';

export class BarChartWrapper extends AbstractChart {

    constructor(data, attribute, parentDomElement, titleDomElement) {
        super(data, attribute, parentDomElement, titleDomElement)


        this.resetLink = document.getElementById("bar-reset");


        // the click listener will do the following:
        const filter = (evt, filterElement) => {
            // determine the selected value

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
            // filter and update the other charts
            filter(event, d);
            // update element color
            const color = updateColor(d);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 1)
                .style("fill", color)
        }

        var color = d3.scaleOrdinal('#4daf4a').domain(this.data[this.attributeGroup].map(a => a.key));

        const updateColor = (filterElement) => {
            const label = this.data[this.attributeGroup].filter((d) => {
                return d.value == filterElement.value;
            })[0].key

            if (this.currentFilters.includes(label)) {
                return '#4daf4a';
            } else {
                return "#ccc"
            }
        }

        // BAR CHART

        var width = 500,
            height = 400

        var margin = 50;

        // then create the bar chart and attach it to the parentDomElement

        var svg = this.parentDomElement
            .attr("viewBox", [0, 0, width, height])
            .style("display", "block");

        width = width - margin * 2;
        height = height - margin * 2;

        var xScale = d3.scaleBand().range([0, width]).padding(0.4),
            yScale = d3.scaleLinear().range([height, 0]);

        // Add the bar components

        var g = svg.append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")");

        xScale.domain(this.data[this.attributeGroup].map(a => a.key));
        yScale.domain([0, d3.max(this.data[this.attributeGroup], function (d) { return d.value; })]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", margin / 4 * 3)
            .attr("x", width / 2)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text(this.attribute);

        g.append("g")
            .call(d3.axisLeft(yScale).tickFormat((d) => {
                const siFormat = d3.format('.2s');
                return siFormat(d);
            })
                .ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black");

        this.render = () => {

            var bars = g.selectAll(".bar")
                .data(this.data[this.attributeGroup]);

            bars.exit().remove();//remove unneeded bars

            bars
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("width", xScale.bandwidth())
                .style("fill", function (d, i) {
                    return '#4daf4a';
                })
                .attr("y", function (d) { return yScale(d.value); })
                .attr("height", function (d) { return height - yScale(d.value); })
                .merge(bars)
                .attr("x", function (d) { return xScale(d.key); })
                .on("click", click)
                .on("mouseover", mouseover)
                .on("mouseleave", mouseleave)
                .append("title")
                .text((d, i) => {
                    const value = d3.format(",")(d.value);
                    return `${d.key}\n${value}`
                });

            bars
                .transition()
                .attr("y", function (d) { return yScale(d.value); })
                .attr("height", function (d) { return height - yScale(d.value); });
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