(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by chris on 24.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    setCurrentUrl: setCurrentUrl,
    setParam:      setParam,
    _currentURL:   _currentURL,
    _queryOutput:  _queryOutput
}

var _year;
var _dept;
var _supplier;
var _total_EDI;
var _total_EDA;
var _width;
var _height;
var _currentURL="Supplier_2016_chord.html";
var _ArrayParams;
var _queryOutput="";

var params =
{   year:      "data.csv",dept: "data.csv",     supplier: "data.csv",
    total_EDI: "data.csv",total_EDA: "data.csv",width: "data.csv",
    height:    "data.csv",currentURL: "data.csv"
};

function setCurrentUrl(startUrl){
    _currentURL=startUrl
}

function setParam(year, dept, supplier, total_EDI, total_EDA, width, height)
{
    _year=year;
    _dept=dept;
    _supplier=supplier;
    _total_EDI=total_EDI;
    _total_EDA=total_EDA;
    _width=width;
    _height=height;

    params[0]=_year;
    params[1]=_dept;
    params[2]=_supplier;
    params[3]=_total_EDI;
    params[4]=_total_EDA;
    params[5]=_width;
    params[6]=_height;
}
/*function createLink(){

    var startappend="?";
    var seperator="=";
    var appender="&";
    var i=0;

    _queryOutput=_currentURL;
    _queryOutput=_currentURL+startappend;

    params.forEach(function(v){
        _queryOutput=_queryOutput+params[i].name +seperator+params[i];
        i=i+1;
    });
}*/

},{"./Modul":2}],2:[function(require,module,exports){
    /**
     * Created by chris on 24.10.2016.
     */
    var _currentcsv="CSV/EDA-2011.csv";
    var _currentcsv_B="CSV/EDA-2011.csv";
    var _currentjson="CSV/matrix.json";
    var _currentcolor="CSV/Color.csv";
    var _svg;// = d3.select("svg");
    var _width;
    var _height;
    var _outerRadius;
    var _innerRadius;
    var _layout;
    var _path;
    var _arc;
    var _groupPath;
    var _group;
    var _groupText;
    var _chord;
    var _formatPercent;
    var _transform_width;
    var _transform_height;
    var _group_x;
    var _group_dy;
    var _matrix;
    var _supplier;
    var _color;
    var _dept;
    var _ds_supplier;
    var _ds_dept;
    var _ds_cost;
    var _ds_supplier_EDI;
    var _ds_supplier_EDA;
    /*creatinglinks*/

    module.exports ={
        _currentcsv:_currentcsv,
        _currentcsv_B:_currentcsv_B,
        _currentjson:_currentjson,
        _currentcolor:_currentcolor,
        _svg:_svg,
        _width:_width,
        _width:_width,
        _height:_height,
        _outerRadius:_outerRadius,
        _innerRadius:_innerRadius,
        _layout:_layout,
        _path:_path,
        _arc:_arc,
        _groupPath:_groupPath,
        _group:_group,
        _groupText:_groupText,
        _chord:_chord,
        _formatPercent:_formatPercent,
        _transform_width:_transform_width,
        _transform_height:_transform_height,
        _group_x:_group_x,
        _group_dy:_group_dy,
        _matrix:_matrix,
        _supplier:_supplier,
        _color:_color,
        _dept:_dept,
        _ds_supplier:_ds_supplier,
        _ds_dept:_ds_dept,
        _ds_cost:_ds_cost,
        _ds_supplier_EDI:_ds_supplier_EDI,
        _ds_supplier_EDA:_ds_supplier_EDA,
    }
},{}],3:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
//7
modul =   require('./Modul');

/*var SettingData = require('./SettingDatas.js');
_maindata = new SettingData();*/

module.exports = {
    selectchords:selectchords
}

function selectchords() {
    modul._chord = modul._svg.selectAll(".chord")
        .attr("class", "chord")
        .data(modul._layout.chords)
        .enter().append("path")
        .attr("d",  modul._path, function(d){return d.supplier})
        .style("fill", function (d) {
            //return modul._supplier[d.source.index].color;
            return modul._color[d.source.index].color;
        })
        .style("opacity", 1);
}
},{"./Modul":2}],4:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');

/*var SettingData = require('./SettingDatas.js');
var _maindata = new SettingData();*/

module.exports ={
    neighborhood:neighborhood,
    groupPath:groupPath,
    groupText:groupText,
    grouptextFilter:grouptextFilter,
    mouseover:mouseover

}
function neighborhood() {//Länderbogen
    console.log("neighbor");
    modul._group = modul._svg.selectAll("g.group")
        .data(modul._layout.groups)
        .enter().append("svg:g")
        .attr("class", "group")
        .on("mouseover", mouseover)     //darüber fahren
        .on("mouseout", mouseout) ;    //darüber fahren

}
function groupPath() {//in länderbogen einsetzen
    modul._groupPath =  modul._group.append("path")
        .attr("id", function (d, i) {
            return "group" + i;
        })
        .attr("d", modul._arc)
        .style("fill", function (d, i) {//Farbe um Bogen
            return modul._color[i].color;
        });
}
function groupText() {//den länderbogen beschriften
    modul._groupText = modul._group.append("svg:text")
        .attr("x", modul._group_x)//6
        .attr("class", "supplier")
        .attr("dy", modul._group_dy);//bro15

    modul._groupText.append("svg:textPath")
        .attr("xlink:href", function (d, i) {
            return "#group" + d.index;
        })
        .text(function (d, i) {
            console.log("groupText:"+i+ "   "+modul._supplier[i].supplier);
            /*if (modul._currentcsv="csv/"+"Dummy_EDA.csv")
                return modul._supplier[i];
            else*/
                return modul._supplier[i].supplier;
            //return modul._ds_supplier[i].key;//Spaltenüberschriften
        }); // modul._ds_supplier[i].values[0].key ="EDA"
            // modul._ds_supplier[i].values[0].values = 20000(summe)

    function groupTicks(d) {
        var k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, 1000000).map(function (v, i) {
            return {
                angle: v * k + d.startAngle,
                label: i % 5 != 0 ? null : v / 1000000 + " Fr."
            };
        });
    }
    var g = modul._svg.selectAll("g.group")
    var ticks =g.selectAll("g")
        .data(groupTicks)
        .enter().append("g")
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + modul._outerRadius + ",0)";
        });

    ticks.append("line")
        .attr("x1", 1)
        .attr("y1", 0)
        .attr("x2", 5)
        .attr("y2", 0)
        .style("stroke", "#000");

    ticks.append("text")
        .attr("x", 8)
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return d.angle > Math.PI ?
                "rotate(180)translate(-16)" : null;
        })
        .style("text-anchor", function(d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .text(function(d) { return d.label; });
}

function grouptextFilter() {
    modul._groupText.filter(function (d, i) {
            return modul._groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength();
        })
        .remove();
}

function mouseover(d, i) {
    modul._chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
    })
    .transition()
    .style("opacity", 0.1);
}
function mouseout(d, i) {
    modul._chord.classed("fade", function(p) {
            return p.source.index != i
                && p.target.index != i;
        })
        .transition()
        .style("opacity", 1);
}




},{"./Modul":2}],5:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */

modul =   require('./Modul');

module.exports={
    readcsv:readcsv,
    delayedHello:delayedHello
}

