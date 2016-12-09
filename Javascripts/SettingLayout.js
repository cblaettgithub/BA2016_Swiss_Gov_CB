/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    createArc:createArc,
    layout:layout,
    path:path,
    setSVG:setSVG,
    appendCircle:appendCircle,
    movesvg:movesvg,
    startqueue:startqueue
}

function createArc(){
    modul._arc = d3.svg.arc()
        .innerRadius(modul._innerRadius)
        .outerRadius(modul._outerRadius)
    console.log("createArc");
}
//3
function layout(){//padding 0.04 abstand 4%
    modul._layout = d3.layout.chord()
        .padding(.04)
        .sortSubgroups(d3.descending)
        .sortChords(d3.ascending);
    console.log("layout");
}
//4
function path(){
    modul._path = d3.svg.chord()
        .radius(modul._innerRadius);
    console.log("path");
}
//5
function setSVG(){
    modul._svg = d3.select("body").append("svg")
        .attr("width", modul._width)
        .attr("height",modul._height)
        .append("g")
        .attr("id", "circle")
        .attr("transform", "translate(" + modul._width / 2 + "," + modul._height / 2 + ")");
}
//6
function appendCircle(){
    modul._svg.append("circle")
        .attr("r",modul._outerRadius);
    console.log("appendCircle");
}
//14
function movesvg(){
    modul._svg = d3.select("body").append("svg")
        .attr("width", modul._width)
        .attr("height", modul._height)
        .append("g")
        .attr("transform", "translate("+modul._width+","+modul._height+")");
    console.log("movesvg");
}
function startqueue(csv_name, json_name){
    queue()
        .defer(d3.csv, csv_name)
        .defer(d3.json, json_name)
        .await(keepData);//only function name is needed
}