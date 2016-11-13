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

    /*if (modul._currentcsv = "csv/" + "Dummy_EDA.csv") {*/
        modul._groupText.append("svg:textPath")
            .attr("xlink:href", function (d, i) {
                return "#group" + d.index;
            })
            .text(function (d, i) {
                console.log(modul._supplier[i].key);
                return modul._supplier[i].key;
            })

            //return modul._ds_supplier[i].key;//Spaltenüberschriften
         // modul._ds_supplier[i].values[0].key ="EDA"
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
            modul._supplier= modul._ds_supplier_EDI;
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2012.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            modul._supplier= modul._ds_supplier_EDA;
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
    modul._supplier=dataEDA;
    dataEDI.forEach(function(row){
        modul._supplier.push(row)
    })

    /*modul._supplier.push( modul._supplier[0]);
    modul._supplier.push( modul._supplier[1]);*/
    //modul._supplier.pop();
    //modul._supplier.pop();;
    modul._supplier[0].key="EDI";
    modul._supplier[1].key="EDA";

   /* supplier.forEach(function(row){
        modul._supplier[i].supplier=row;
        i++;
     });*/

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
},{"./Javascripts/CreatingLinks":1,"./Javascripts/Modul":2,"./Javascripts/SettingChords":3,"./Javascripts/SettingGroups":4,"./Javascripts/SettingInput":5,"./Javascripts/SettingLayout":6,"./Javascripts/SettingTitle":7}]},{},[8]);