function readcsv(data, matrix, data_B)  {
    console.log("readcsv");
    var supplier;
    switch (modul._currentcsv){
        case "csv/EDI - 2011.csv":
        case "csv/EDI - 2012.csv":
        case "csv/EDI - 2013.csv":
        case "csv/EDI - 2014.csv":
            modul._ds_supplier_EDI= getSupplier_EDI(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDI(modul._ds_supplier_EDI, 10);
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2012.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            break;
        case "csv/Dummy_EDA.csv":
            var dummyEDA=getDummy_EDA(data, "supplier");
            var dummyEDI=getDummy_EDI(data_B, "supplier");
            modul._ds_supplier = matrix_dummy(dummyEDA,dummyEDI);
            break;
        default:
            console.log("readcsv:default");
            modul._ds_supplier    = getSupplier(modul._supplier, "supplier");//nest
            supplier = matrix_Supplier(data);
            modul._ds_dept        = getDep(modul._supplier, "dept");
            modul._ds_cost        = getCost(modul._supplier, "EDA_1006");
            modul._matrix = matrix;
    }
    console.log("setmatrix");
    //modul._supplier=supplier;
}
function matrix_Supplier(data) {
        var matrix = [];
        var counter=0;
        //modul._ds_supplier[i].values[0].key ="EDA"
        var supplier = d3.keys(data[0]).slice(1);
        //Spaltenüberschriften
        data.forEach(function (row) {
            if (counter < 2) {
                var mrow = [];
                supplier.forEach(function (c) {
                    if (c == "1005 EDA")
                        mrow.push(Number(row[c]));
                    if (c == "1006 EDA")
                        mrow.push(Number(row[c]))
                });
                counter++;
                matrix.push(mrow);
                console.log("push");
            }
        });
        modul._matrix = matrix;
        return supplier;
    }

function matrix_Supplier_EDI(data, end) {
    //Fill Matrix EDA
    var matrix = [];
    var counter=0;
    var supplier = d3.keys(data[0]);
    //Spaltenüberschriften
    data.forEach(function (row) {
        if (counter < end) {
            var mrow = [];
            mrow.push(row.values["sumGSEDI"]);
            mrow.push(row.values["sumEBG"]);
            mrow.push(row.values["sumBAR"]);
            mrow.push(row.values["sumBAK"]);
            mrow.push(row.values["sumMeteoCH"]);
            mrow.push(row.values["sumBAG"]);
            mrow.push(row.values["sumBFS"]);
            mrow.push(row.values["sumBSV"]);
            mrow.push(row.values["sumSBF"]);
            mrow.push(row.values["sumNB"]);
            counter++;
            matrix.push(mrow);
            console.log("push");
        }
    });
    console.log("matrix_Supplier_EDA");
    modul._matrix = matrix;
    return supplier;
}
function getDummy_EDI(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d.supplier})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDI: d3.sum(v, function(d){return d["BAG"]})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EDA(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d.supplier})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDA: d3.sum(v, function(d){return d["1005 EDA"]})
        };})
        .entries(csv);
    return nested_data;
}
function matrix_dummy(dataEDA, dataEDI){
    //Fill Matrix EDA
    var matrix = [];
    var counter=0;

    //Spaltenüberschriften
    var supplier = [];
    supplier.push("EDA");
    supplier.push("EDI");
    supplier.push("Airplus");
    supplier.push("SBB");

    //1 Zeile
    var mrow = [];
    mrow.push(0),
        mrow.push(0),
        dataEDA.forEach(function (row) {
        mrow.push(row.values[0].values["sumEDA"])
    });
    matrix.push(mrow);

    //2 Zeile
    mrow = [];
    mrow.push(0),
    mrow.push(0),
        dataEDI.forEach(function (row) {
        mrow.push(row.values[0].values["sumEDI"])
    });
    matrix.push(mrow);

    //3 zeile
    mrow = [];
    dataEDA.forEach(function (row) {
        mrow.push(row.values[0].values["sumEDA"])
    });
    mrow.push(0), mrow.push(0),
        matrix.push(mrow);

    //4 zeile
    mrow = [];//neue Zeile
    dataEDI.forEach(function (row) {
        mrow.push(row.values[0].values["sumEDI"])
    });
    mrow.push(0),
        mrow.push(0),
        matrix.push(mrow);

    console.log("matrix_Dummy");
    modul._matrix = matrix;
    modul._supplier.push( modul._supplier[0]);
    modul._supplier.push( modul._supplier[1]);
    //modul._supplier.pop();
    //modul._supplier.pop();;

    var i=0;
    supplier.forEach(function(row){
        modul._supplier[i].supplier=row;
        i++;
     });

   // modul._supplier=supplier;
    return supplier;
}

function getSupplier_EDI(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
        /*.key(function(d) { return d["GS-EDI"]; })
         .key(function(d) { return d["EBG"]; })
         .key(function(d) { return d["BAR"]; })
         .key(function(d) { return d["BAK"]; })
         .key(function(d) { return d["MeteoSchweiz"]; })
         .key(function(d) { return d["BAG"]; })
         .key(function(d) { return d["BFS"]; })
         .key(function(d) { return d["BSV"]; })
         .key(function(d) { return d["SBF"]; })
         .key(function(d) { return d["NB"]; })*/
        .rollup(function(v) { return{
            sumGSEDI: d3.sum(v, function(d) { return d["GS-EDI"]; }),
            sumEBG: d3.sum(v, function(d) { return d["EBG"]; }),
            sumBAR: d3.sum(v, function(d) { return d["BAR"]; }),
            sumBAK: d3.sum(v, function(d) { return d["BAK"]; }),
            sumMeteoCH: d3.sum(v, function(d) {return d["MeteoSchweiz"]; }),
            sumBAG: d3.sum(v, function(d) { return d["BAG"]; }),
            sumBFS: d3.sum(v, function(d) { return d["BFS"]; }),
            sumBSV: d3.sum(v, function(d) {  return d["BSV"]; }),
            sumSBF: d3.sum(v, function(d) { return d["SBF"]; }),
            sumNB: d3.sum(v, function(d) { return d["NB"]; })
        };})
        .entries(csv);
    console.log(" getSupplier_EDI");
    return nested_data;
}

function matrix_Supplier_EDA(data, end) {
    //Fill Matrix EDA
    var matrix = [];
    var counter=0;
    var supplier = d3.keys(data[0]);

    //Spaltenüberschriften
    data.forEach(function (row) {
        if (counter < end) {
            var mrow = [];
            mrow.push(row.values["sumEDA1005"]);
            mrow.push(row.values["sumEDA1006"]);
            mrow.push(row.values["sum1097"]);
            mrow.push(row.values["sum1112"]);
            counter++;
            matrix.push(mrow);
            console.log("push");
        }
    });
    modul._matrix = matrix;
    console.log("matrix_Supplier_EDI");
    return supplier;
}

function getSupplier_EDA(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
        /*.key(function(d) { return d["1005 EDA"]; })
        .key(function(d) { return d["1006 EDA"]; })
        .key(function(d) { return d["1097 Informatik EDA"]; })
        .key(function(d) { return d["1112 BRZ"]; })*/
        .rollup(function(v) { return{
            sumEDA1005: d3.sum(v, function(d) { return d["1005 EDA"]; }),
            sumEDA1006: d3.sum(v, function(d) { return d["1006 EDA"]; }),
            sum1097: d3.sum(v, function(d) { return d["1097 Informatik EDA"]; }),
            sum1112: d3.sum(v, function(d) { return d["1112 BRZ"]; })
        };})
        .entries(csv);
    console.log("getSupplier_EDA");
    return nested_data;
}

function getSupplier(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
        .key(function(d) { return d.dept; })
        .rollup(function(v) { return d3.sum(v, function(d) { return d["1006 EDA"]; }); })
        .entries(csv);
    console.log("getSupplier");
    return nested_data;
}
function getDep(csv, name) {
    return csv.map(function (d) {
        return d.dept;
    });
    console.log("getDep");
}
function getCost(csv, name) {
    return csv.map(function (d) {
        return d["1006 EDA"];
    });
    console.log("getCost");
}
//not functional
function getYearSupplier(csv){
    var csvdata =d3.csv(csv, function(d) {
        return {
            idSupplier: d.idSupplier,
            supplier: d.supplier
        };
    }, function(error, rows) {
        console.log(rows);
    });
    return csvdata;
}

