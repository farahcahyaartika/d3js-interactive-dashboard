// Sources: 
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_input_multiple
// https://stackoverflow.com/questions/37122484/chart-js-bar-chart-click-events

import * as d3 from 'd3';
// You can specify which plugins you need
import bootstrap from 'bootstrap';
import { addObservers } from './addObservers';
import * as crossfilter from 'crossfilter2/crossfilter';
import { PieChartWrapper } from './charts/PieChartWrapper';
import { BarChartWrapper } from './charts/BarChartWrapper';
import { GeoChartWrapper } from './charts/GeoChartWrapper';
import { AreaChartWrapper } from './charts/AreaChartWrapper';
import { ResetWrapper } from './charts/ResetWrapper';

// renderMaps();

const fileinput = document.querySelector("input");
var starttime;
var allData = [];


fileinput.onchange = () => {
    starttime = Date.now();
    var dataArray = Array.from(fileinput.files);
    console.log(dataArray);

    var itemsProcessed = 0;

    dataArray.forEach(referencetofile => {
        const filereader = new FileReader();
        filereader.readAsText(referencetofile);
        filereader.onload = () => {
            console.log("filedata loaded: " + referencetofile.name);
            itemsProcessed++;
            // do whatever you like with filereader.result, but probably
            // console logging should be skipped for large files
            var parsed = d3.csvParse(filereader.result);
            allData = allData.concat(parsed);

            console.log("total rows loaded: " + allData.length);
            console.log("duration: " + (Date.now() - starttime) + "ms");
            if (itemsProcessed === dataArray.length) {
                // allData.forEach(d => {
                //     // d.reportingDate = new Date(d["Meldedatum"]);
                //     // d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
                // })

                var mycrossfilter = crossfilter(allData);
                mycrossfilter.sumAttr = "AnzahlFall";

                // DIMENSIONS AND GROUPS

                // --------- Gender Dimension ---------

                mycrossfilter.genderDimension = mycrossfilter.dimension(function (data) {
                    return data["Geschlecht"];
                });
                mycrossfilter.genderGroup = mycrossfilter.genderDimension.group().reduceSum(function (d) {
                    return d[mycrossfilter.sumAttr];
                }).all();

                // --------- Age Dimension ---------

                mycrossfilter.ageDimension = mycrossfilter.dimension(function (data) {
                    // return ~~((Date.now() - new Date(data.DOB)) / (31557600000))
                    return data["Altersgruppe"];
                });
                // var ageGroup = ageDimension.group().reduceSum(function(d) {return d["AnzahlGenesen"];});
                mycrossfilter.ageGroup = mycrossfilter.ageDimension.group().reduceSum(function (d) {
                    return d[mycrossfilter.sumAttr];
                }).all();

                // --------- Reporting Date Dimension ---------

                mycrossfilter.reportingDateDimension = mycrossfilter.dimension(function (data) {
                    // return ~~((Date.now() - new Date(data.DOB)) / (31557600000))
                    return new Date(data["Meldedatum"]);
                });
                // var ageGroup = ageDimension.group().reduceSum(function(d) {return d["AnzahlGenesen"];});
                mycrossfilter.reportingDateGroup = mycrossfilter.reportingDateDimension.group().reduceSum(function (d) {
                    return d[mycrossfilter.sumAttr];
                }).all();

                // --------- State Dimension ---------

                mycrossfilter.stateDimension = mycrossfilter.dimension(function (data) {
                    // return ~~((Date.now() - new Date(data.DOB)) / (31557600000))
                    return data["Bundesland"];
                });
                // var ageGroup = ageDimension.group().reduceSum(function(d) {return d["AnzahlGenesen"];});
                mycrossfilter.stateGroup = mycrossfilter.stateDimension.group().reduceSum(function (d) {
                    return d[mycrossfilter.sumAttr];
                }).all();


                // assign the total number of data
                const allDataCount = mycrossfilter.groupAll().reduceSum(function (d) { return d[mycrossfilter.sumAttr]; }).value();
                document.getElementById("filter-count").innerHTML = d3.format(",")(allDataCount);
                document.getElementById("total-count").innerHTML = d3.format(",")(allDataCount);

                // read the elements to which the charts shall be attached from the dom
                const pieChartParent = d3.select("#pie-chart");
                const barChartParent = d3.select("#bar-chart");
                const areaChartParent = d3.select("#area-chart");
                // const resetParent = document.getElementById("reset-all");
                const geoChartParent = d3.select("#geo-chart");

                // title element
                const pieChartTitle = document.getElementById("pie-title");
                const barChartTitle = document.getElementById("bar-title");
                const areaChartTitle = document.getElementById("area-title");
                const geoChartTitle = document.getElementById("geo-title");


                // // const data = null; // here you have the concrete data

                const myPieChart = new PieChartWrapper(mycrossfilter, "gender", pieChartParent, pieChartTitle);
                const myBarChart = new BarChartWrapper(mycrossfilter, "age", barChartParent, barChartTitle);
                const myAreaChart = new AreaChartWrapper(mycrossfilter, "reportingDate", areaChartParent, areaChartTitle);
                // const resetObject = new ResetWrapper(resetParent);
                const myGeoChart = new GeoChartWrapper(mycrossfilter, "state", geoChartParent, geoChartTitle);

                addObservers([myPieChart, myBarChart, myAreaChart, myGeoChart]);
            }
        }
    })
}