//test
//.defer(delayedHello, _currentcsv, 260)
function delayedHello(name, delay, callback) {
    setTimeout(function() {
        d3.csv(name, function(error, d)
        {_maindata.setParam(d, name);});
        console.log("Hello, " + name + "!");
        callback(null);
    }, delay);
}
function callback(name){
}
function getMoreCSV(files) {
    var results = [];
    var filesLength = (files || []).length;
    for (var i = 0; i < filesLength; i++) {
        (function (url) {
            d3.csv(url, function (data) {
                results.push(data);
            })
        })
    }
}


},{"./Modul":2}],6:[function(require,module,exports){
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
    //modul._svg=_svg.selectAll("*").remove();
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
},{"./Modul":2}],7:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');
module.exports={
    createTitle:createTitle
}
 function createTitle() {
     modul._chord.append("title").text(function (d) {
        return modul._supplier[d.source.index].supplier
            + " → " + modul._supplier[d.target.index].supplier
            + ": " + modul._formatPercent(d.source.value)
            + "\n" + modul._supplier[d.target.index].supplier
            + " → " + modul._supplier[d.source.index].supplier
            + ": " +modul._formatPercent(d.target.value);
    });
}
},{"./Modul":2}],8:[function(require,module,exports){
(function (global){
/**
 * Created by chris on 25.10.2016.
 */
//start file//
"use strict";
    var modul =   require('./Javascripts/Modul');
//var SettingData = require('./Javascripts/SettingData');
    var SettingLayout = require('./Javascripts/SettingLayout');
    var SettingChords = require('./Javascripts/SettingChords');
    var SettingInput  = require('./Javascripts/SettingInput');
    var SettingGroups = require('./Javascripts/SettingGroups');
    var SettingTitle = require('./Javascripts/SettingTitle');
    var CreatingLinks = require('./Javascripts/CreatingLinks');
    var q;

//starting with choiced csv-fils
global.startprocessglobal = function(content, content_B) {
    console.log("startprocessglobal");
    modul._currentcsv="";
    //d3.select("#result").property("value", csv);
    //var res = document.forms[0]["result"].value;
    console.log("process:start"+content, content_B);
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);
    process(content, content_B);
}
//changing width, height, outer radius per html
global.startprocessDesign=function(content, name, width, height, radius_i, radius_o){
    console.log("startprocessDesign");
    modul._currentcsv="";
    console.log("process:design"+content);
    console.log(width +" "+ height +" " +radius_o);
    settingParam(0, 0, width, height, 6, 15, 0, radius_o);
    process(content);
}

function process(filename, filename_B) {
    modul._svg = d3.select("svg");
    //_svg.selectAll("*").remove();
    console.log("process:main");
    //default
    modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;
    console.log("csv/"+filename);
    SettingLayout.createArc();
    SettingLayout.layout();
    SettingLayout.path();
    SettingLayout.setSVG();
    //SettingLayout.movesvg();
    SettingLayout.appendCircle();
    console.log("process:defer:"+modul._currentcsv);
    q= d3.queue()
    q
        .defer(d3.csv, modul._currentcsv)
        .defer(d3.json,modul._currentjson)
        .defer(d3.csv, modul._currentcolor)
        .defer(d3.csv, modul._currentcsv_B)
        .defer(d3.csv, "csv/"+"Dummy_EDA_EDI_All.csv")
        .await(SettingsB)
}
function SettingsB(error, m_supplier, matrix, color, m_supplier_B, m_dummy)
{
    console.log("SettingsB");
    modul._supplier=m_supplier;//Länderbogennamenn setzen
    console.log("1:SettingsB: Anzah:_supplier:"+modul._supplier.length);
    SettingInput.readcsv(m_supplier, matrix, m_supplier_B);//Fill DS-Supplier + DS-Dept, Matrix
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);

    SettingGroups.neighborhood();
    SettingGroups.groupPath();
    SettingGroups.groupText();
    SettingGroups.grouptextFilter();
    SettingChords.selectchords();
    SettingTitle.createTitle();
}
//Setting Params
function settingParam(trans_width, trans_height, width, height,
                      group_x, group_dy,radius_i, radius_o) {
    modul._transform_width = trans_width;
    modul._transform_height = trans_height;
    modul._width = width;
    modul._height = height;
    //Radius
    if (radius_o==0){
        modul._outerRadius = Math.min(modul._width, modul._height) / 2 - 10;
        modul._innerRadius = modul._outerRadius - 24;
    }
    else{
        modul._outerRadius = Math.min(modul._width, modul._height) / 2 - 10;
        modul._innerRadius = radius_o - 24;
    }
    //percentrage
    modul._formatPercent = d3.format(".1%");
    //seeting inpu
    modul._group_x = group_x;
    modul._group_dy = group_dy;
}
function get_requestParam(csvfile,  dep){
    Querystring
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Javascripts/CreatingLinks":1,"./Javascripts/Modul":2,"./Javascripts/SettingChords":3,"./Javascripts/SettingGroups":4,"./Javascripts/SettingInput":5,"./Javascripts/SettingLayout":6,"./Javascripts/SettingTitle":7}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkphdmFzY3JpcHRzL0NyZWF0aW5nTGlua3MuanMiLCJKYXZhc2NyaXB0cy9Nb2R1bC5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdDaG9yZHMuanMiLCJKYXZhc2NyaXB0cy9TZXR0aW5nR3JvdXBzLmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0lucHV0LmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0xheW91dC5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdUaXRsZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDI0LjEwLjIwMTYuXHJcbiAqL1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzZXRDdXJyZW50VXJsOiBzZXRDdXJyZW50VXJsLFxyXG4gICAgc2V0UGFyYW06ICAgICAgc2V0UGFyYW0sXHJcbiAgICBfY3VycmVudFVSTDogICBfY3VycmVudFVSTCxcclxuICAgIF9xdWVyeU91dHB1dDogIF9xdWVyeU91dHB1dFxyXG59XHJcblxyXG52YXIgX3llYXI7XHJcbnZhciBfZGVwdDtcclxudmFyIF9zdXBwbGllcjtcclxudmFyIF90b3RhbF9FREk7XHJcbnZhciBfdG90YWxfRURBO1xyXG52YXIgX3dpZHRoO1xyXG52YXIgX2hlaWdodDtcclxudmFyIF9jdXJyZW50VVJMPVwiU3VwcGxpZXJfMjAxNl9jaG9yZC5odG1sXCI7XHJcbnZhciBfQXJyYXlQYXJhbXM7XHJcbnZhciBfcXVlcnlPdXRwdXQ9XCJcIjtcclxuXHJcbnZhciBwYXJhbXMgPVxyXG57ICAgeWVhcjogICAgICBcImRhdGEuY3N2XCIsZGVwdDogXCJkYXRhLmNzdlwiLCAgICAgc3VwcGxpZXI6IFwiZGF0YS5jc3ZcIixcclxuICAgIHRvdGFsX0VESTogXCJkYXRhLmNzdlwiLHRvdGFsX0VEQTogXCJkYXRhLmNzdlwiLHdpZHRoOiBcImRhdGEuY3N2XCIsXHJcbiAgICBoZWlnaHQ6ICAgIFwiZGF0YS5jc3ZcIixjdXJyZW50VVJMOiBcImRhdGEuY3N2XCJcclxufTtcclxuXHJcbmZ1bmN0aW9uIHNldEN1cnJlbnRVcmwoc3RhcnRVcmwpe1xyXG4gICAgX2N1cnJlbnRVUkw9c3RhcnRVcmxcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0UGFyYW0oeWVhciwgZGVwdCwgc3VwcGxpZXIsIHRvdGFsX0VESSwgdG90YWxfRURBLCB3aWR0aCwgaGVpZ2h0KVxyXG57XHJcbiAgICBfeWVhcj15ZWFyO1xyXG4gICAgX2RlcHQ9ZGVwdDtcclxuICAgIF9zdXBwbGllcj1zdXBwbGllcjtcclxuICAgIF90b3RhbF9FREk9dG90YWxfRURJO1xyXG4gICAgX3RvdGFsX0VEQT10b3RhbF9FREE7XHJcbiAgICBfd2lkdGg9d2lkdGg7XHJcbiAgICBfaGVpZ2h0PWhlaWdodDtcclxuXHJcbiAgICBwYXJhbXNbMF09X3llYXI7XHJcbiAgICBwYXJhbXNbMV09X2RlcHQ7XHJcbiAgICBwYXJhbXNbMl09X3N1cHBsaWVyO1xyXG4gICAgcGFyYW1zWzNdPV90b3RhbF9FREk7XHJcbiAgICBwYXJhbXNbNF09X3RvdGFsX0VEQTtcclxuICAgIHBhcmFtc1s1XT1fd2lkdGg7XHJcbiAgICBwYXJhbXNbNl09X2hlaWdodDtcclxufVxyXG4vKmZ1bmN0aW9uIGNyZWF0ZUxpbmsoKXtcclxuXHJcbiAgICB2YXIgc3RhcnRhcHBlbmQ9XCI/XCI7XHJcbiAgICB2YXIgc2VwZXJhdG9yPVwiPVwiO1xyXG4gICAgdmFyIGFwcGVuZGVyPVwiJlwiO1xyXG4gICAgdmFyIGk9MDtcclxuXHJcbiAgICBfcXVlcnlPdXRwdXQ9X2N1cnJlbnRVUkw7XHJcbiAgICBfcXVlcnlPdXRwdXQ9X2N1cnJlbnRVUkwrc3RhcnRhcHBlbmQ7XHJcblxyXG4gICAgcGFyYW1zLmZvckVhY2goZnVuY3Rpb24odil7XHJcbiAgICAgICAgX3F1ZXJ5T3V0cHV0PV9xdWVyeU91dHB1dCtwYXJhbXNbaV0ubmFtZSArc2VwZXJhdG9yK3BhcmFtc1tpXTtcclxuICAgICAgICBpPWkrMTtcclxuICAgIH0pO1xyXG59Ki9cclxuIiwiICAgIC8qKlxyXG4gICAgICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyNC4xMC4yMDE2LlxyXG4gICAgICovXHJcbiAgICB2YXIgX2N1cnJlbnRjc3Y9XCJDU1YvRURBLTIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjc3ZfQj1cIkNTVi9FREEtMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGpzb249XCJDU1YvbWF0cml4Lmpzb25cIjtcclxuICAgIHZhciBfY3VycmVudGNvbG9yPVwiQ1NWL0NvbG9yLmNzdlwiO1xyXG4gICAgdmFyIF9zdmc7Ly8gPSBkMy5zZWxlY3QoXCJzdmdcIik7XHJcbiAgICB2YXIgX3dpZHRoO1xyXG4gICAgdmFyIF9oZWlnaHQ7XHJcbiAgICB2YXIgX291dGVyUmFkaXVzO1xyXG4gICAgdmFyIF9pbm5lclJhZGl1cztcclxuICAgIHZhciBfbGF5b3V0O1xyXG4gICAgdmFyIF9wYXRoO1xyXG4gICAgdmFyIF9hcmM7XHJcbiAgICB2YXIgX2dyb3VwUGF0aDtcclxuICAgIHZhciBfZ3JvdXA7XHJcbiAgICB2YXIgX2dyb3VwVGV4dDtcclxuICAgIHZhciBfY2hvcmQ7XHJcbiAgICB2YXIgX2Zvcm1hdFBlcmNlbnQ7XHJcbiAgICB2YXIgX3RyYW5zZm9ybV93aWR0aDtcclxuICAgIHZhciBfdHJhbnNmb3JtX2hlaWdodDtcclxuICAgIHZhciBfZ3JvdXBfeDtcclxuICAgIHZhciBfZ3JvdXBfZHk7XHJcbiAgICB2YXIgX21hdHJpeDtcclxuICAgIHZhciBfc3VwcGxpZXI7XHJcbiAgICB2YXIgX2NvbG9yO1xyXG4gICAgdmFyIF9kZXB0O1xyXG4gICAgdmFyIF9kc19zdXBwbGllcjtcclxuICAgIHZhciBfZHNfZGVwdDtcclxuICAgIHZhciBfZHNfY29zdDtcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfRURJO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9FREE7XHJcbiAgICAvKmNyZWF0aW5nbGlua3MqL1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID17XHJcbiAgICAgICAgX2N1cnJlbnRjc3Y6X2N1cnJlbnRjc3YsXHJcbiAgICAgICAgX2N1cnJlbnRjc3ZfQjpfY3VycmVudGNzdl9CLFxyXG4gICAgICAgIF9jdXJyZW50anNvbjpfY3VycmVudGpzb24sXHJcbiAgICAgICAgX2N1cnJlbnRjb2xvcjpfY3VycmVudGNvbG9yLFxyXG4gICAgICAgIF9zdmc6X3N2ZyxcclxuICAgICAgICBfd2lkdGg6X3dpZHRoLFxyXG4gICAgICAgIF93aWR0aDpfd2lkdGgsXHJcbiAgICAgICAgX2hlaWdodDpfaGVpZ2h0LFxyXG4gICAgICAgIF9vdXRlclJhZGl1czpfb3V0ZXJSYWRpdXMsXHJcbiAgICAgICAgX2lubmVyUmFkaXVzOl9pbm5lclJhZGl1cyxcclxuICAgICAgICBfbGF5b3V0Ol9sYXlvdXQsXHJcbiAgICAgICAgX3BhdGg6X3BhdGgsXHJcbiAgICAgICAgX2FyYzpfYXJjLFxyXG4gICAgICAgIF9ncm91cFBhdGg6X2dyb3VwUGF0aCxcclxuICAgICAgICBfZ3JvdXA6X2dyb3VwLFxyXG4gICAgICAgIF9ncm91cFRleHQ6X2dyb3VwVGV4dCxcclxuICAgICAgICBfY2hvcmQ6X2Nob3JkLFxyXG4gICAgICAgIF9mb3JtYXRQZXJjZW50Ol9mb3JtYXRQZXJjZW50LFxyXG4gICAgICAgIF90cmFuc2Zvcm1fd2lkdGg6X3RyYW5zZm9ybV93aWR0aCxcclxuICAgICAgICBfdHJhbnNmb3JtX2hlaWdodDpfdHJhbnNmb3JtX2hlaWdodCxcclxuICAgICAgICBfZ3JvdXBfeDpfZ3JvdXBfeCxcclxuICAgICAgICBfZ3JvdXBfZHk6X2dyb3VwX2R5LFxyXG4gICAgICAgIF9tYXRyaXg6X21hdHJpeCxcclxuICAgICAgICBfc3VwcGxpZXI6X3N1cHBsaWVyLFxyXG4gICAgICAgIF9jb2xvcjpfY29sb3IsXHJcbiAgICAgICAgX2RlcHQ6X2RlcHQsXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyOl9kc19zdXBwbGllcixcclxuICAgICAgICBfZHNfZGVwdDpfZHNfZGVwdCxcclxuICAgICAgICBfZHNfY29zdDpfZHNfY29zdCxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfRURJOl9kc19zdXBwbGllcl9FREksXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VEQTpfZHNfc3VwcGxpZXJfRURBLFxyXG4gICAgfSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDIxLjEwLjIwMTYuXHJcbiAqL1xyXG4vLzdcclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbi8qdmFyIFNldHRpbmdEYXRhID0gcmVxdWlyZSgnLi9TZXR0aW5nRGF0YXMuanMnKTtcclxuX21haW5kYXRhID0gbmV3IFNldHRpbmdEYXRhKCk7Ki9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgc2VsZWN0Y2hvcmRzOnNlbGVjdGNob3Jkc1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWxlY3RjaG9yZHMoKSB7XHJcbiAgICBtb2R1bC5fY2hvcmQgPSBtb2R1bC5fc3ZnLnNlbGVjdEFsbChcIi5jaG9yZFwiKVxyXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjaG9yZFwiKVxyXG4gICAgICAgIC5kYXRhKG1vZHVsLl9sYXlvdXQuY2hvcmRzKVxyXG4gICAgICAgIC5lbnRlcigpLmFwcGVuZChcInBhdGhcIilcclxuICAgICAgICAuYXR0cihcImRcIiwgIG1vZHVsLl9wYXRoLCBmdW5jdGlvbihkKXtyZXR1cm4gZC5zdXBwbGllcn0pXHJcbiAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAvL3JldHVybiBtb2R1bC5fc3VwcGxpZXJbZC5zb3VyY2UuaW5kZXhdLmNvbG9yO1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kdWwuX2NvbG9yW2Quc291cmNlLmluZGV4XS5jb2xvcjtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbi8qdmFyIFNldHRpbmdEYXRhID0gcmVxdWlyZSgnLi9TZXR0aW5nRGF0YXMuanMnKTtcclxudmFyIF9tYWluZGF0YSA9IG5ldyBTZXR0aW5nRGF0YSgpOyovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9e1xyXG4gICAgbmVpZ2hib3Job29kOm5laWdoYm9yaG9vZCxcclxuICAgIGdyb3VwUGF0aDpncm91cFBhdGgsXHJcbiAgICBncm91cFRleHQ6Z3JvdXBUZXh0LFxyXG4gICAgZ3JvdXB0ZXh0RmlsdGVyOmdyb3VwdGV4dEZpbHRlcixcclxuICAgIG1vdXNlb3Zlcjptb3VzZW92ZXJcclxuXHJcbn1cclxuZnVuY3Rpb24gbmVpZ2hib3Job29kKCkgey8vTMOkbmRlcmJvZ2VuXHJcbiAgICBjb25zb2xlLmxvZyhcIm5laWdoYm9yXCIpO1xyXG4gICAgbW9kdWwuX2dyb3VwID0gbW9kdWwuX3N2Zy5zZWxlY3RBbGwoXCJnLmdyb3VwXCIpXHJcbiAgICAgICAgLmRhdGEobW9kdWwuX2xheW91dC5ncm91cHMpXHJcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwic3ZnOmdcIilcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZ3JvdXBcIilcclxuICAgICAgICAub24oXCJtb3VzZW92ZXJcIiwgbW91c2VvdmVyKSAgICAgLy9kYXLDvGJlciBmYWhyZW5cclxuICAgICAgICAub24oXCJtb3VzZW91dFwiLCBtb3VzZW91dCkgOyAgICAvL2RhcsO8YmVyIGZhaHJlblxyXG5cclxufVxyXG5mdW5jdGlvbiBncm91cFBhdGgoKSB7Ly9pbiBsw6RuZGVyYm9nZW4gZWluc2V0emVuXHJcbiAgICBtb2R1bC5fZ3JvdXBQYXRoID0gIG1vZHVsLl9ncm91cC5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgLmF0dHIoXCJpZFwiLCBmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gXCJncm91cFwiICsgaTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5hdHRyKFwiZFwiLCBtb2R1bC5fYXJjKVxyXG4gICAgICAgIC5zdHlsZShcImZpbGxcIiwgZnVuY3Rpb24gKGQsIGkpIHsvL0ZhcmJlIHVtIEJvZ2VuXHJcbiAgICAgICAgICAgIHJldHVybiBtb2R1bC5fY29sb3JbaV0uY29sb3I7XHJcbiAgICAgICAgfSk7XHJcbn1cclxuZnVuY3Rpb24gZ3JvdXBUZXh0KCkgey8vZGVuIGzDpG5kZXJib2dlbiBiZXNjaHJpZnRlblxyXG4gICAgbW9kdWwuX2dyb3VwVGV4dCA9IG1vZHVsLl9ncm91cC5hcHBlbmQoXCJzdmc6dGV4dFwiKVxyXG4gICAgICAgIC5hdHRyKFwieFwiLCBtb2R1bC5fZ3JvdXBfeCkvLzZcclxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic3VwcGxpZXJcIilcclxuICAgICAgICAuYXR0cihcImR5XCIsIG1vZHVsLl9ncm91cF9keSk7Ly9icm8xNVxyXG5cclxuICAgIG1vZHVsLl9ncm91cFRleHQuYXBwZW5kKFwic3ZnOnRleHRQYXRoXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIiNncm91cFwiICsgZC5pbmRleDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ3JvdXBUZXh0OlwiK2krIFwiICAgXCIrbW9kdWwuX3N1cHBsaWVyW2ldLnN1cHBsaWVyKTtcclxuICAgICAgICAgICAgLyppZiAobW9kdWwuX2N1cnJlbnRjc3Y9XCJjc3YvXCIrXCJEdW1teV9FREEuY3N2XCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kdWwuX3N1cHBsaWVyW2ldO1xyXG4gICAgICAgICAgICBlbHNlKi9cclxuICAgICAgICAgICAgICAgIHJldHVybiBtb2R1bC5fc3VwcGxpZXJbaV0uc3VwcGxpZXI7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIG1vZHVsLl9kc19zdXBwbGllcltpXS5rZXk7Ly9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgICAgICB9KTsgLy8gbW9kdWwuX2RzX3N1cHBsaWVyW2ldLnZhbHVlc1swXS5rZXkgPVwiRURBXCJcclxuICAgICAgICAgICAgLy8gbW9kdWwuX2RzX3N1cHBsaWVyW2ldLnZhbHVlc1swXS52YWx1ZXMgPSAyMDAwMChzdW1tZSlcclxuXHJcbiAgICBmdW5jdGlvbiBncm91cFRpY2tzKGQpIHtcclxuICAgICAgICB2YXIgayA9IChkLmVuZEFuZ2xlIC0gZC5zdGFydEFuZ2xlKSAvIGQudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIGQzLnJhbmdlKDAsIGQudmFsdWUsIDEwMDAwMDApLm1hcChmdW5jdGlvbiAodiwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgYW5nbGU6IHYgKiBrICsgZC5zdGFydEFuZ2xlLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IGkgJSA1ICE9IDAgPyBudWxsIDogdiAvIDEwMDAwMDAgKyBcIiBGci5cIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdmFyIGcgPSBtb2R1bC5fc3ZnLnNlbGVjdEFsbChcImcuZ3JvdXBcIilcclxuICAgIHZhciB0aWNrcyA9Zy5zZWxlY3RBbGwoXCJnXCIpXHJcbiAgICAgICAgLmRhdGEoZ3JvdXBUaWNrcylcclxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwicm90YXRlKFwiICsgKGQuYW5nbGUgKiAxODAgLyBNYXRoLlBJIC0gOTApICsgXCIpXCJcclxuICAgICAgICAgICAgICAgICsgXCJ0cmFuc2xhdGUoXCIgKyBtb2R1bC5fb3V0ZXJSYWRpdXMgKyBcIiwwKVwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIHRpY2tzLmFwcGVuZChcImxpbmVcIilcclxuICAgICAgICAuYXR0cihcIngxXCIsIDEpXHJcbiAgICAgICAgLmF0dHIoXCJ5MVwiLCAwKVxyXG4gICAgICAgIC5hdHRyKFwieDJcIiwgNSlcclxuICAgICAgICAuYXR0cihcInkyXCIsIDApXHJcbiAgICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiIzAwMFwiKTtcclxuXHJcbiAgICB0aWNrcy5hcHBlbmQoXCJ0ZXh0XCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4XCIsIDgpXHJcbiAgICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZC5hbmdsZSA+IE1hdGguUEkgP1xyXG4gICAgICAgICAgICAgICAgXCJyb3RhdGUoMTgwKXRyYW5zbGF0ZSgtMTYpXCIgOiBudWxsO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZC5hbmdsZSA+IE1hdGguUEkgPyBcImVuZFwiIDogbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQubGFiZWw7IH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBncm91cHRleHRGaWx0ZXIoKSB7XHJcbiAgICBtb2R1bC5fZ3JvdXBUZXh0LmZpbHRlcihmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kdWwuX2dyb3VwUGF0aFswXVtpXS5nZXRUb3RhbExlbmd0aCgpIC8gMiAtIDE2IDwgdGhpcy5nZXRDb21wdXRlZFRleHRMZW5ndGgoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5yZW1vdmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW91c2VvdmVyKGQsIGkpIHtcclxuICAgIG1vZHVsLl9jaG9yZC5jbGFzc2VkKFwiZmFkZVwiLCBmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgcmV0dXJuIHAuc291cmNlLmluZGV4ICE9IGlcclxuICAgICAgICAgICAgJiYgcC50YXJnZXQuaW5kZXggIT0gaTtcclxuICAgIH0pXHJcbiAgICAudHJhbnNpdGlvbigpXHJcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDAuMSk7XHJcbn1cclxuZnVuY3Rpb24gbW91c2VvdXQoZCwgaSkge1xyXG4gICAgbW9kdWwuX2Nob3JkLmNsYXNzZWQoXCJmYWRlXCIsIGZ1bmN0aW9uKHApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHAuc291cmNlLmluZGV4ICE9IGlcclxuICAgICAgICAgICAgICAgICYmIHAudGFyZ2V0LmluZGV4ICE9IGk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcclxufVxyXG5cclxuXHJcblxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxuXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17XHJcbiAgICByZWFkY3N2OnJlYWRjc3YsXHJcbiAgICBkZWxheWVkSGVsbG86ZGVsYXllZEhlbGxvXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRjc3YoZGF0YSwgbWF0cml4LCBkYXRhX0IpICB7XHJcbiAgICBjb25zb2xlLmxvZyhcInJlYWRjc3ZcIik7XHJcbiAgICB2YXIgc3VwcGxpZXI7XHJcbiAgICBzd2l0Y2ggKG1vZHVsLl9jdXJyZW50Y3N2KXtcclxuICAgICAgICBjYXNlIFwiY3N2L0VESSAtIDIwMTEuY3N2XCI6XHJcbiAgICAgICAgY2FzZSBcImNzdi9FREkgLSAyMDEyLmNzdlwiOlxyXG4gICAgICAgIGNhc2UgXCJjc3YvRURJIC0gMjAxMy5jc3ZcIjpcclxuICAgICAgICBjYXNlIFwiY3N2L0VESSAtIDIwMTQuY3N2XCI6XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IGdldFN1cHBsaWVyX0VESShtb2R1bC5fc3VwcGxpZXIsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIHN1cHBsaWVyID0gbWF0cml4X1N1cHBsaWVyX0VESShtb2R1bC5fZHNfc3VwcGxpZXJfRURJLCAxMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJjc3YvRURBIC0gMjAxMS5jc3ZcIjpcclxuICAgICAgICBjYXNlIFwiY3N2L0VEQSAtIDIwMTIuY3N2XCI6XHJcbiAgICAgICAgY2FzZSBcImNzdi9FREEgLSAyMDEzLmNzdlwiOlxyXG4gICAgICAgIGNhc2UgXCJjc3YvRURBIC0gMjAxNC5jc3ZcIjpcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gZ2V0U3VwcGxpZXJfRURBKG1vZHVsLl9zdXBwbGllciwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgc3VwcGxpZXIgPSBtYXRyaXhfU3VwcGxpZXJfRURBKG1vZHVsLl9kc19zdXBwbGllcl9FREEsIDQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiY3N2L0R1bW15X0VEQS5jc3ZcIjpcclxuICAgICAgICAgICAgdmFyIGR1bW15RURBPWdldER1bW15X0VEQShkYXRhLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICB2YXIgZHVtbXlFREk9Z2V0RHVtbXlfRURJKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyID0gbWF0cml4X2R1bW15KGR1bW15RURBLGR1bW15RURJKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZWFkY3N2OmRlZmF1bHRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllciAgICA9IGdldFN1cHBsaWVyKG1vZHVsLl9zdXBwbGllciwgXCJzdXBwbGllclwiKTsvL25lc3RcclxuICAgICAgICAgICAgc3VwcGxpZXIgPSBtYXRyaXhfU3VwcGxpZXIoZGF0YSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19kZXB0ICAgICAgICA9IGdldERlcChtb2R1bC5fc3VwcGxpZXIsIFwiZGVwdFwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX2Nvc3QgICAgICAgID0gZ2V0Q29zdChtb2R1bC5fc3VwcGxpZXIsIFwiRURBXzEwMDZcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhcInNldG1hdHJpeFwiKTtcclxuICAgIC8vbW9kdWwuX3N1cHBsaWVyPXN1cHBsaWVyO1xyXG59XHJcbmZ1bmN0aW9uIG1hdHJpeF9TdXBwbGllcihkYXRhKSB7XHJcbiAgICAgICAgdmFyIG1hdHJpeCA9IFtdO1xyXG4gICAgICAgIHZhciBjb3VudGVyPTA7XHJcbiAgICAgICAgLy9tb2R1bC5fZHNfc3VwcGxpZXJbaV0udmFsdWVzWzBdLmtleSA9XCJFREFcIlxyXG4gICAgICAgIHZhciBzdXBwbGllciA9IGQzLmtleXMoZGF0YVswXSkuc2xpY2UoMSk7XHJcbiAgICAgICAgLy9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgICAgICBpZiAoY291bnRlciA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtcm93ID0gW107XHJcbiAgICAgICAgICAgICAgICBzdXBwbGllci5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT0gXCIxMDA1IEVEQVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtcm93LnB1c2goTnVtYmVyKHJvd1tjXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjID09IFwiMTAwNiBFREFcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgbXJvdy5wdXNoKE51bWJlcihyb3dbY10pKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICAgICAgcmV0dXJuIHN1cHBsaWVyO1xyXG4gICAgfVxyXG5cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyX0VESShkYXRhLCBlbmQpIHtcclxuICAgIC8vRmlsbCBNYXRyaXggRURBXHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgY291bnRlcj0wO1xyXG4gICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKTtcclxuICAgIC8vU3BhbHRlbsO8YmVyc2NocmlmdGVuXHJcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgIGlmIChjb3VudGVyIDwgZW5kKSB7XHJcbiAgICAgICAgICAgIHZhciBtcm93ID0gW107XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtR1NFRElcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVCR1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkFSXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CQUtcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bU1ldGVvQ0hcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUJBR1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkZTXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CU1ZcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bVNCRlwiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtTkJcIl0pO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hdHJpeF9TdXBwbGllcl9FREFcIik7XHJcbiAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcbmZ1bmN0aW9uIGdldER1bW15X0VESShjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuc3VwcGxpZXJ9KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KXtyZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUVESTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpe3JldHVybiBkW1wiQkFHXCJdfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBnZXREdW1teV9FREEoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLnN1cHBsaWVyfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odil7cmV0dXJue1xyXG4gICAgICAgICAgICBzdW1FREE6IGQzLnN1bSh2LCBmdW5jdGlvbihkKXtyZXR1cm4gZFtcIjEwMDUgRURBXCJdfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBtYXRyaXhfZHVtbXkoZGF0YUVEQSwgZGF0YUVESSl7XHJcbiAgICAvL0ZpbGwgTWF0cml4IEVEQVxyXG4gICAgdmFyIG1hdHJpeCA9IFtdO1xyXG4gICAgdmFyIGNvdW50ZXI9MDtcclxuXHJcbiAgICAvL1NwYWx0ZW7DvGJlcnNjaHJpZnRlblxyXG4gICAgdmFyIHN1cHBsaWVyID0gW107XHJcbiAgICBzdXBwbGllci5wdXNoKFwiRURBXCIpO1xyXG4gICAgc3VwcGxpZXIucHVzaChcIkVESVwiKTtcclxuICAgIHN1cHBsaWVyLnB1c2goXCJBaXJwbHVzXCIpO1xyXG4gICAgc3VwcGxpZXIucHVzaChcIlNCQlwiKTtcclxuXHJcbiAgICAvLzEgWmVpbGVcclxuICAgIHZhciBtcm93ID0gW107XHJcbiAgICBtcm93LnB1c2goMCksXHJcbiAgICAgICAgbXJvdy5wdXNoKDApLFxyXG4gICAgICAgIGRhdGFFREEuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XHJcbiAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbMF0udmFsdWVzW1wic3VtRURBXCJdKVxyXG4gICAgfSk7XHJcbiAgICBtYXRyaXgucHVzaChtcm93KTtcclxuXHJcbiAgICAvLzIgWmVpbGVcclxuICAgIG1yb3cgPSBbXTtcclxuICAgIG1yb3cucHVzaCgwKSxcclxuICAgIG1yb3cucHVzaCgwKSxcclxuICAgICAgICBkYXRhRURJLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzWzBdLnZhbHVlc1tcInN1bUVESVwiXSlcclxuICAgIH0pO1xyXG4gICAgbWF0cml4LnB1c2gobXJvdyk7XHJcblxyXG4gICAgLy8zIHplaWxlXHJcbiAgICBtcm93ID0gW107XHJcbiAgICBkYXRhRURBLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzWzBdLnZhbHVlc1tcInN1bUVEQVwiXSlcclxuICAgIH0pO1xyXG4gICAgbXJvdy5wdXNoKDApLCBtcm93LnB1c2goMCksXHJcbiAgICAgICAgbWF0cml4LnB1c2gobXJvdyk7XHJcblxyXG4gICAgLy80IHplaWxlXHJcbiAgICBtcm93ID0gW107Ly9uZXVlIFplaWxlXHJcbiAgICBkYXRhRURJLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzWzBdLnZhbHVlc1tcInN1bUVESVwiXSlcclxuICAgIH0pO1xyXG4gICAgbXJvdy5wdXNoKDApLFxyXG4gICAgICAgIG1yb3cucHVzaCgwKSxcclxuICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIm1hdHJpeF9EdW1teVwiKTtcclxuICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICBtb2R1bC5fc3VwcGxpZXIucHVzaCggbW9kdWwuX3N1cHBsaWVyWzBdKTtcclxuICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKCBtb2R1bC5fc3VwcGxpZXJbMV0pO1xyXG4gICAgLy9tb2R1bC5fc3VwcGxpZXIucG9wKCk7XHJcbiAgICAvL21vZHVsLl9zdXBwbGllci5wb3AoKTs7XHJcblxyXG4gICAgdmFyIGk9MDtcclxuICAgIHN1cHBsaWVyLmZvckVhY2goZnVuY3Rpb24ocm93KXtcclxuICAgICAgICBtb2R1bC5fc3VwcGxpZXJbaV0uc3VwcGxpZXI9cm93O1xyXG4gICAgICAgIGkrKztcclxuICAgICB9KTtcclxuXHJcbiAgIC8vIG1vZHVsLl9zdXBwbGllcj1zdXBwbGllcjtcclxuICAgIHJldHVybiBzdXBwbGllcjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U3VwcGxpZXJfRURJKGNzdiwgbmFtZSkge1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhID0gZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLnN1cHBsaWVyOyB9KVxyXG4gICAgICAgIC8qLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiR1MtRURJXCJdOyB9KVxyXG4gICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJFQkdcIl07IH0pXHJcbiAgICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJBUlwiXTsgfSlcclxuICAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiQkFLXCJdOyB9KVxyXG4gICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJNZXRlb1NjaHdlaXpcIl07IH0pXHJcbiAgICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJBR1wiXTsgfSlcclxuICAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiQkZTXCJdOyB9KVxyXG4gICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJCU1ZcIl07IH0pXHJcbiAgICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIlNCRlwiXTsgfSlcclxuICAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiTkJcIl07IH0pKi9cclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJue1xyXG4gICAgICAgICAgICBzdW1HU0VESTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJHUy1FRElcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1FQkc6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiRUJHXCJdOyB9KSxcclxuICAgICAgICAgICAgc3VtQkFSOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJBUlwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bUJBSzogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJCQUtcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1NZXRlb0NIOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkge3JldHVybiBkW1wiTWV0ZW9TY2h3ZWl6XCJdOyB9KSxcclxuICAgICAgICAgICAgc3VtQkFHOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJBR1wiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bUJGUzogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJCRlNcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1CU1Y6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7ICByZXR1cm4gZFtcIkJTVlwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bVNCRjogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJTQkZcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1OQjogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJOQlwiXTsgfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIGNvbnNvbGUubG9nKFwiIGdldFN1cHBsaWVyX0VESVwiKTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyX0VEQShkYXRhLCBlbmQpIHtcclxuICAgIC8vRmlsbCBNYXRyaXggRURBXHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgY291bnRlcj0wO1xyXG4gICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKTtcclxuXHJcbiAgICAvL1NwYWx0ZW7DvGJlcnNjaHJpZnRlblxyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcclxuICAgICAgICBpZiAoY291bnRlciA8IGVuZCkge1xyXG4gICAgICAgICAgICB2YXIgbXJvdyA9IFtdO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVEQTEwMDVcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVEQTEwMDZcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bTEwOTdcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bTExMTJcIl0pO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgY29uc29sZS5sb2coXCJtYXRyaXhfU3VwcGxpZXJfRURJXCIpO1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTdXBwbGllcl9FREEoY3N2LCBuYW1lKSB7XHJcbiAgICB2YXIgbmVzdGVkX2RhdGEgPSBkMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc3VwcGxpZXI7IH0pXHJcbiAgICAgICAgLyoua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDA1IEVEQVwiXTsgfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDA2IEVEQVwiXTsgfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDk3IEluZm9ybWF0aWsgRURBXCJdOyB9KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIjExMTIgQlJaXCJdOyB9KSovXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KSB7IHJldHVybntcclxuICAgICAgICAgICAgc3VtRURBMTAwNTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDA1IEVEQVwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bUVEQTEwMDY6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiMTAwNiBFREFcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW0xMDk3OiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIjEwOTcgSW5mb3JtYXRpayBFREFcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW0xMTEyOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIjExMTIgQlJaXCJdOyB9KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgY29uc29sZS5sb2coXCJnZXRTdXBwbGllcl9FREFcIik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFN1cHBsaWVyKGNzdiwgbmFtZSkge1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhID0gZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLnN1cHBsaWVyOyB9KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5kZXB0OyB9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm4gZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDA2IEVEQVwiXTsgfSk7IH0pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0U3VwcGxpZXJcIik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuZnVuY3Rpb24gZ2V0RGVwKGNzdiwgbmFtZSkge1xyXG4gICAgcmV0dXJuIGNzdi5tYXAoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICByZXR1cm4gZC5kZXB0O1xyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhcImdldERlcFwiKTtcclxufVxyXG5mdW5jdGlvbiBnZXRDb3N0KGNzdiwgbmFtZSkge1xyXG4gICAgcmV0dXJuIGNzdi5tYXAoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICByZXR1cm4gZFtcIjEwMDYgRURBXCJdO1xyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhcImdldENvc3RcIik7XHJcbn1cclxuLy9ub3QgZnVuY3Rpb25hbFxyXG5mdW5jdGlvbiBnZXRZZWFyU3VwcGxpZXIoY3N2KXtcclxuICAgIHZhciBjc3ZkYXRhID1kMy5jc3YoY3N2LCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgaWRTdXBwbGllcjogZC5pZFN1cHBsaWVyLFxyXG4gICAgICAgICAgICBzdXBwbGllcjogZC5zdXBwbGllclxyXG4gICAgICAgIH07XHJcbiAgICB9LCBmdW5jdGlvbihlcnJvciwgcm93cykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJvd3MpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY3N2ZGF0YTtcclxufVxyXG5cclxuLy90ZXN0XHJcbi8vLmRlZmVyKGRlbGF5ZWRIZWxsbywgX2N1cnJlbnRjc3YsIDI2MClcclxuZnVuY3Rpb24gZGVsYXllZEhlbGxvKG5hbWUsIGRlbGF5LCBjYWxsYmFjaykge1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICBkMy5jc3YobmFtZSwgZnVuY3Rpb24oZXJyb3IsIGQpXHJcbiAgICAgICAge19tYWluZGF0YS5zZXRQYXJhbShkLCBuYW1lKTt9KTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkhlbGxvLCBcIiArIG5hbWUgKyBcIiFcIik7XHJcbiAgICAgICAgY2FsbGJhY2sobnVsbCk7XHJcbiAgICB9LCBkZWxheSk7XHJcbn1cclxuZnVuY3Rpb24gY2FsbGJhY2sobmFtZSl7XHJcbn1cclxuZnVuY3Rpb24gZ2V0TW9yZUNTVihmaWxlcykge1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIHZhciBmaWxlc0xlbmd0aCA9IChmaWxlcyB8fCBbXSkubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlc0xlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgKGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgZDMuY3N2KHVybCwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChkYXRhKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgY3JlYXRlQXJjOmNyZWF0ZUFyYyxcclxuICAgIGxheW91dDpsYXlvdXQsXHJcbiAgICBwYXRoOnBhdGgsXHJcbiAgICBzZXRTVkc6c2V0U1ZHLFxyXG4gICAgYXBwZW5kQ2lyY2xlOmFwcGVuZENpcmNsZSxcclxuICAgIG1vdmVzdmc6bW92ZXN2ZyxcclxuICAgIHN0YXJ0cXVldWU6c3RhcnRxdWV1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBcmMoKXtcclxuICAgIG1vZHVsLl9hcmMgPSBkMy5zdmcuYXJjKClcclxuICAgICAgICAuaW5uZXJSYWRpdXMobW9kdWwuX2lubmVyUmFkaXVzKVxyXG4gICAgICAgIC5vdXRlclJhZGl1cyhtb2R1bC5fb3V0ZXJSYWRpdXMpXHJcbiAgICBjb25zb2xlLmxvZyhcImNyZWF0ZUFyY1wiKTtcclxufVxyXG4vLzNcclxuZnVuY3Rpb24gbGF5b3V0KCl7Ly9wYWRkaW5nIDAuMDQgYWJzdGFuZCA0JVxyXG4gICAgbW9kdWwuX2xheW91dCA9IGQzLmxheW91dC5jaG9yZCgpXHJcbiAgICAgICAgLnBhZGRpbmcoLjA0KVxyXG4gICAgICAgIC5zb3J0U3ViZ3JvdXBzKGQzLmRlc2NlbmRpbmcpXHJcbiAgICAgICAgLnNvcnRDaG9yZHMoZDMuYXNjZW5kaW5nKTtcclxuICAgIGNvbnNvbGUubG9nKFwibGF5b3V0XCIpO1xyXG59XHJcbi8vNFxyXG5mdW5jdGlvbiBwYXRoKCl7XHJcbiAgICBtb2R1bC5fcGF0aCA9IGQzLnN2Zy5jaG9yZCgpXHJcbiAgICAgICAgLnJhZGl1cyhtb2R1bC5faW5uZXJSYWRpdXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwYXRoXCIpO1xyXG59XHJcbi8vNVxyXG5mdW5jdGlvbiBzZXRTVkcoKXtcclxuICAgIC8vbW9kdWwuX3N2Zz1fc3ZnLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XHJcbiAgICBtb2R1bC5fc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIilcclxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIG1vZHVsLl93aWR0aClcclxuICAgICAgICAuYXR0cihcImhlaWdodFwiLG1vZHVsLl9oZWlnaHQpXHJcbiAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAuYXR0cihcImlkXCIsIFwiY2lyY2xlXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtb2R1bC5fd2lkdGggLyAyICsgXCIsXCIgKyBtb2R1bC5faGVpZ2h0IC8gMiArIFwiKVwiKTtcclxufVxyXG4vLzZcclxuZnVuY3Rpb24gYXBwZW5kQ2lyY2xlKCl7XHJcbiAgICBtb2R1bC5fc3ZnLmFwcGVuZChcImNpcmNsZVwiKVxyXG4gICAgICAgIC5hdHRyKFwiclwiLG1vZHVsLl9vdXRlclJhZGl1cyk7XHJcbiAgICBjb25zb2xlLmxvZyhcImFwcGVuZENpcmNsZVwiKTtcclxufVxyXG4vLzE0XHJcbmZ1bmN0aW9uIG1vdmVzdmcoKXtcclxuICAgIG1vZHVsLl9zdmcgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgbW9kdWwuX3dpZHRoKVxyXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIG1vZHVsLl9oZWlnaHQpXHJcbiAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIittb2R1bC5fd2lkdGgrXCIsXCIrbW9kdWwuX2hlaWdodCtcIilcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1vdmVzdmdcIik7XHJcbn1cclxuZnVuY3Rpb24gc3RhcnRxdWV1ZShjc3ZfbmFtZSwganNvbl9uYW1lKXtcclxuICAgIHF1ZXVlKClcclxuICAgICAgICAuZGVmZXIoZDMuY3N2LCBjc3ZfbmFtZSlcclxuICAgICAgICAuZGVmZXIoZDMuanNvbiwganNvbl9uYW1lKVxyXG4gICAgICAgIC5hd2FpdChrZWVwRGF0YSk7Ly9vbmx5IGZ1bmN0aW9uIG5hbWUgaXMgbmVlZGVkXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgY3JlYXRlVGl0bGU6Y3JlYXRlVGl0bGVcclxufVxyXG4gZnVuY3Rpb24gY3JlYXRlVGl0bGUoKSB7XHJcbiAgICAgbW9kdWwuX2Nob3JkLmFwcGVuZChcInRpdGxlXCIpLnRleHQoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICByZXR1cm4gbW9kdWwuX3N1cHBsaWVyW2Quc291cmNlLmluZGV4XS5zdXBwbGllclxyXG4gICAgICAgICAgICArIFwiIOKGkiBcIiArIG1vZHVsLl9zdXBwbGllcltkLnRhcmdldC5pbmRleF0uc3VwcGxpZXJcclxuICAgICAgICAgICAgKyBcIjogXCIgKyBtb2R1bC5fZm9ybWF0UGVyY2VudChkLnNvdXJjZS52YWx1ZSlcclxuICAgICAgICAgICAgKyBcIlxcblwiICsgbW9kdWwuX3N1cHBsaWVyW2QudGFyZ2V0LmluZGV4XS5zdXBwbGllclxyXG4gICAgICAgICAgICArIFwiIOKGkiBcIiArIG1vZHVsLl9zdXBwbGllcltkLnNvdXJjZS5pbmRleF0uc3VwcGxpZXJcclxuICAgICAgICAgICAgKyBcIjogXCIgK21vZHVsLl9mb3JtYXRQZXJjZW50KGQudGFyZ2V0LnZhbHVlKTtcclxuICAgIH0pO1xyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjUuMTAuMjAxNi5cclxuICovXHJcbi8vc3RhcnQgZmlsZS8vXHJcblwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIG1vZHVsID0gICByZXF1aXJlKCcuL0phdmFzY3JpcHRzL01vZHVsJyk7XHJcbi8vdmFyIFNldHRpbmdEYXRhID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9TZXR0aW5nRGF0YScpO1xyXG4gICAgdmFyIFNldHRpbmdMYXlvdXQgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdMYXlvdXQnKTtcclxuICAgIHZhciBTZXR0aW5nQ2hvcmRzID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9TZXR0aW5nQ2hvcmRzJyk7XHJcbiAgICB2YXIgU2V0dGluZ0lucHV0ICA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0lucHV0Jyk7XHJcbiAgICB2YXIgU2V0dGluZ0dyb3VwcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0dyb3VwcycpO1xyXG4gICAgdmFyIFNldHRpbmdUaXRsZSA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ1RpdGxlJyk7XHJcbiAgICB2YXIgQ3JlYXRpbmdMaW5rcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvQ3JlYXRpbmdMaW5rcycpO1xyXG4gICAgdmFyIHE7XHJcblxyXG4vL3N0YXJ0aW5nIHdpdGggY2hvaWNlZCBjc3YtZmlsc1xyXG5nbG9iYWwuc3RhcnRwcm9jZXNzZ2xvYmFsID0gZnVuY3Rpb24oY29udGVudCwgY29udGVudF9CKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0cHJvY2Vzc2dsb2JhbFwiKTtcclxuICAgIG1vZHVsLl9jdXJyZW50Y3N2PVwiXCI7XHJcbiAgICAvL2QzLnNlbGVjdChcIiNyZXN1bHRcIikucHJvcGVydHkoXCJ2YWx1ZVwiLCBjc3YpO1xyXG4gICAgLy92YXIgcmVzID0gZG9jdW1lbnQuZm9ybXNbMF1bXCJyZXN1bHRcIl0udmFsdWU7XHJcbiAgICBjb25zb2xlLmxvZyhcInByb2Nlc3M6c3RhcnRcIitjb250ZW50LCBjb250ZW50X0IpO1xyXG4gICAgc2V0dGluZ1BhcmFtKDAsIDAsIDcyMCwgNzIwLCA2LCAxNSwgMCwgMCk7XHJcbiAgICBwcm9jZXNzKGNvbnRlbnQsIGNvbnRlbnRfQik7XHJcbn1cclxuLy9jaGFuZ2luZyB3aWR0aCwgaGVpZ2h0LCBvdXRlciByYWRpdXMgcGVyIGh0bWxcclxuZ2xvYmFsLnN0YXJ0cHJvY2Vzc0Rlc2lnbj1mdW5jdGlvbihjb250ZW50LCBuYW1lLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXNfaSwgcmFkaXVzX28pe1xyXG4gICAgY29uc29sZS5sb2coXCJzdGFydHByb2Nlc3NEZXNpZ25cIik7XHJcbiAgICBtb2R1bC5fY3VycmVudGNzdj1cIlwiO1xyXG4gICAgY29uc29sZS5sb2coXCJwcm9jZXNzOmRlc2lnblwiK2NvbnRlbnQpO1xyXG4gICAgY29uc29sZS5sb2cod2lkdGggK1wiIFwiKyBoZWlnaHQgK1wiIFwiICtyYWRpdXNfbyk7XHJcbiAgICBzZXR0aW5nUGFyYW0oMCwgMCwgd2lkdGgsIGhlaWdodCwgNiwgMTUsIDAsIHJhZGl1c19vKTtcclxuICAgIHByb2Nlc3MoY29udGVudCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByb2Nlc3MoZmlsZW5hbWUsIGZpbGVuYW1lX0IpIHtcclxuICAgIG1vZHVsLl9zdmcgPSBkMy5zZWxlY3QoXCJzdmdcIik7XHJcbiAgICAvL19zdmcuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcclxuICAgIGNvbnNvbGUubG9nKFwicHJvY2VzczptYWluXCIpO1xyXG4gICAgLy9kZWZhdWx0XHJcbiAgICBtb2R1bC5fY3VycmVudGNzdj1cImNzdi9cIitmaWxlbmFtZTtcclxuICAgIG1vZHVsLl9jdXJyZW50Y3N2X0I9XCJjc3YvXCIrZmlsZW5hbWVfQjtcclxuICAgIGNvbnNvbGUubG9nKFwiY3N2L1wiK2ZpbGVuYW1lKTtcclxuICAgIFNldHRpbmdMYXlvdXQuY3JlYXRlQXJjKCk7XHJcbiAgICBTZXR0aW5nTGF5b3V0LmxheW91dCgpO1xyXG4gICAgU2V0dGluZ0xheW91dC5wYXRoKCk7XHJcbiAgICBTZXR0aW5nTGF5b3V0LnNldFNWRygpO1xyXG4gICAgLy9TZXR0aW5nTGF5b3V0Lm1vdmVzdmcoKTtcclxuICAgIFNldHRpbmdMYXlvdXQuYXBwZW5kQ2lyY2xlKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByb2Nlc3M6ZGVmZXI6XCIrbW9kdWwuX2N1cnJlbnRjc3YpO1xyXG4gICAgcT0gZDMucXVldWUoKVxyXG4gICAgcVxyXG4gICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2KVxyXG4gICAgICAgIC5kZWZlcihkMy5qc29uLG1vZHVsLl9jdXJyZW50anNvbilcclxuICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNvbG9yKVxyXG4gICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0IpXHJcbiAgICAgICAgLmRlZmVyKGQzLmNzdiwgXCJjc3YvXCIrXCJEdW1teV9FREFfRURJX0FsbC5jc3ZcIilcclxuICAgICAgICAuYXdhaXQoU2V0dGluZ3NCKVxyXG59XHJcbmZ1bmN0aW9uIFNldHRpbmdzQihlcnJvciwgbV9zdXBwbGllciwgbWF0cml4LCBjb2xvciwgbV9zdXBwbGllcl9CLCBtX2R1bW15KVxyXG57XHJcbiAgICBjb25zb2xlLmxvZyhcIlNldHRpbmdzQlwiKTtcclxuICAgIG1vZHVsLl9zdXBwbGllcj1tX3N1cHBsaWVyOy8vTMOkbmRlcmJvZ2VubmFtZW5uIHNldHplblxyXG4gICAgY29uc29sZS5sb2coXCIxOlNldHRpbmdzQjogQW56YWg6X3N1cHBsaWVyOlwiK21vZHVsLl9zdXBwbGllci5sZW5ndGgpO1xyXG4gICAgU2V0dGluZ0lucHV0LnJlYWRjc3YobV9zdXBwbGllciwgbWF0cml4LCBtX3N1cHBsaWVyX0IpOy8vRmlsbCBEUy1TdXBwbGllciArIERTLURlcHQsIE1hdHJpeFxyXG4gICAgbW9kdWwuX2xheW91dC5tYXRyaXgobW9kdWwuX21hdHJpeCk7XHJcbiAgICBtb2R1bC5fY29sb3I9Y29sb3I7XHJcbiAgICBjb25zb2xlLmxvZyhcIjI6U2V0dGluZ3NCOiBBbnphaDpfc3VwcGxpZXI6XCIrbW9kdWwuX3N1cHBsaWVyLmxlbmd0aCk7XHJcblxyXG4gICAgU2V0dGluZ0dyb3Vwcy5uZWlnaGJvcmhvb2QoKTtcclxuICAgIFNldHRpbmdHcm91cHMuZ3JvdXBQYXRoKCk7XHJcbiAgICBTZXR0aW5nR3JvdXBzLmdyb3VwVGV4dCgpO1xyXG4gICAgU2V0dGluZ0dyb3Vwcy5ncm91cHRleHRGaWx0ZXIoKTtcclxuICAgIFNldHRpbmdDaG9yZHMuc2VsZWN0Y2hvcmRzKCk7XHJcbiAgICBTZXR0aW5nVGl0bGUuY3JlYXRlVGl0bGUoKTtcclxufVxyXG4vL1NldHRpbmcgUGFyYW1zXHJcbmZ1bmN0aW9uIHNldHRpbmdQYXJhbSh0cmFuc193aWR0aCwgdHJhbnNfaGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZ3JvdXBfeCwgZ3JvdXBfZHkscmFkaXVzX2ksIHJhZGl1c19vKSB7XHJcbiAgICBtb2R1bC5fdHJhbnNmb3JtX3dpZHRoID0gdHJhbnNfd2lkdGg7XHJcbiAgICBtb2R1bC5fdHJhbnNmb3JtX2hlaWdodCA9IHRyYW5zX2hlaWdodDtcclxuICAgIG1vZHVsLl93aWR0aCA9IHdpZHRoO1xyXG4gICAgbW9kdWwuX2hlaWdodCA9IGhlaWdodDtcclxuICAgIC8vUmFkaXVzXHJcbiAgICBpZiAocmFkaXVzX289PTApe1xyXG4gICAgICAgIG1vZHVsLl9vdXRlclJhZGl1cyA9IE1hdGgubWluKG1vZHVsLl93aWR0aCwgbW9kdWwuX2hlaWdodCkgLyAyIC0gMTA7XHJcbiAgICAgICAgbW9kdWwuX2lubmVyUmFkaXVzID0gbW9kdWwuX291dGVyUmFkaXVzIC0gMjQ7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIG1vZHVsLl9vdXRlclJhZGl1cyA9IE1hdGgubWluKG1vZHVsLl93aWR0aCwgbW9kdWwuX2hlaWdodCkgLyAyIC0gMTA7XHJcbiAgICAgICAgbW9kdWwuX2lubmVyUmFkaXVzID0gcmFkaXVzX28gLSAyNDtcclxuICAgIH1cclxuICAgIC8vcGVyY2VudHJhZ2VcclxuICAgIG1vZHVsLl9mb3JtYXRQZXJjZW50ID0gZDMuZm9ybWF0KFwiLjElXCIpO1xyXG4gICAgLy9zZWV0aW5nIGlucHVcclxuICAgIG1vZHVsLl9ncm91cF94ID0gZ3JvdXBfeDtcclxuICAgIG1vZHVsLl9ncm91cF9keSA9IGdyb3VwX2R5O1xyXG59XHJcbmZ1bmN0aW9uIGdldF9yZXF1ZXN0UGFyYW0oY3N2ZmlsZSwgIGRlcCl7XHJcbiAgICBRdWVyeXN0cmluZ1xyXG59XHJcbiJdfQ==
