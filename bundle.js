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

},{"./Modul":3}],2:[function(require,module,exports){
/**
 * Created by chris on 29.11.2016.
 */

modul =   require('./Modul');

module.exports={
    getDummy_BK:getDummy_BK,
    getDummy_EDA:getDummy_EDA,
    getDummy_EDI:getDummy_EDI,
    getDummy_EFD:getDummy_EFD,
    getDummy_EJPD:getDummy_EJPD,
    getDummy_UVEK:getDummy_EJPD,
    getDummy_VBS:getDummy_VBS,
    getDummy_WBF:getDummy_WBF,
    getSupplier:getSupplier
};

function getDummy_BK(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumBundeskanzelt: d3.sum(v, function(d){return d["Bundeskanzlei"]})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EDA(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDA: d3.sum(v, function(d){return d["1005 EDA"]})
        };})
        .entries(csv);
    return nested_data;
}

function getDummy_EDI(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDI: d3.sum(v, function(d){return d["BAG"]})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EFD(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumEFD: d3.sum(v, function(d) { return d["EZF"]+ d["BIT"]+ d["BBL"]; })
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EJPD(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumBFM: d3.sum(v, function(d) { return d["BFM"]; })
        };})
        .entries(csv);
    return nested_data;
}

function getDummy_UVEK(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumUVEK: d3.sum(v, function(d) { return d["ASTRA"]; })
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_VBS(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumVBS: d3.sum(v, function(d) { return d["ar Beschaffung"]+d["ar Rüstung"]; })
        };})
        .entries(csv);
    return nested_data;
}

function getDummy_WBF(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumWBF: d3.sum(v, function(d) { return d["GS-WBF"]+d["BLW"]+d["Agroscope"]; })
        };})
        .entries(csv);
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


},{"./Modul":3}],3:[function(require,module,exports){
    /**
     * Created by chris on 24.10.2016.
     */
    var _currentcsv="CSV/BK - 2011.csv";
    var _currentcsv_B="CSV/EDA - 2011.csv";
    var _currentcsv_C="CSV/EDI - 2012.csv";
    var _currentcsv_D="CSV/EFD - 2011.csv";
    var _currentcsv_E="CSV/EJPD - 2011.csv";
    var _currentcsv_F="CSV/UVEK - 2011.csv";
    var _currentcsv_G="CSV/VBS - 2011.csv";
    var _currentcsv_H="CSV/WBF - 2011.csv";
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
    var _ds_supplier_BK;
    var _ds_supplier_EJPD;
    var _ds_supplier_EFD;
    var _ds_supplier_UVEK;
    var _ds_supplier_VBS;
    var _ds_supplier_WBF;
    var _v_choice="EDA_EDI_2011";//default
    var _vhttp="http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord.html";
    var _vmodus="default";
    var _error_counter=0;
    var _countDep=1;
    /*creatinglinks*/

    module.exports ={
        _currentcsv:_currentcsv,
        _currentcsv_B:_currentcsv_B,
        _currentcsv_C:_currentcsv_C,
        _currentcsv_D:_currentcsv_D,
        _currentcsv_E:_currentcsv_E,
        _currentcsv_F:_currentcsv_F,
        _currentcsv_G:_currentcsv_G,
        _currentcsv_H:_currentcsv_H,
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
        _ds_supplier_EDI    :_ds_supplier_EDI,
        _ds_supplier_EDA    :_ds_supplier_EDA,
        _ds_supplier_BK     :_ds_supplier_BK,
        _ds_supplier_EJPD   :_ds_supplier_EJPD,
        _ds_supplier_EFD    :_ds_supplier_EFD,
        _ds_supplier_UVEK   :_ds_supplier_UVEK,
        _ds_supplier_VBS    :_ds_supplier_VBS,
        _ds_supplier_WBF    :_ds_supplier_WBF,
        _v_choice:_v_choice,
        _vhttp:_vhttp,
        _vmodus:_vmodus,
        _error_counter:_error_counter,
        _countDep:_countDep
    }
},{}],4:[function(require,module,exports){
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
},{"./Modul":3}],5:[function(require,module,exports){
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

    /*if (modul._EDA_csv_ = "csv/" + "Dummy_EDA.csv") {*/
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
                label: i % modul._countDep != 0 ? null : v / 1000000 + "m"
            };//3//
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
        .attr("x", 6)
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




},{"./Modul":3}],6:[function(require,module,exports){
/**
 * Created by chris on 21.10.2016.
 */

modul =   require('./Modul');
DataManager = require('./DataManager');

module.exports={
    readcsv:readcsv
}

function readcsv(data, data_B,data_C,data_D,data_E, data_F,data_G,data_H ,matrix)  {
    console.log(modul._error_counter+" readcsv");
    modul._error_counter++;
    var supplier;
    var csvall;
    var filtercontent;
    console.log(modul._error_counter+" " +modul._v_choice);
    //compareCSV(data, data_B,data_C,data_D, "fullCategory");
    switch (modul._v_choice){
        case "EDA_EDI_2011"://EDA 2011, EDI 2011
        case "EDA_EDI_2012"://EDA 2012, EDI 2011
        case "EDA_EDI_2013"://EDA 2013, EDI 2011
        case "EDA_EDI_2014"://EDA 2014, EDI 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA,modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
            break;
        case "BK_EDI_2011"://BK EDA 2011,
        case "BK_EDI_2012"://BK EDA 2012,
        case "BK_EDI_2013"://BK EDA 2013,
        case "BK_EDI_2014"://BK EDA 2014,
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumEDA","sumBundeskanzelt"]);
            break;
        case "BK_EDA_EDI_2011"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Tri"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Trivadis AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Hardware","SW-Pflege und HW Wartung",
            "Informatik-DL exkl. Personalverleih im Bereich IKT"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat_2"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
                "Beratungs-DL für Management und Organisation sowie Coaching",
                "SW-Pflege und HW Wartung"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat_3"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Postdienste","Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
                "Hardware"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_EJPD_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Informationsarbeit","Informatik-DL exkl. Personalverleih im Bereich IKT",
                "Hardware","Postdienste"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            data_D =filter(data_D,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_D, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI,modul._ds_supplier_EJPD]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI", "sumBFM"]);
            break;
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
                "Universal-Job AG","Dell SA","DHL Express (Schweiz) AG","Allianz Suisse Versicherungs-Gesellschaft"
            ];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            data_D =filter(data_D,filtercontent, "supplier");
            data_E =filter(data_E, filtercontent, "supplier");
            data_F=filter(data_F,filtercontent, "supplier");
            data_G =filter(data_G,filtercontent, "supplier");
            data_H =filter(data_H,filtercontent, "supplier");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            modul._ds_supplier_EFD= DataManager.getDummy_EFD(data_E, "supplier");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_D, "supplier");
            modul._ds_supplier_UVEK= DataManager.getDummy_UVEK(data_F, "supplier");
            modul._ds_supplier_VBS= DataManager.getDummy_VBS(data_G, "supplier");
            modul._ds_supplier_WBF= DataManager.getDummy_WBF(data_H, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI, modul._ds_supplier_EFD,
                modul._ds_supplier_EJPD, modul._ds_supplier_UVEK, modul._ds_supplier_VBS, modul._ds_supplier_WBF,
            ]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt",
                ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                    "sumBFM", "sumUVEK", "sumVBS", "sumWBF"]);
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= DataManager.getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            modul._supplier= modul._ds_supplier_EDA;
            break;
        case "Dummy":
            var dummyEDA=DataManager.getDummy_EDA(data, "supplier");
            var dummyEDI=DataManager.getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([dummyEDA, dummyEDI]);
            //modul._ds_supplier = matrix_dummay_All(csvall);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
            break;
        default:
            console.log("readcsv:default");
            modul._ds_supplier    = DataManager.getSupplier(modul._supplier, "supplier");//nest
            supplier = matrix_Supplier(data);
            modul._ds_dept        = DataManager.getDep(modul._supplier, "dept");
            modul._ds_cost        = DataManager.getCost(modul._supplier, "EDA_1006");
            modul._matrix = matrix;
    }
    console.log("setmatrix");
}
function filter(data, param, filtername){
    console.log(modul._error_counter+" filter");
    modul._error_counter++;
   /* if (param.length==2){
        return data.filter(function(row) {
            if (row[filtername] == param[0]
                ||  row[filtername] == param[1]
               )
            {  return row;  }
        });
    }
    else  if (param.length==3){
        return data.filter(function(row) {
            if (row[filtername] == param[0]
                ||  row[filtername] == param[1]
                ||  row[filtername] == param[2])
            {  return row;    }
        });*/
    return data.filter(function(row) {
        for (var i=0;i< param.length;i++) {
            if (row[filtername]== param[i])
                return row;
        }
        });
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

function compareCSV(dataA, dataB, dataC,dataD, field) {
    var mrow = [];
    for (var i = 0; i < dataA.length; i++) {
        for (var j = 0; j < dataB.length; j++) {
            if (dataA[i][field] == dataB[j][field]) {
                for (var k = 0; k < dataC.length; k++) {
                    if (dataA[i][field] == dataC[k][field])
                        for (var l = 0; l < dataD.length; l++) {
                            if (dataA[i][field] == dataD[l][field]){
                                if (mrow.length < 4){
                                    mrow.push(dataA[i][field]);
                                }
                                else{
                                    if (checkexistRow(mrow, dataA[i][field]))
                                        mrow.push(dataA[i][field]);
                                }
                            }
                        }
                }
            }
        }
    }
    console.log("***********Result:compare CSV");
    console.log("***********"+field);
    for (var i = 0; i < mrow.length; i++)
        console.log(mrow[i]);
}
function checkexistRow(mrow, onerow){
    /*if (mrow.length>2)
     if (checkexistRow(mrow, dataC[k][field]))
     mrow.push(dataA[i][field]);*/
    var check=true;
   if (mrow.length > 1){
       for(var i=0;i<mrow.length;i++){
           if (mrow[i]==onerow){
               check=false;
           }
       }
   }
    return check;
}

function matrix_EDI_EDA(DataEDI_EDA, Name_sumEDA, Name_sumEDI, Names_sumsEDA_EDI_BK){
    console.log(modul._error_counter+" matrix_EDI_EDA files");
    modul._error_counter++;
    var matrix = [];
    var supplier="";
    var minus=4000000;
    var length = DataEDI_EDA.length;
    var totallength = (length/(Names_sumsEDA_EDI_BK.length))*2;
    var middle= d3.round(length/Names_sumsEDA_EDI_BK.length);
    var vobjectid=0;

    //Array filtern
    for (var i=0;i<totallength;i++ ){
        var mrow=[];
        if (i==middle)
            vobjectid=0;
        if (i < middle){
            for(var j=0;j<middle;j++)
                mrow.push(0);
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid ));
                vobjectid++;
            }
        }
        else{
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid));
                vobjectid++;
            }
            for(var j=0;j<middle;j++)
                mrow.push(0);
        }
        matrix.push(mrow);
    }
    modul._matrix = matrix;
    while(modul._supplier.length > 0)
         modul._supplier.pop();
    createSupplierList(DataEDI_EDA,Names_sumsEDA_EDI_BK );

    console.log(modul._error_counter+" matrix_EDI_EDA");
    modul._error_counter++;
    return supplier;
}

function createSupplierList(dataRows, supplier_field){
    console.log(modul._error_counter+" createSupplierList");
    modul._error_counter++;
    var v_Supplier=supplier_field.length;
    var i=0;
    var end;
    if (v_Supplier==4){
        end=v_Supplier*3;
    }
    else{
        end=v_Supplier*2;
    }
    console.log("createSupplierList:"+end);

    //first dept
    if (end==4){
        while( i<end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
    }
    else if (end==6 || end==12){
        while( i<=end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
    }
    else{//test
        while( i<8){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+3;}
    }

    console.log(modul._error_counter+" createSupplierList "+"dept");
    modul._error_counter++;

    //second supplier
    for (var i=0;i<v_Supplier; i++){
        modul._supplier.push(dataRows[i]);
    }
    console.log(modul._error_counter+" createSupplierList "+"supplier");
    modul._error_counter++;
}
function getMatrixValue(row,nameValue, counter){
    var depName;    //get Fieldname sum of each Department
    var result;
    if (nameValue.length==2) {
        switch (counter) {//2 Supplier
            case 0:
            case 1:
                depName = nameValue[0];
                break;
            case 2:
            case 3:
                depName = nameValue[1];
                break;
            default:
        }
    }
      else if (nameValue.length==3){
            switch(counter){//3 Supplier
                case 0:
                case 1:
                case 2:
                    depName=nameValue[0];
                    break;
                case 3:
                case 4:
                case 5:
                    depName=nameValue[1];
                    break;
                case 6:
                case 7:
                case 8:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
        else if(nameValue.length==4)        {
            switch(counter){//4 Supplier
                case 0:
                case 1:
                case 2:
                case 3:
                    depName=nameValue[0];
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                    depName=nameValue[1];
                    break;
                case 8:
                case 9:
                case 10:
                case 11:
                    depName=nameValue[2];
                    break;
                case 12:
                case 13:
                case 14:
                case 15:
                    depName=nameValue[3];
                    break;
                default:
            }
        }
        else if (nameValue.length==8){
          if (counter <8){
              depName=nameValue[0];
          }
          else if (counter < 16){
              depName=nameValue[1];
          }
          else if (counter < 24){
              depName=nameValue[2];
          }
          else if (counter < 32){
              depName=nameValue[3];
          }
          else if (counter < 40){
              depName=nameValue[4];
          }
          else if (counter < 48){
              depName=nameValue[5];
          }
          else if (counter < 56){
              depName=nameValue[6];
          }
          else{
              depName=nameValue[7];
          }

    }
        if (row.values[0].values[depName]==null){
            result=0;
        }
        else{
            result=d3.round(row.values[0].values[depName]);
        }
       return result;
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

function mergingFiles(csvFiles) {
    console.log(modul._error_counter  +" merging files");
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    modul._error_counter++;
    return output;
}


},{"./DataManager":2,"./Modul":3}],7:[function(require,module,exports){
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
},{"./Modul":3}],8:[function(require,module,exports){
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
},{"./Modul":3}],9:[function(require,module,exports){
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
    var DataManager = require('./Javascripts/DataManager');
    var q;

global.startwithLink=function(choice, content, choice_C){
    console.log("svg.remove()");
    d3.select("svg").remove();
    console.log("*****************************************************************************************");
    console.log("");
    modul._error_counter=0;
    console.log(modul._error_counter+" start with Link:"+choice+" "+content+" "+choice_C);
    modul._error_counter++;
    if (content !=null)
        modul._v_choice=content;
    startingwithQuery(modul._v_choice);
}

    // CreateLink
global.startcreatinglink=function(){
    console.log(modul._error_counter+" start creatinglink");
    modul._error_counter++;
    return modul._vhttp+"?choice="+modul._v_choice;
}

//starting with choiced csv-fils
global.startprocessglobal = function(choice,content, content_B,content_C,content_D) {
    console.log(modul._error_counter+" startprocessglobal");
    modul._error_counter++;
    modul._currentcsv="";
    modul._v_choice=choice;
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);
    process(content, content_B,content_C,content_D);
}

//changing width, height, outer radius per html
global.startprocessDesign=function(content, name, width, height, radius_i, radius_o){
    console.log(modul._error_counter+" startprocessDesign");
    modul._error_counter++;
    modul._currentcsv="";
    console.log("process:design"+content);
    console.log(width +" "+ height +" " +radius_o);
    settingParam(0, 0, width, height, 6, 15, 0, radius_o);
    process(content);
};
function hasFile(filename, filename_B, filename_C, filename_D,filename_E, filename_F, filename_G, filename_H){
    if (filename_C!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_C="csv/"+filename_C;
        modul._countDep=2;
    }
    if (filename_D!=0){
        modul._currentcsv_D="csv/"+filename_D;
        modul._countDep=3;
    }
    if (filename_E!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_E="csv/"+filename_E;
        modul._countDep=8;
    }
    if (filename_F!=0){
        modul._currentcsv_F="csv/"+filename_F;
        modul._countDep=8;
    }
    if (filename_G!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_G="csv/"+filename_G;
        modul._countDep=8;
    }
    if (filename_H!=0){
        modul._currentcsv_H="csv/"+filename_H;
        modul._countDep=8;
    }
}

function process(filename, filename_B, filename_C, filename_D) {
    modul._svg=d3.select("svg").remove();
    modul._svg = d3.select("svg");
    console.log(modul._error_counter+" process:main");
    modul._error_counter++;
    //default
    modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;

    hasFile(filename, filename_B, filename_C, filename_D, 0, 0, 0, 0);
    console.log(" process "+filename+" "+ filename_B+" "+ filename_C+" "+ filename_D);
    SettingLayout.createArc();
    SettingLayout.layout();
    SettingLayout.path();
    SettingLayout.setSVG();
    //SettingLayout.movesvg();
    SettingLayout.appendCircle();
    console.log("process:defer:"+modul._currentcsv);
    var test=0; //0 normal, 1 kummulation
    console.log("choice modus:"+modul._vmodus);
    if (modul._vmodus=="default"){//each year
        q= d3.queue()
        q
            .defer(d3.csv, modul._currentcsv)
            .defer(d3.csv, modul._currentcsv_B)
            .defer(d3.csv, modul._currentcsv_C)
            .defer(d3.csv, modul._currentcsv_D)
            .defer(d3.csv, modul._currentcsv_E)
            .defer(d3.csv, modul._currentcsv_F)
            .defer(d3.csv, modul._currentcsv_G)
            .defer(d3.csv, modul._currentcsv_H)
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .await(SettingsB)
    }
    else{ //2011 - 2014//kummulation
        var csv="csv/";
        var supplierA=[csv+"BK - 2011.csv",csv+"BK - 2012.csv",csv+"BK - 2013.csv",csv+"BK - 2014.csv"];
        var supplierB=[csv+"EDI - 2011.csv",csv+"EDI - 2012.csv",csv+"EDI - 2013.csv",csv+"EDI - 2014.csv"];
        //var supplierC=[csv+"EDA - 2011.csv",csv+"EDA - 2012.csv",csv+"EDA - 2013.csv",csv+"EDA - 2014.csv"];
        q= d3.queue()
        q
            .defer(d3.csv, supplierA[0])
            .defer(d3.csv, supplierA[1])
            .defer(d3.csv, supplierA[2])
            .defer(d3.csv, supplierA[3])
            .defer(d3.csv, supplierB[0])
            .defer(d3.csv, supplierB[1])
            .defer(d3.csv, supplierB[2])
            .defer(d3.csv, supplierB[3])
            /*.defer(d3.csv, supplierC[0])
            .defer(d3.csv, supplierC[1])
            .defer(d3.csv, supplierC[2])
            .defer(d3.csv, supplierC[3])*/
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .await(settingsC)
    }
}

function SettingsB(error, m_supplier,  m_supplier_B, m_supplier_C,m_supplier_D,
                   m_supplier_E,  m_supplier_F, m_supplier_G,m_supplier_H,
                   matrix, color)
{
    console.log(modul._error_counter+" SettingsB");
    modul._error_counter++;
    modul._supplier=m_supplier;//Länderbogennamenn setzen
    SettingInput.readcsv(m_supplier, m_supplier_B, m_supplier_C,m_supplier_D,
    m_supplier_E,  m_supplier_F, m_supplier_G,m_supplier_H,matrix);//Fill DS-Supplier + DS-Dept, Matrix
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);
    Setting_theMethods();
}

function settingsC(error, m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014,
                m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014,
                matrix, color){
    console.log(modul._error_counter+" SettingsC");
    modul._error_counter++;
    modul._supplier=m_supplier_2011;//Länderbogennamenn setzen
    //Merging 2011 - 2014

    //test only 2012/2013
    SettingInput.readcsv(mergingFiles([m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014]),
    mergingFiles([m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014]),
        mergingFiles([m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014])
    ,matrix);
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);
    Setting_theMethods();
}


function Setting_theMethods()
{
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
function startingwithQuery(content){
    console.log(modul._error_counter+" starting with Query");
    modul._error_counter++;
    if (content=="BK_EDI_All")
        modul._vmodus="BK_EDI_cumulation";
    else
        modul._vmodus="default";
    switch(content) {//EDA-EDI 2011- 2014
        case 'EDA_EDI_2011':
            startprocessglobal("EDA_EDI_2011","EDA - 2011.csv","EDI - 2011.csv", 0,0);
            break;
        case 'EDA_EDI_2012':
            startprocessglobal("EDA_EDI_2012","EDA - 2012.csv","EDI - 2012.csv", 0,0);
            break;
        case 'EDA_EDI_2013':
            startprocessglobal("EDA_EDI_2013","EDA - 2013.csv","EDI - 2013.csv",0, 0);
            break;
        case 'EDA_EDI_2014':
            startprocessglobal("EDA_EDI_2014","EDA - 2014.csv","EDA - 2014.csv",0,0);
            break;

            //BK EDI 2011 - 2014
        case 'BK_EDI_2011':
            startprocessglobal("BK_EDI_2011","BK - 2011.csv","EDA - 2011.csv",0,0);
            break;
        case 'BK_EDI_2012':
            startprocessglobal("BK_EDI_2012","BK - 2012.csv","EDA - 2012.csv",0,0);
            break;
        case 'BK_EDI_2013':
            startprocessglobal("BK_EDI_2013","BK - 2013.csv","EDA - 2013.csv",0,0);
            break;
        case 'BK_EDI_2014':
            startprocessglobal("BK_EDI_2014","BK - 2014.csv","EDA - 2014.csv",0,0);
            break;
        case 'BK_EDI_All':
            startprocessglobal("BK_EDI_2014","BK - 2014.csv","EDA - 2014.csv",0,0);
            break;

            //BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011":
            startprocessglobal("BK_EDA_EDI_2011","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", 0);
            break;
        case  "BK_EDA_EDI_2012":
            startprocessglobal("BK_EDA_EDI_2012","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013":
            startprocessglobal("BK_EDA_EDI_2013","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014":
            startprocessglobal("BK_EDA_EDI_2014","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //BK EDA EDI 2011 - 2014 Tri
        case  "BK_EDA_EDI_2011_Tri":
            startprocessglobal("BK_EDA_EDI_2011_Tri","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Tri":
            startprocessglobal("BK_EDA_EDI_2012_Tri","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Tri":
            startprocessglobal("BK_EDA_EDI_2013_Tri","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Tri":
            startprocessglobal("BK_EDA_EDI_2014_Tri","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

            //Cat BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011_Cat":
            startprocessglobal("BK_EDA_EDI_2011_Cat","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat":
            startprocessglobal("BK_EDA_EDI_2012_Cat","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat":
            startprocessglobal("BK_EDA_EDI_2013_Cat","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat":
            startprocessglobal("BK_EDA_EDI_2014_Cat","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //Cat BK EDA EDI 2011 - 2014 2
        case  "BK_EDA_EDI_2011_Cat_2":
            startprocessglobal("BK_EDA_EDI_2011_Cat_2","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat_2":
            startprocessglobal("BK_EDA_EDI_2012_Cat_2","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat_2":
            startprocessglobal("BK_EDA_EDI_2013_Cat_2","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;;
        case  "BK_EDA_EDI_2014_Cat_2":
            startprocessglobal("BK_EDA_EDI_2014_Cat_2","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //Cat BK EDA EDI 2011 - 2014 3
        case  "BK_EDA_EDI_2011_Cat_3":
            startprocessglobal("BK_EDA_EDI_2011_Cat_3","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat_3":
            startprocessglobal("BK_EDA_EDI_2012_Cat_3","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat_3":
            startprocessglobal("BK_EDA_EDI_2013_Cat_3","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat_3":
            startprocessglobal("BK_EDA_EDI_2014_Cat_3","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

            //dummy
        case  "Dummy":
            startprocessglobal("Dummy","Dummy_EDA.csv","Dummy_EDI.csv",0,0);
            break;

        //Cat BK EDA EDI EJPD 2011 - 2014
        case  "BK_EDA_EDI_EJPD_2011_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2011_Cat","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "EJPD - 2011.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2012_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2012_Cat","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "EJPD - 2012.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2013_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2013_Cat","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "EJPD - 2013.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2014_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2014_Cat","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "EJPD - 2014.csv");
            break;
        default:

        //BK EDA EDI EFD EJPD UVEK VBS WBF 2011
        case  "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
             "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"

            );
            break;
    }
}
function mergingFiles(csvFiles) {
    console.log(modul._error_counter+" merging files");
    modul._error_counter++;
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    return output;
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Javascripts/CreatingLinks":1,"./Javascripts/DataManager":2,"./Javascripts/Modul":3,"./Javascripts/SettingChords":4,"./Javascripts/SettingGroups":5,"./Javascripts/SettingInput":6,"./Javascripts/SettingLayout":7,"./Javascripts/SettingTitle":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkphdmFzY3JpcHRzL0NyZWF0aW5nTGlua3MuanMiLCJKYXZhc2NyaXB0cy9EYXRhTWFuYWdlci5qcyIsIkphdmFzY3JpcHRzL01vZHVsLmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0Nob3Jkcy5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdHcm91cHMuanMiLCJKYXZhc2NyaXB0cy9TZXR0aW5nSW5wdXQuanMiLCJKYXZhc2NyaXB0cy9TZXR0aW5nTGF5b3V0LmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ1RpdGxlLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjQuMTAuMjAxNi5cclxuICovXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHNldEN1cnJlbnRVcmw6IHNldEN1cnJlbnRVcmwsXHJcbiAgICBzZXRQYXJhbTogICAgICBzZXRQYXJhbSxcclxuICAgIF9jdXJyZW50VVJMOiAgIF9jdXJyZW50VVJMLFxyXG4gICAgX3F1ZXJ5T3V0cHV0OiAgX3F1ZXJ5T3V0cHV0XHJcbn1cclxuXHJcbnZhciBfeWVhcjtcclxudmFyIF9kZXB0O1xyXG52YXIgX3N1cHBsaWVyO1xyXG52YXIgX3RvdGFsX0VESTtcclxudmFyIF90b3RhbF9FREE7XHJcbnZhciBfd2lkdGg7XHJcbnZhciBfaGVpZ2h0O1xyXG52YXIgX2N1cnJlbnRVUkw9XCJTdXBwbGllcl8yMDE2X2Nob3JkLmh0bWxcIjtcclxudmFyIF9BcnJheVBhcmFtcztcclxudmFyIF9xdWVyeU91dHB1dD1cIlwiO1xyXG5cclxudmFyIHBhcmFtcyA9XHJcbnsgICB5ZWFyOiAgICAgIFwiZGF0YS5jc3ZcIixkZXB0OiBcImRhdGEuY3N2XCIsICAgICBzdXBwbGllcjogXCJkYXRhLmNzdlwiLFxyXG4gICAgdG90YWxfRURJOiBcImRhdGEuY3N2XCIsdG90YWxfRURBOiBcImRhdGEuY3N2XCIsd2lkdGg6IFwiZGF0YS5jc3ZcIixcclxuICAgIGhlaWdodDogICAgXCJkYXRhLmNzdlwiLGN1cnJlbnRVUkw6IFwiZGF0YS5jc3ZcIlxyXG59O1xyXG5cclxuZnVuY3Rpb24gc2V0Q3VycmVudFVybChzdGFydFVybCl7XHJcbiAgICBfY3VycmVudFVSTD1zdGFydFVybFxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRQYXJhbSh5ZWFyLCBkZXB0LCBzdXBwbGllciwgdG90YWxfRURJLCB0b3RhbF9FREEsIHdpZHRoLCBoZWlnaHQpXHJcbntcclxuICAgIF95ZWFyPXllYXI7XHJcbiAgICBfZGVwdD1kZXB0O1xyXG4gICAgX3N1cHBsaWVyPXN1cHBsaWVyO1xyXG4gICAgX3RvdGFsX0VEST10b3RhbF9FREk7XHJcbiAgICBfdG90YWxfRURBPXRvdGFsX0VEQTtcclxuICAgIF93aWR0aD13aWR0aDtcclxuICAgIF9oZWlnaHQ9aGVpZ2h0O1xyXG5cclxuICAgIHBhcmFtc1swXT1feWVhcjtcclxuICAgIHBhcmFtc1sxXT1fZGVwdDtcclxuICAgIHBhcmFtc1syXT1fc3VwcGxpZXI7XHJcbiAgICBwYXJhbXNbM109X3RvdGFsX0VESTtcclxuICAgIHBhcmFtc1s0XT1fdG90YWxfRURBO1xyXG4gICAgcGFyYW1zWzVdPV93aWR0aDtcclxuICAgIHBhcmFtc1s2XT1faGVpZ2h0O1xyXG59XHJcbi8qZnVuY3Rpb24gY3JlYXRlTGluaygpe1xyXG5cclxuICAgIHZhciBzdGFydGFwcGVuZD1cIj9cIjtcclxuICAgIHZhciBzZXBlcmF0b3I9XCI9XCI7XHJcbiAgICB2YXIgYXBwZW5kZXI9XCImXCI7XHJcbiAgICB2YXIgaT0wO1xyXG5cclxuICAgIF9xdWVyeU91dHB1dD1fY3VycmVudFVSTDtcclxuICAgIF9xdWVyeU91dHB1dD1fY3VycmVudFVSTCtzdGFydGFwcGVuZDtcclxuXHJcbiAgICBwYXJhbXMuZm9yRWFjaChmdW5jdGlvbih2KXtcclxuICAgICAgICBfcXVlcnlPdXRwdXQ9X3F1ZXJ5T3V0cHV0K3BhcmFtc1tpXS5uYW1lICtzZXBlcmF0b3IrcGFyYW1zW2ldO1xyXG4gICAgICAgIGk9aSsxO1xyXG4gICAgfSk7XHJcbn0qL1xyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyOS4xMS4yMDE2LlxyXG4gKi9cclxuXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cz17XHJcbiAgICBnZXREdW1teV9CSzpnZXREdW1teV9CSyxcclxuICAgIGdldER1bW15X0VEQTpnZXREdW1teV9FREEsXHJcbiAgICBnZXREdW1teV9FREk6Z2V0RHVtbXlfRURJLFxyXG4gICAgZ2V0RHVtbXlfRUZEOmdldER1bW15X0VGRCxcclxuICAgIGdldER1bW15X0VKUEQ6Z2V0RHVtbXlfRUpQRCxcclxuICAgIGdldER1bW15X1VWRUs6Z2V0RHVtbXlfRUpQRCxcclxuICAgIGdldER1bW15X1ZCUzpnZXREdW1teV9WQlMsXHJcbiAgICBnZXREdW1teV9XQkY6Z2V0RHVtbXlfV0JGLFxyXG4gICAgZ2V0U3VwcGxpZXI6Z2V0U3VwcGxpZXJcclxufTtcclxuXHJcbmZ1bmN0aW9uIGdldER1bW15X0JLKGNzdiwgbmFtZSl7XHJcbiAgICB2YXIgbmVzdGVkX2RhdGE9ZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZFtuYW1lXX0pXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZC5kZXB0fSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpe3JldHVybntcclxuICAgICAgICAgICAgc3VtQnVuZGVza2FuemVsdDogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpe3JldHVybiBkW1wiQnVuZGVza2FuemxlaVwiXX0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuZnVuY3Rpb24gZ2V0RHVtbXlfRURBKGNzdiwgbmFtZSl7XHJcbiAgICB2YXIgbmVzdGVkX2RhdGE9ZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZFtuYW1lXX0pXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKXtyZXR1cm4gZC5kZXB0fSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpe3JldHVybntcclxuICAgICAgICAgICAgc3VtRURBOiBkMy5zdW0odiwgZnVuY3Rpb24oZCl7cmV0dXJuIGRbXCIxMDA1IEVEQVwiXX0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldER1bW15X0VESShjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGRbbmFtZV19KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KXtyZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUVESTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpe3JldHVybiBkW1wiQkFHXCJdfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBnZXREdW1teV9FRkQoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkW25hbWVdfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUVGRDogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJFWkZcIl0rIGRbXCJCSVRcIl0rIGRbXCJCQkxcIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuZnVuY3Rpb24gZ2V0RHVtbXlfRUpQRChjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGRbbmFtZV19KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KSB7IHJldHVybntcclxuICAgICAgICAgICAgc3VtQkZNOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJGTVwiXTsgfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0RHVtbXlfVVZFSyhjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGRbbmFtZV19KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KSB7IHJldHVybntcclxuICAgICAgICAgICAgc3VtVVZFSzogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJBU1RSQVwiXTsgfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBnZXREdW1teV9WQlMoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkW25hbWVdfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm57XHJcbiAgICAgICAgICAgIHN1bVZCUzogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJhciBCZXNjaGFmZnVuZ1wiXStkW1wiYXIgUsO8c3R1bmdcIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldER1bW15X1dCRihjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGRbbmFtZV19KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KSB7IHJldHVybntcclxuICAgICAgICAgICAgc3VtV0JGOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkdTLVdCRlwiXStkW1wiQkxXXCJdK2RbXCJBZ3Jvc2NvcGVcIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFN1cHBsaWVyKGNzdiwgbmFtZSkge1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhID0gZDMubmVzdCgpXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLnN1cHBsaWVyOyB9KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5kZXB0OyB9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odikgeyByZXR1cm4gZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDA2IEVEQVwiXTsgfSk7IH0pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0U3VwcGxpZXJcIik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuXHJcbiIsIiAgICAvKipcclxuICAgICAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjQuMTAuMjAxNi5cclxuICAgICAqL1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2PVwiQ1NWL0JLIC0gMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGNzdl9CPVwiQ1NWL0VEQSAtIDIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjc3ZfQz1cIkNTVi9FREkgLSAyMDEyLmNzdlwiO1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2X0Q9XCJDU1YvRUZEIC0gMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGNzdl9FPVwiQ1NWL0VKUEQgLSAyMDExLmNzdlwiO1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2X0Y9XCJDU1YvVVZFSyAtIDIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjc3ZfRz1cIkNTVi9WQlMgLSAyMDExLmNzdlwiO1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2X0g9XCJDU1YvV0JGIC0gMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGpzb249XCJDU1YvbWF0cml4Lmpzb25cIjtcclxuICAgIHZhciBfY3VycmVudGNvbG9yPVwiQ1NWL0NvbG9yLmNzdlwiO1xyXG4gICAgdmFyIF9zdmc7Ly8gPSBkMy5zZWxlY3QoXCJzdmdcIik7XHJcbiAgICB2YXIgX3dpZHRoO1xyXG4gICAgdmFyIF9oZWlnaHQ7XHJcbiAgICB2YXIgX291dGVyUmFkaXVzO1xyXG4gICAgdmFyIF9pbm5lclJhZGl1cztcclxuICAgIHZhciBfbGF5b3V0O1xyXG4gICAgdmFyIF9wYXRoO1xyXG4gICAgdmFyIF9hcmM7XHJcbiAgICB2YXIgX2dyb3VwUGF0aDtcclxuICAgIHZhciBfZ3JvdXA7XHJcbiAgICB2YXIgX2dyb3VwVGV4dDtcclxuICAgIHZhciBfY2hvcmQ7XHJcbiAgICB2YXIgX2Zvcm1hdFBlcmNlbnQ7XHJcbiAgICB2YXIgX3RyYW5zZm9ybV93aWR0aDtcclxuICAgIHZhciBfdHJhbnNmb3JtX2hlaWdodDtcclxuICAgIHZhciBfZ3JvdXBfeDtcclxuICAgIHZhciBfZ3JvdXBfZHk7XHJcbiAgICB2YXIgX21hdHJpeDtcclxuICAgIHZhciBfc3VwcGxpZXI7XHJcbiAgICB2YXIgX2NvbG9yO1xyXG4gICAgdmFyIF9kZXB0O1xyXG4gICAgdmFyIF9kc19zdXBwbGllcjtcclxuICAgIHZhciBfZHNfZGVwdDtcclxuICAgIHZhciBfZHNfY29zdDtcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfRURJO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9FREE7XHJcbiAgICB2YXIgX2RzX3N1cHBsaWVyX0JLO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9FSlBEO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9FRkQ7XHJcbiAgICB2YXIgX2RzX3N1cHBsaWVyX1VWRUs7XHJcbiAgICB2YXIgX2RzX3N1cHBsaWVyX1ZCUztcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfV0JGO1xyXG4gICAgdmFyIF92X2Nob2ljZT1cIkVEQV9FRElfMjAxMVwiOy8vZGVmYXVsdFxyXG4gICAgdmFyIF92aHR0cD1cImh0dHA6Ly9sb2NhbGhvc3Q6NjMzNDIvQkEyMDE2X1N3aXNzX0dvdi9jaG9yZHNfYmEyMDE2L1N1cHBsaWVyXzIwMTZfY2hvcmQuaHRtbFwiO1xyXG4gICAgdmFyIF92bW9kdXM9XCJkZWZhdWx0XCI7XHJcbiAgICB2YXIgX2Vycm9yX2NvdW50ZXI9MDtcclxuICAgIHZhciBfY291bnREZXA9MTtcclxuICAgIC8qY3JlYXRpbmdsaW5rcyovXHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPXtcclxuICAgICAgICBfY3VycmVudGNzdjpfY3VycmVudGNzdixcclxuICAgICAgICBfY3VycmVudGNzdl9COl9jdXJyZW50Y3N2X0IsXHJcbiAgICAgICAgX2N1cnJlbnRjc3ZfQzpfY3VycmVudGNzdl9DLFxyXG4gICAgICAgIF9jdXJyZW50Y3N2X0Q6X2N1cnJlbnRjc3ZfRCxcclxuICAgICAgICBfY3VycmVudGNzdl9FOl9jdXJyZW50Y3N2X0UsXHJcbiAgICAgICAgX2N1cnJlbnRjc3ZfRjpfY3VycmVudGNzdl9GLFxyXG4gICAgICAgIF9jdXJyZW50Y3N2X0c6X2N1cnJlbnRjc3ZfRyxcclxuICAgICAgICBfY3VycmVudGNzdl9IOl9jdXJyZW50Y3N2X0gsXHJcbiAgICAgICAgX2N1cnJlbnRqc29uOl9jdXJyZW50anNvbixcclxuICAgICAgICBfY3VycmVudGNvbG9yOl9jdXJyZW50Y29sb3IsXHJcbiAgICAgICAgX3N2Zzpfc3ZnLFxyXG4gICAgICAgIF93aWR0aDpfd2lkdGgsXHJcbiAgICAgICAgX3dpZHRoOl93aWR0aCxcclxuICAgICAgICBfaGVpZ2h0Ol9oZWlnaHQsXHJcbiAgICAgICAgX291dGVyUmFkaXVzOl9vdXRlclJhZGl1cyxcclxuICAgICAgICBfaW5uZXJSYWRpdXM6X2lubmVyUmFkaXVzLFxyXG4gICAgICAgIF9sYXlvdXQ6X2xheW91dCxcclxuICAgICAgICBfcGF0aDpfcGF0aCxcclxuICAgICAgICBfYXJjOl9hcmMsXHJcbiAgICAgICAgX2dyb3VwUGF0aDpfZ3JvdXBQYXRoLFxyXG4gICAgICAgIF9ncm91cDpfZ3JvdXAsXHJcbiAgICAgICAgX2dyb3VwVGV4dDpfZ3JvdXBUZXh0LFxyXG4gICAgICAgIF9jaG9yZDpfY2hvcmQsXHJcbiAgICAgICAgX2Zvcm1hdFBlcmNlbnQ6X2Zvcm1hdFBlcmNlbnQsXHJcbiAgICAgICAgX3RyYW5zZm9ybV93aWR0aDpfdHJhbnNmb3JtX3dpZHRoLFxyXG4gICAgICAgIF90cmFuc2Zvcm1faGVpZ2h0Ol90cmFuc2Zvcm1faGVpZ2h0LFxyXG4gICAgICAgIF9ncm91cF94Ol9ncm91cF94LFxyXG4gICAgICAgIF9ncm91cF9keTpfZ3JvdXBfZHksXHJcbiAgICAgICAgX21hdHJpeDpfbWF0cml4LFxyXG4gICAgICAgIF9zdXBwbGllcjpfc3VwcGxpZXIsXHJcbiAgICAgICAgX2NvbG9yOl9jb2xvcixcclxuICAgICAgICBfZGVwdDpfZGVwdCxcclxuICAgICAgICBfZHNfc3VwcGxpZXI6X2RzX3N1cHBsaWVyLFxyXG4gICAgICAgIF9kc19kZXB0Ol9kc19kZXB0LFxyXG4gICAgICAgIF9kc19jb3N0Ol9kc19jb3N0LFxyXG4gICAgICAgIF9kc19zdXBwbGllcl9FREkgICAgOl9kc19zdXBwbGllcl9FREksXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VEQSAgICA6X2RzX3N1cHBsaWVyX0VEQSxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfQksgICAgIDpfZHNfc3VwcGxpZXJfQkssXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VKUEQgICA6X2RzX3N1cHBsaWVyX0VKUEQsXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0VGRCAgICA6X2RzX3N1cHBsaWVyX0VGRCxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfVVZFSyAgIDpfZHNfc3VwcGxpZXJfVVZFSyxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfVkJTICAgIDpfZHNfc3VwcGxpZXJfVkJTLFxyXG4gICAgICAgIF9kc19zdXBwbGllcl9XQkYgICAgOl9kc19zdXBwbGllcl9XQkYsXHJcbiAgICAgICAgX3ZfY2hvaWNlOl92X2Nob2ljZSxcclxuICAgICAgICBfdmh0dHA6X3ZodHRwLFxyXG4gICAgICAgIF92bW9kdXM6X3Ztb2R1cyxcclxuICAgICAgICBfZXJyb3JfY291bnRlcjpfZXJyb3JfY291bnRlcixcclxuICAgICAgICBfY291bnREZXA6X2NvdW50RGVwXHJcbiAgICB9IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjEuMTAuMjAxNi5cclxuICovXHJcbi8vN1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxuLyp2YXIgU2V0dGluZ0RhdGEgPSByZXF1aXJlKCcuL1NldHRpbmdEYXRhcy5qcycpO1xyXG5fbWFpbmRhdGEgPSBuZXcgU2V0dGluZ0RhdGEoKTsqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzZWxlY3RjaG9yZHM6c2VsZWN0Y2hvcmRzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbGVjdGNob3JkcygpIHtcclxuICAgIG1vZHVsLl9jaG9yZCA9IG1vZHVsLl9zdmcuc2VsZWN0QWxsKFwiLmNob3JkXCIpXHJcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNob3JkXCIpXHJcbiAgICAgICAgLmRhdGEobW9kdWwuX2xheW91dC5jaG9yZHMpXHJcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicGF0aFwiKVxyXG4gICAgICAgIC5hdHRyKFwiZFwiLCAgbW9kdWwuX3BhdGgsIGZ1bmN0aW9uKGQpe3JldHVybiBkLnN1cHBsaWVyfSlcclxuICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIG1vZHVsLl9zdXBwbGllcltkLnNvdXJjZS5pbmRleF0uY29sb3I7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2R1bC5fY29sb3JbZC5zb3VyY2UuaW5kZXhdLmNvbG9yO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDIxLjEwLjIwMTYuXHJcbiAqL1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxuLyp2YXIgU2V0dGluZ0RhdGEgPSByZXF1aXJlKCcuL1NldHRpbmdEYXRhcy5qcycpO1xyXG52YXIgX21haW5kYXRhID0gbmV3IFNldHRpbmdEYXRhKCk7Ki9cclxuXHJcbm1vZHVsZS5leHBvcnRzID17XHJcbiAgICBuZWlnaGJvcmhvb2Q6bmVpZ2hib3Job29kLFxyXG4gICAgZ3JvdXBQYXRoOmdyb3VwUGF0aCxcclxuICAgIGdyb3VwVGV4dDpncm91cFRleHQsXHJcbiAgICBncm91cHRleHRGaWx0ZXI6Z3JvdXB0ZXh0RmlsdGVyLFxyXG4gICAgbW91c2VvdmVyOm1vdXNlb3ZlclxyXG5cclxufVxyXG5mdW5jdGlvbiBuZWlnaGJvcmhvb2QoKSB7Ly9Mw6RuZGVyYm9nZW5cclxuICAgIGNvbnNvbGUubG9nKFwibmVpZ2hib3JcIik7XHJcbiAgICBtb2R1bC5fZ3JvdXAgPSBtb2R1bC5fc3ZnLnNlbGVjdEFsbChcImcuZ3JvdXBcIilcclxuICAgICAgICAuZGF0YShtb2R1bC5fbGF5b3V0Lmdyb3VwcylcclxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJzdmc6Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJncm91cFwiKVxyXG4gICAgICAgIC5vbihcIm1vdXNlb3ZlclwiLCBtb3VzZW92ZXIpICAgICAvL2RhcsO8YmVyIGZhaHJlblxyXG4gICAgICAgIC5vbihcIm1vdXNlb3V0XCIsIG1vdXNlb3V0KSA7ICAgIC8vZGFyw7xiZXIgZmFocmVuXHJcblxyXG59XHJcbmZ1bmN0aW9uIGdyb3VwUGF0aCgpIHsvL2luIGzDpG5kZXJib2dlbiBlaW5zZXR6ZW5cclxuICAgIG1vZHVsLl9ncm91cFBhdGggPSAgbW9kdWwuX2dyb3VwLmFwcGVuZChcInBhdGhcIilcclxuICAgICAgICAuYXR0cihcImlkXCIsIGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImdyb3VwXCIgKyBpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJkXCIsIG1vZHVsLl9hcmMpXHJcbiAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCwgaSkgey8vRmFyYmUgdW0gQm9nZW5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZHVsLl9jb2xvcltpXS5jb2xvcjtcclxuICAgICAgICB9KTtcclxufVxyXG5mdW5jdGlvbiBncm91cFRleHQoKSB7Ly9kZW4gbMOkbmRlcmJvZ2VuIGJlc2NocmlmdGVuXHJcbiAgICBtb2R1bC5fZ3JvdXBUZXh0ID0gbW9kdWwuX2dyb3VwLmFwcGVuZChcInN2Zzp0ZXh0XCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4XCIsIG1vZHVsLl9ncm91cF94KS8vNlxyXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJzdXBwbGllclwiKVxyXG4gICAgICAgIC5hdHRyKFwiZHlcIiwgbW9kdWwuX2dyb3VwX2R5KTsvL2JybzE1XHJcblxyXG4gICAgLyppZiAobW9kdWwuX0VEQV9jc3ZfID0gXCJjc3YvXCIgKyBcIkR1bW15X0VEQS5jc3ZcIikgeyovXHJcbiAgICAgICAgbW9kdWwuX2dyb3VwVGV4dC5hcHBlbmQoXCJzdmc6dGV4dFBhdGhcIilcclxuICAgICAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIjZ3JvdXBcIiArIGQuaW5kZXg7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50ZXh0KGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtb2R1bC5fc3VwcGxpZXJbaV0ua2V5KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtb2R1bC5fc3VwcGxpZXJbaV0ua2V5O1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgLy9yZXR1cm4gbW9kdWwuX2RzX3N1cHBsaWVyW2ldLmtleTsvL1NwYWx0ZW7DvGJlcnNjaHJpZnRlblxyXG4gICAgICAgICAvLyBtb2R1bC5fZHNfc3VwcGxpZXJbaV0udmFsdWVzWzBdLmtleSA9XCJFREFcIlxyXG4gICAgICAgICAgICAvLyBtb2R1bC5fZHNfc3VwcGxpZXJbaV0udmFsdWVzWzBdLnZhbHVlcyA9IDIwMDAwKHN1bW1lKVxyXG5cclxuICAgIGZ1bmN0aW9uIGdyb3VwVGlja3MoZCkge1xyXG4gICAgICAgIHZhciBrID0gKGQuZW5kQW5nbGUgLSBkLnN0YXJ0QW5nbGUpIC8gZC52YWx1ZTtcclxuICAgICAgICByZXR1cm4gZDMucmFuZ2UoMCwgZC52YWx1ZSwgMTAwMDAwMCkubWFwKGZ1bmN0aW9uICh2LCBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBhbmdsZTogdiAqIGsgKyBkLnN0YXJ0QW5nbGUsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogaSAlIG1vZHVsLl9jb3VudERlcCAhPSAwID8gbnVsbCA6IHYgLyAxMDAwMDAwICsgXCJtXCJcclxuICAgICAgICAgICAgfTsvLzMvL1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgdmFyIGcgPSBtb2R1bC5fc3ZnLnNlbGVjdEFsbChcImcuZ3JvdXBcIilcclxuICAgIHZhciB0aWNrcyA9Zy5zZWxlY3RBbGwoXCJnXCIpXHJcbiAgICAgICAgLmRhdGEoZ3JvdXBUaWNrcylcclxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwicm90YXRlKFwiICsgKGQuYW5nbGUgKiAxODAgLyBNYXRoLlBJIC0gOTApICsgXCIpXCJcclxuICAgICAgICAgICAgICAgICsgXCJ0cmFuc2xhdGUoXCIgKyBtb2R1bC5fb3V0ZXJSYWRpdXMgKyBcIiwwKVwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIHRpY2tzLmFwcGVuZChcImxpbmVcIilcclxuICAgICAgICAuYXR0cihcIngxXCIsIDEpXHJcbiAgICAgICAgLmF0dHIoXCJ5MVwiLCAwKVxyXG4gICAgICAgIC5hdHRyKFwieDJcIiwgNSlcclxuICAgICAgICAuYXR0cihcInkyXCIsIDApXHJcbiAgICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiIzAwMFwiKTtcclxuXHJcbiAgICB0aWNrcy5hcHBlbmQoXCJ0ZXh0XCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4XCIsIDYpXHJcbiAgICAgICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZC5hbmdsZSA+IE1hdGguUEkgP1xyXG4gICAgICAgICAgICAgICAgXCJyb3RhdGUoMTgwKXRyYW5zbGF0ZSgtMTYpXCIgOiBudWxsO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZC5hbmdsZSA+IE1hdGguUEkgPyBcImVuZFwiIDogbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQubGFiZWw7IH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBncm91cHRleHRGaWx0ZXIoKSB7XHJcbiAgICBtb2R1bC5fZ3JvdXBUZXh0LmZpbHRlcihmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbW9kdWwuX2dyb3VwUGF0aFswXVtpXS5nZXRUb3RhbExlbmd0aCgpIC8gMiAtIDE2IDwgdGhpcy5nZXRDb21wdXRlZFRleHRMZW5ndGgoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5yZW1vdmUoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbW91c2VvdmVyKGQsIGkpIHtcclxuICAgIG1vZHVsLl9jaG9yZC5jbGFzc2VkKFwiZmFkZVwiLCBmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgcmV0dXJuIHAuc291cmNlLmluZGV4ICE9IGlcclxuICAgICAgICAgICAgJiYgcC50YXJnZXQuaW5kZXggIT0gaTtcclxuICAgIH0pXHJcbiAgICAudHJhbnNpdGlvbigpXHJcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDAuMSk7XHJcbn1cclxuZnVuY3Rpb24gbW91c2VvdXQoZCwgaSkge1xyXG4gICAgbW9kdWwuX2Nob3JkLmNsYXNzZWQoXCJmYWRlXCIsIGZ1bmN0aW9uKHApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHAuc291cmNlLmluZGV4ICE9IGlcclxuICAgICAgICAgICAgICAgICYmIHAudGFyZ2V0LmluZGV4ICE9IGk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcclxufVxyXG5cclxuXHJcblxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxuXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcbkRhdGFNYW5hZ2VyID0gcmVxdWlyZSgnLi9EYXRhTWFuYWdlcicpO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgcmVhZGNzdjpyZWFkY3N2XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRjc3YoZGF0YSwgZGF0YV9CLGRhdGFfQyxkYXRhX0QsZGF0YV9FLCBkYXRhX0YsZGF0YV9HLGRhdGFfSCAsbWF0cml4KSAge1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgcmVhZGNzdlwiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgICB2YXIgc3VwcGxpZXI7XHJcbiAgICB2YXIgY3N2YWxsO1xyXG4gICAgdmFyIGZpbHRlcmNvbnRlbnQ7XHJcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBcIiArbW9kdWwuX3ZfY2hvaWNlKTtcclxuICAgIC8vY29tcGFyZUNTVihkYXRhLCBkYXRhX0IsZGF0YV9DLGRhdGFfRCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICBzd2l0Y2ggKG1vZHVsLl92X2Nob2ljZSl7XHJcbiAgICAgICAgY2FzZSBcIkVEQV9FRElfMjAxMVwiOi8vRURBIDIwMTEsIEVESSAyMDExXHJcbiAgICAgICAgY2FzZSBcIkVEQV9FRElfMjAxMlwiOi8vRURBIDIwMTIsIEVESSAyMDExXHJcbiAgICAgICAgY2FzZSBcIkVEQV9FRElfMjAxM1wiOi8vRURBIDIwMTMsIEVESSAyMDExXHJcbiAgICAgICAgY2FzZSBcIkVEQV9FRElfMjAxNFwiOi8vRURBIDIwMTQsIEVESSAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiQWlyUGx1cyBJbnRlcm5hdGlvbmFsIEFHXCIsXCJTY2h3ZWl6ZXJpc2NoZSBCdW5kZXNiYWhuZW4gU0JCXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSxmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGEsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREk9IERhdGFNYW5hZ2VyLmdldER1bW15X0VESShkYXRhX0IsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoW21vZHVsLl9kc19zdXBwbGllcl9FREEsbW9kdWwuX2RzX3N1cHBsaWVyX0VESV0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLFwic3VtRURBXCIsIFwic3VtRURJXCIsIFtcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VESV8yMDExXCI6Ly9CSyBFREEgMjAxMSxcclxuICAgICAgICBjYXNlIFwiQktfRURJXzIwMTJcIjovL0JLIEVEQSAyMDEyLFxyXG4gICAgICAgIGNhc2UgXCJCS19FRElfMjAxM1wiOi8vQksgRURBIDIwMTMsXHJcbiAgICAgICAgY2FzZSBcIkJLX0VESV8yMDE0XCI6Ly9CSyBFREEgMjAxNCxcclxuICAgICAgICAgICAgZmlsdGVyY29udGVudD1bXCJBaXJQbHVzIEludGVybmF0aW9uYWwgQUdcIixcIlNjaHdlaXplcmlzY2hlIEJ1bmRlc2JhaG5lbiBTQkJcIl07XHJcbiAgICAgICAgICAgIGRhdGEgPWZpbHRlcihkYXRhLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQiA9ZmlsdGVyKGRhdGFfQixmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURJPSBEYXRhTWFuYWdlci5nZXREdW1teV9CSyhkYXRhLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREEoZGF0YV9CLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFttb2R1bC5fZHNfc3VwcGxpZXJfRURBLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURJXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsIFwic3VtRURBXCIsIFwic3VtQnVuZGVza2FuemVsdFwiLCBbXCJzdW1FREFcIixcInN1bUJ1bmRlc2thbnplbHRcIl0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDExXCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDEyXCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDEzXCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDE0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICAgICAgZmlsdGVyY29udGVudD1bXCJBaXJQbHVzIEludGVybmF0aW9uYWwgQUdcIixcIlNjaHdlaXplcmlzY2hlIEJ1bmRlc2JhaG5lbiBTQkJcIixcclxuICAgICAgICAgICAgICAgIFwiRGllIFNjaHdlaXplcmlzY2hlIFBvc3QgU2VydmljZSBDZW50ZXIgRmluYW56ZW4gTWl0dGVcIl07XHJcbiAgICAgICAgICAgIGRhdGEgPWZpbHRlcihkYXRhLCBmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9DID1maWx0ZXIoZGF0YV9DLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmlsdGVyIGNyZWF0ZWRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9CSz0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfQksoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbIG1vZHVsLl9kc19zdXBwbGllcl9CSywgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VESV0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLCBcInN1bUVEQVwiLCBcInN1bUJ1bmRlc2thbnplbHRcIiwgW1wic3VtQnVuZGVza2FuemVsdFwiLFwic3VtRURBXCIsXCJzdW1FRElcIl0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDExX1RyaVwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMl9UcmlcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTNfVHJpXCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDE0X1RyaVwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiVHJpdmFkaXMgQUdcIixcIlNjaHdlaXplcmlzY2hlIEJ1bmRlc2JhaG5lbiBTQkJcIixcclxuICAgICAgICAgICAgICAgIFwiRGllIFNjaHdlaXplcmlzY2hlIFBvc3QgU2VydmljZSBDZW50ZXIgRmluYW56ZW4gTWl0dGVcIl07XHJcbiAgICAgICAgICAgIGRhdGEgPWZpbHRlcihkYXRhLCBmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9DID1maWx0ZXIoZGF0YV9DLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmlsdGVyIGNyZWF0ZWRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9CSz0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfQksoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbIG1vZHVsLl9kc19zdXBwbGllcl9CSywgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VESV0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLCBcInN1bUVEQVwiLCBcInN1bUJ1bmRlc2thbnplbHRcIiwgW1wic3VtQnVuZGVza2FuemVsdFwiLFwic3VtRURBXCIsXCJzdW1FRElcIl0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDExX0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMl9DYXRcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCJCS19FREFfRURJXzIwMTNfQ2F0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV8yMDE0X0NhdFwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiSGFyZHdhcmVcIixcIlNXLVBmbGVnZSB1bmQgSFcgV2FydHVuZ1wiLFxyXG4gICAgICAgICAgICBcIkluZm9ybWF0aWstREwgZXhrbC4gUGVyc29uYWx2ZXJsZWloIGltIEJlcmVpY2ggSUtUXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSwgZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQiA9ZmlsdGVyKGRhdGFfQixmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgZGF0YV9DID1maWx0ZXIoZGF0YV9DLGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlciBjcmVhdGVkXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREEoZGF0YV9CLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREldKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCwgXCJzdW1FREFcIiwgXCJzdW1CdW5kZXNrYW56ZWx0XCIsIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMV9DYXRfMlwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMl9DYXRfMlwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxM19DYXRfMlwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxNF9DYXRfMlwiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiQWxsZy4gQmVyYXR1bmdzLURMIGltIEZhY2hiZXJlaWNoIGVpbmVzIEFtdGVzIHVuZCBIb25vcmFyZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJCZXJhdHVuZ3MtREwgZsO8ciBNYW5hZ2VtZW50IHVuZCBPcmdhbmlzYXRpb24gc293aWUgQ29hY2hpbmdcIixcclxuICAgICAgICAgICAgICAgIFwiU1ctUGZsZWdlIHVuZCBIVyBXYXJ0dW5nXCJdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSwgZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQiA9ZmlsdGVyKGRhdGFfQixmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgZGF0YV9DID1maWx0ZXIoZGF0YV9DLGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlciBjcmVhdGVkXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREEoZGF0YV9CLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREldKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCwgXCJzdW1FREFcIiwgXCJzdW1CdW5kZXNrYW56ZWx0XCIsIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMV9DYXRfM1wiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxMl9DYXRfM1wiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxM19DYXRfM1wiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfMjAxNF9DYXRfM1wiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgICAgIGZpbHRlcmNvbnRlbnQ9W1wiUG9zdGRpZW5zdGVcIixcIkFsbGcuIEJlcmF0dW5ncy1ETCBpbSBGYWNoYmVyZWljaCBlaW5lcyBBbXRlcyB1bmQgSG9ub3JhcmVcIixcclxuICAgICAgICAgICAgICAgIFwiSGFyZHdhcmVcIl07XHJcbiAgICAgICAgICAgIGRhdGEgPWZpbHRlcihkYXRhLCBmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBkYXRhX0MgPWZpbHRlcihkYXRhX0MsZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmlsdGVyIGNyZWF0ZWRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9CSz0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfQksoZGF0YSwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREE9IERhdGFNYW5hZ2VyLmdldER1bW15X0VEQShkYXRhX0IsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURJPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREkoZGF0YV9DLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbIG1vZHVsLl9kc19zdXBwbGllcl9CSywgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VESV0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLCBcInN1bUVEQVwiLCBcInN1bUJ1bmRlc2thbnplbHRcIiwgW1wic3VtQnVuZGVza2FuemVsdFwiLFwic3VtRURBXCIsXCJzdW1FRElcIl0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV9FSlBEXzIwMTFfQ2F0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV9FSlBEXzIwMTJfQ2F0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV9FSlBEXzIwMTNfQ2F0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiQktfRURBX0VESV9FSlBEXzIwMTRfQ2F0XCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICAgICAgZmlsdGVyY29udGVudD1bXCJJbmZvcm1hdGlvbnNhcmJlaXRcIixcIkluZm9ybWF0aWstREwgZXhrbC4gUGVyc29uYWx2ZXJsZWloIGltIEJlcmVpY2ggSUtUXCIsXHJcbiAgICAgICAgICAgICAgICBcIkhhcmR3YXJlXCIsXCJQb3N0ZGllbnN0ZVwiXTtcclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsIGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50LCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgZGF0YV9EID1maWx0ZXIoZGF0YV9ELGZpbHRlcmNvbnRlbnQsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbHRlciBjcmVhdGVkXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfQks9IERhdGFNYW5hZ2VyLmdldER1bW15X0JLKGRhdGEsIFwiZnVsbENhdGVnb3J5XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBEYXRhTWFuYWdlci5nZXREdW1teV9FREEoZGF0YV9CLCBcImZ1bGxDYXRlZ29yeVwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FSlBEPSBEYXRhTWFuYWdlci5nZXREdW1teV9FSlBEKGRhdGFfRCwgXCJmdWxsQ2F0ZWdvcnlcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREksbW9kdWwuX2RzX3N1cHBsaWVyX0VKUERdKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCwgXCJzdW1FREFcIiwgXCJzdW1CdW5kZXNrYW56ZWx0XCIsIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCIsIFwic3VtQkZNXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIkJLX0VEQV9FRElfRUZEX0VKUERfVVZFS19WQlNfV0JGXzIwMTFcIjpcclxuICAgICAgICAgICAgZmlsdGVyY29udGVudD1bXCJBaXJQbHVzIEludGVybmF0aW9uYWwgQUdcIixcIlNjaHdlaXplcmlzY2hlIEJ1bmRlc2JhaG5lbiBTQkJcIixcclxuICAgICAgICAgICAgICAgIFwiRGllIFNjaHdlaXplcmlzY2hlIFBvc3QgU2VydmljZSBDZW50ZXIgRmluYW56ZW4gTWl0dGVcIixcIlNSRyBTU1IgaWTDqWUgc3Vpc3NlIE1lZGlhIFNlcnZpY2VzXCIsXHJcbiAgICAgICAgICAgICAgICBcIlVuaXZlcnNhbC1Kb2IgQUdcIixcIkRlbGwgU0FcIixcIkRITCBFeHByZXNzIChTY2h3ZWl6KSBBR1wiLFwiQWxsaWFueiBTdWlzc2UgVmVyc2ljaGVydW5ncy1HZXNlbGxzY2hhZnRcIlxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSwgZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0QgPWZpbHRlcihkYXRhX0QsZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9FID1maWx0ZXIoZGF0YV9FLCBmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0Y9ZmlsdGVyKGRhdGFfRixmaWx0ZXJjb250ZW50LCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBkYXRhX0cgPWZpbHRlcihkYXRhX0csZmlsdGVyY29udGVudCwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgZGF0YV9IID1maWx0ZXIoZGF0YV9ILGZpbHRlcmNvbnRlbnQsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9CSz0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfQksoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQywgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VGRD0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfRUZEKGRhdGFfRSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VKUEQ9IERhdGFNYW5hZ2VyLmdldER1bW15X0VKUEQoZGF0YV9ELCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfVVZFSz0gRGF0YU1hbmFnZXIuZ2V0RHVtbXlfVVZFSyhkYXRhX0YsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9WQlM9IERhdGFNYW5hZ2VyLmdldER1bW15X1ZCUyhkYXRhX0csIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9XQkY9IERhdGFNYW5hZ2VyLmdldER1bW15X1dCRihkYXRhX0gsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoWyBtb2R1bC5fZHNfc3VwcGxpZXJfQkssIG1vZHVsLl9kc19zdXBwbGllcl9FREEsIG1vZHVsLl9kc19zdXBwbGllcl9FREksIG1vZHVsLl9kc19zdXBwbGllcl9FRkQsXHJcbiAgICAgICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRUpQRCwgbW9kdWwuX2RzX3N1cHBsaWVyX1VWRUssIG1vZHVsLl9kc19zdXBwbGllcl9WQlMsIG1vZHVsLl9kc19zdXBwbGllcl9XQkYsXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLCBcInN1bUVEQVwiLCBcInN1bUJ1bmRlc2thbnplbHRcIixcclxuICAgICAgICAgICAgICAgIFtcInN1bUJ1bmRlc2thbnplbHRcIixcInN1bUVEQVwiLFwic3VtRURJXCIsIFwic3VtRUZEXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJzdW1CRk1cIiwgXCJzdW1VVkVLXCIsIFwic3VtVkJTXCIsIFwic3VtV0JGXCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImNzdi9FREEgLSAyMDExLmNzdlwiOlxyXG4gICAgICAgIGNhc2UgXCJjc3YvRURBIC0gMjAxMy5jc3ZcIjpcclxuICAgICAgICBjYXNlIFwiY3N2L0VEQSAtIDIwMTQuY3N2XCI6XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcl9FREE9IERhdGFNYW5hZ2VyLmdldFN1cHBsaWVyX0VEQShtb2R1bC5fc3VwcGxpZXIsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIHN1cHBsaWVyID0gbWF0cml4X1N1cHBsaWVyX0VEQShtb2R1bC5fZHNfc3VwcGxpZXJfRURBLCA0KTtcclxuICAgICAgICAgICAgbW9kdWwuX3N1cHBsaWVyPSBtb2R1bC5fZHNfc3VwcGxpZXJfRURBO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiRHVtbXlcIjpcclxuICAgICAgICAgICAgdmFyIGR1bW15RURBPURhdGFNYW5hZ2VyLmdldER1bW15X0VEQShkYXRhLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICB2YXIgZHVtbXlFREk9RGF0YU1hbmFnZXIuZ2V0RHVtbXlfRURJKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbZHVtbXlFREEsIGR1bW15RURJXSk7XHJcbiAgICAgICAgICAgIC8vbW9kdWwuX2RzX3N1cHBsaWVyID0gbWF0cml4X2R1bW1heV9BbGwoY3N2YWxsKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyPW1hdHJpeF9FRElfRURBKGNzdmFsbCxcInN1bUVEQVwiLCBcInN1bUVESVwiLCBbXCJzdW1FREFcIixcInN1bUVESVwiXSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVhZGNzdjpkZWZhdWx0XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXIgICAgPSBEYXRhTWFuYWdlci5nZXRTdXBwbGllcihtb2R1bC5fc3VwcGxpZXIsIFwic3VwcGxpZXJcIik7Ly9uZXN0XHJcbiAgICAgICAgICAgIHN1cHBsaWVyID0gbWF0cml4X1N1cHBsaWVyKGRhdGEpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfZGVwdCAgICAgICAgPSBEYXRhTWFuYWdlci5nZXREZXAobW9kdWwuX3N1cHBsaWVyLCBcImRlcHRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19jb3N0ICAgICAgICA9IERhdGFNYW5hZ2VyLmdldENvc3QobW9kdWwuX3N1cHBsaWVyLCBcIkVEQV8xMDA2XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJzZXRtYXRyaXhcIik7XHJcbn1cclxuZnVuY3Rpb24gZmlsdGVyKGRhdGEsIHBhcmFtLCBmaWx0ZXJuYW1lKXtcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIGZpbHRlclwiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgIC8qIGlmIChwYXJhbS5sZW5ndGg9PTIpe1xyXG4gICAgICAgIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgaWYgKHJvd1tmaWx0ZXJuYW1lXSA9PSBwYXJhbVswXVxyXG4gICAgICAgICAgICAgICAgfHwgIHJvd1tmaWx0ZXJuYW1lXSA9PSBwYXJhbVsxXVxyXG4gICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIHsgIHJldHVybiByb3c7ICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlICBpZiAocGFyYW0ubGVuZ3RoPT0zKXtcclxuICAgICAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24ocm93KSB7XHJcbiAgICAgICAgICAgIGlmIChyb3dbZmlsdGVybmFtZV0gPT0gcGFyYW1bMF1cclxuICAgICAgICAgICAgICAgIHx8ICByb3dbZmlsdGVybmFtZV0gPT0gcGFyYW1bMV1cclxuICAgICAgICAgICAgICAgIHx8ICByb3dbZmlsdGVybmFtZV0gPT0gcGFyYW1bMl0pXHJcbiAgICAgICAgICAgIHsgIHJldHVybiByb3c7ICAgIH1cclxuICAgICAgICB9KTsqL1xyXG4gICAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgIGZvciAodmFyIGk9MDtpPCBwYXJhbS5sZW5ndGg7aSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChyb3dbZmlsdGVybmFtZV09PSBwYXJhbVtpXSlcclxuICAgICAgICAgICAgICAgIHJldHVybiByb3c7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG59XHJcbmZ1bmN0aW9uIG1hdHJpeF9TdXBwbGllcihkYXRhKSB7XHJcbiAgICAgICAgdmFyIG1hdHJpeCA9IFtdO1xyXG4gICAgICAgIHZhciBjb3VudGVyPTA7XHJcbiAgICAgICAgLy9tb2R1bC5fZHNfc3VwcGxpZXJbaV0udmFsdWVzWzBdLmtleSA9XCJFREFcIlxyXG4gICAgICAgIHZhciBzdXBwbGllciA9IGQzLmtleXMoZGF0YVswXSkuc2xpY2UoMSk7XHJcbiAgICAgICAgLy9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgICAgICBpZiAoY291bnRlciA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtcm93ID0gW107XHJcbiAgICAgICAgICAgICAgICBzdXBwbGllci5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT0gXCIxMDA1IEVEQVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtcm93LnB1c2goTnVtYmVyKHJvd1tjXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjID09IFwiMTAwNiBFREFcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgbXJvdy5wdXNoKE51bWJlcihyb3dbY10pKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICAgICAgcmV0dXJuIHN1cHBsaWVyO1xyXG4gICAgfVxyXG5cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyX0VESShkYXRhLCBlbmQpIHtcclxuICAgIC8vRmlsbCBNYXRyaXggRURBXHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgY291bnRlcj0wO1xyXG4gICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKTtcclxuICAgIC8vU3BhbHRlbsO8YmVyc2NocmlmdGVuXHJcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgIGlmIChjb3VudGVyIDwgZW5kKSB7XHJcbiAgICAgICAgICAgIHZhciBtcm93ID0gW107XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtR1NFRElcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVCR1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkFSXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CQUtcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bU1ldGVvQ0hcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUJBR1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkZTXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CU1ZcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bVNCRlwiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtTkJcIl0pO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hdHJpeF9TdXBwbGllcl9FREFcIik7XHJcbiAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb21wYXJlQ1NWKGRhdGFBLCBkYXRhQiwgZGF0YUMsZGF0YUQsIGZpZWxkKSB7XHJcbiAgICB2YXIgbXJvdyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhQS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0YUIubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKGRhdGFBW2ldW2ZpZWxkXSA9PSBkYXRhQltqXVtmaWVsZF0pIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZGF0YUMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YUFbaV1bZmllbGRdID09IGRhdGFDW2tdW2ZpZWxkXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgbCA9IDA7IGwgPCBkYXRhRC5sZW5ndGg7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFBW2ldW2ZpZWxkXSA9PSBkYXRhRFtsXVtmaWVsZF0pe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtcm93Lmxlbmd0aCA8IDQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtcm93LnB1c2goZGF0YUFbaV1bZmllbGRdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrZXhpc3RSb3cobXJvdywgZGF0YUFbaV1bZmllbGRdKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1yb3cucHVzaChkYXRhQVtpXVtmaWVsZF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCIqKioqKioqKioqKlJlc3VsdDpjb21wYXJlIENTVlwiKTtcclxuICAgIGNvbnNvbGUubG9nKFwiKioqKioqKioqKipcIitmaWVsZCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1yb3cubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgY29uc29sZS5sb2cobXJvd1tpXSk7XHJcbn1cclxuZnVuY3Rpb24gY2hlY2tleGlzdFJvdyhtcm93LCBvbmVyb3cpe1xyXG4gICAgLyppZiAobXJvdy5sZW5ndGg+MilcclxuICAgICBpZiAoY2hlY2tleGlzdFJvdyhtcm93LCBkYXRhQ1trXVtmaWVsZF0pKVxyXG4gICAgIG1yb3cucHVzaChkYXRhQVtpXVtmaWVsZF0pOyovXHJcbiAgICB2YXIgY2hlY2s9dHJ1ZTtcclxuICAgaWYgKG1yb3cubGVuZ3RoID4gMSl7XHJcbiAgICAgICBmb3IodmFyIGk9MDtpPG1yb3cubGVuZ3RoO2krKyl7XHJcbiAgICAgICAgICAgaWYgKG1yb3dbaV09PW9uZXJvdyl7XHJcbiAgICAgICAgICAgICAgIGNoZWNrPWZhbHNlO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgIH1cclxuICAgfVxyXG4gICAgcmV0dXJuIGNoZWNrO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRyaXhfRURJX0VEQShEYXRhRURJX0VEQSwgTmFtZV9zdW1FREEsIE5hbWVfc3VtRURJLCBOYW1lc19zdW1zRURBX0VESV9CSyl7XHJcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBtYXRyaXhfRURJX0VEQSBmaWxlc1wiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgc3VwcGxpZXI9XCJcIjtcclxuICAgIHZhciBtaW51cz00MDAwMDAwO1xyXG4gICAgdmFyIGxlbmd0aCA9IERhdGFFRElfRURBLmxlbmd0aDtcclxuICAgIHZhciB0b3RhbGxlbmd0aCA9IChsZW5ndGgvKE5hbWVzX3N1bXNFREFfRURJX0JLLmxlbmd0aCkpKjI7XHJcbiAgICB2YXIgbWlkZGxlPSBkMy5yb3VuZChsZW5ndGgvTmFtZXNfc3Vtc0VEQV9FRElfQksubGVuZ3RoKTtcclxuICAgIHZhciB2b2JqZWN0aWQ9MDtcclxuXHJcbiAgICAvL0FycmF5IGZpbHRlcm5cclxuICAgIGZvciAodmFyIGk9MDtpPHRvdGFsbGVuZ3RoO2krKyApe1xyXG4gICAgICAgIHZhciBtcm93PVtdO1xyXG4gICAgICAgIGlmIChpPT1taWRkbGUpXHJcbiAgICAgICAgICAgIHZvYmplY3RpZD0wO1xyXG4gICAgICAgIGlmIChpIDwgbWlkZGxlKXtcclxuICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxtaWRkbGU7aisrKVxyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKDApO1xyXG4gICAgICAgICAgICBmb3IodmFyIGo9MDtqPG1pZGRsZTtqKyspe1xyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKGdldE1hdHJpeFZhbHVlKERhdGFFRElfRURBW3ZvYmplY3RpZF0sTmFtZXNfc3Vtc0VEQV9FRElfQkssdm9iamVjdGlkICkpO1xyXG4gICAgICAgICAgICAgICAgdm9iamVjdGlkKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxtaWRkbGU7aisrKXtcclxuICAgICAgICAgICAgICAgIG1yb3cucHVzaChnZXRNYXRyaXhWYWx1ZShEYXRhRURJX0VEQVt2b2JqZWN0aWRdLE5hbWVzX3N1bXNFREFfRURJX0JLLHZvYmplY3RpZCkpO1xyXG4gICAgICAgICAgICAgICAgdm9iamVjdGlkKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxtaWRkbGU7aisrKVxyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuICAgIH1cclxuICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICB3aGlsZShtb2R1bC5fc3VwcGxpZXIubGVuZ3RoID4gMClcclxuICAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnBvcCgpO1xyXG4gICAgY3JlYXRlU3VwcGxpZXJMaXN0KERhdGFFRElfRURBLE5hbWVzX3N1bXNFREFfRURJX0JLICk7XHJcblxyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgbWF0cml4X0VESV9FREFcIik7XHJcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVTdXBwbGllckxpc3QoZGF0YVJvd3MsIHN1cHBsaWVyX2ZpZWxkKXtcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIGNyZWF0ZVN1cHBsaWVyTGlzdFwiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgICB2YXIgdl9TdXBwbGllcj1zdXBwbGllcl9maWVsZC5sZW5ndGg7XHJcbiAgICB2YXIgaT0wO1xyXG4gICAgdmFyIGVuZDtcclxuICAgIGlmICh2X1N1cHBsaWVyPT00KXtcclxuICAgICAgICBlbmQ9dl9TdXBwbGllciozO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBlbmQ9dl9TdXBwbGllcioyO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJjcmVhdGVTdXBwbGllckxpc3Q6XCIrZW5kKTtcclxuXHJcbiAgICAvL2ZpcnN0IGRlcHRcclxuICAgIGlmIChlbmQ9PTQpe1xyXG4gICAgICAgIHdoaWxlKCBpPGVuZCl7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgIGk9aSt2X1N1cHBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGVuZD09NiB8fCBlbmQ9PTEyKXtcclxuICAgICAgICB3aGlsZSggaTw9ZW5kKXtcclxuICAgICAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnB1c2goZGF0YVJvd3NbaV0udmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgaT1pK3ZfU3VwcGxpZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZXsvL3Rlc3RcclxuICAgICAgICB3aGlsZSggaTw4KXtcclxuICAgICAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnB1c2goZGF0YVJvd3NbaV0udmFsdWVzWzBdKTtcclxuICAgICAgICAgICAgaT1pKzM7fVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIGNyZWF0ZVN1cHBsaWVyTGlzdCBcIitcImRlcHRcIik7XHJcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xyXG5cclxuICAgIC8vc2Vjb25kIHN1cHBsaWVyXHJcbiAgICBmb3IgKHZhciBpPTA7aTx2X1N1cHBsaWVyOyBpKyspe1xyXG4gICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIGNyZWF0ZVN1cHBsaWVyTGlzdCBcIitcInN1cHBsaWVyXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxufVxyXG5mdW5jdGlvbiBnZXRNYXRyaXhWYWx1ZShyb3csbmFtZVZhbHVlLCBjb3VudGVyKXtcclxuICAgIHZhciBkZXBOYW1lOyAgICAvL2dldCBGaWVsZG5hbWUgc3VtIG9mIGVhY2ggRGVwYXJ0bWVudFxyXG4gICAgdmFyIHJlc3VsdDtcclxuICAgIGlmIChuYW1lVmFsdWUubGVuZ3RoPT0yKSB7XHJcbiAgICAgICAgc3dpdGNoIChjb3VudGVyKSB7Ly8yIFN1cHBsaWVyXHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgZGVwTmFtZSA9IG5hbWVWYWx1ZVswXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGRlcE5hbWUgPSBuYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAgIGVsc2UgaWYgKG5hbWVWYWx1ZS5sZW5ndGg9PTMpe1xyXG4gICAgICAgICAgICBzd2l0Y2goY291bnRlcil7Ly8zIFN1cHBsaWVyXHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYobmFtZVZhbHVlLmxlbmd0aD09NCkgICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoKGNvdW50ZXIpey8vNCBTdXBwbGllclxyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA2OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA4OlxyXG4gICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxMDpcclxuICAgICAgICAgICAgICAgIGNhc2UgMTE6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEyOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgMTQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE1OlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzNdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChuYW1lVmFsdWUubGVuZ3RoPT04KXtcclxuICAgICAgICAgIGlmIChjb3VudGVyIDw4KXtcclxuICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVswXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGNvdW50ZXIgPCAxNil7XHJcbiAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChjb3VudGVyIDwgMjQpe1xyXG4gICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzJdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoY291bnRlciA8IDMyKXtcclxuICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVszXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKGNvdW50ZXIgPCA0MCl7XHJcbiAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbNF07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmIChjb3VudGVyIDwgNDgpe1xyXG4gICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzVdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoY291bnRlciA8IDU2KXtcclxuICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVs2XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbN107XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgICAgIGlmIChyb3cudmFsdWVzWzBdLnZhbHVlc1tkZXBOYW1lXT09bnVsbCl7XHJcbiAgICAgICAgICAgIHJlc3VsdD0wO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICByZXN1bHQ9ZDMucm91bmQocm93LnZhbHVlc1swXS52YWx1ZXNbZGVwTmFtZV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyX0VEQShkYXRhLCBlbmQpIHtcclxuICAgIC8vRmlsbCBNYXRyaXggRURBXHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgY291bnRlcj0wO1xyXG4gICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKTtcclxuXHJcbiAgICAvL1NwYWx0ZW7DvGJlcnNjaHJpZnRlblxyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcclxuICAgICAgICBpZiAoY291bnRlciA8IGVuZCkge1xyXG4gICAgICAgICAgICB2YXIgbXJvdyA9IFtdO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVEQTEwMDVcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVEQTEwMDZcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bTEwOTdcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bTExMTJcIl0pO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgY29uc29sZS5sb2coXCJtYXRyaXhfU3VwcGxpZXJfRURJXCIpO1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtZXJnaW5nRmlsZXMoY3N2RmlsZXMpIHtcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyICArXCIgbWVyZ2luZyBmaWxlc1wiKTtcclxuICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICB2YXIgb3V0cHV0O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjc3ZGaWxlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHJlc3VsdHMucHVzaChjc3ZGaWxlc1tpXSk7XHJcbiAgICB9XHJcbiAgICBvdXRwdXQgPSBkMy5tZXJnZShyZXN1bHRzKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG59XHJcblxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgY3JlYXRlQXJjOmNyZWF0ZUFyYyxcclxuICAgIGxheW91dDpsYXlvdXQsXHJcbiAgICBwYXRoOnBhdGgsXHJcbiAgICBzZXRTVkc6c2V0U1ZHLFxyXG4gICAgYXBwZW5kQ2lyY2xlOmFwcGVuZENpcmNsZSxcclxuICAgIG1vdmVzdmc6bW92ZXN2ZyxcclxuICAgIHN0YXJ0cXVldWU6c3RhcnRxdWV1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBcmMoKXtcclxuICAgIG1vZHVsLl9hcmMgPSBkMy5zdmcuYXJjKClcclxuICAgICAgICAuaW5uZXJSYWRpdXMobW9kdWwuX2lubmVyUmFkaXVzKVxyXG4gICAgICAgIC5vdXRlclJhZGl1cyhtb2R1bC5fb3V0ZXJSYWRpdXMpXHJcbiAgICBjb25zb2xlLmxvZyhcImNyZWF0ZUFyY1wiKTtcclxufVxyXG4vLzNcclxuZnVuY3Rpb24gbGF5b3V0KCl7Ly9wYWRkaW5nIDAuMDQgYWJzdGFuZCA0JVxyXG4gICAgbW9kdWwuX2xheW91dCA9IGQzLmxheW91dC5jaG9yZCgpXHJcbiAgICAgICAgLnBhZGRpbmcoLjA0KVxyXG4gICAgICAgIC5zb3J0U3ViZ3JvdXBzKGQzLmRlc2NlbmRpbmcpXHJcbiAgICAgICAgLnNvcnRDaG9yZHMoZDMuYXNjZW5kaW5nKTtcclxuICAgIGNvbnNvbGUubG9nKFwibGF5b3V0XCIpO1xyXG59XHJcbi8vNFxyXG5mdW5jdGlvbiBwYXRoKCl7XHJcbiAgICBtb2R1bC5fcGF0aCA9IGQzLnN2Zy5jaG9yZCgpXHJcbiAgICAgICAgLnJhZGl1cyhtb2R1bC5faW5uZXJSYWRpdXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwYXRoXCIpO1xyXG59XHJcbi8vNVxyXG5mdW5jdGlvbiBzZXRTVkcoKXtcclxuICAgIG1vZHVsLl9zdmcgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgbW9kdWwuX3dpZHRoKVxyXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsbW9kdWwuX2hlaWdodClcclxuICAgICAgICAuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgIC5hdHRyKFwiaWRcIiwgXCJjaXJjbGVcIilcclxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1vZHVsLl93aWR0aCAvIDIgKyBcIixcIiArIG1vZHVsLl9oZWlnaHQgLyAyICsgXCIpXCIpO1xyXG59XHJcblxyXG5cclxuLy82XHJcbmZ1bmN0aW9uIGFwcGVuZENpcmNsZSgpe1xyXG4gICAgbW9kdWwuX3N2Zy5hcHBlbmQoXCJjaXJjbGVcIilcclxuICAgICAgICAuYXR0cihcInJcIixtb2R1bC5fb3V0ZXJSYWRpdXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJhcHBlbmRDaXJjbGVcIik7XHJcbn1cclxuLy8xNFxyXG5mdW5jdGlvbiBtb3Zlc3ZnKCl7XHJcbiAgICBtb2R1bC5fc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIilcclxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIG1vZHVsLl93aWR0aClcclxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCBtb2R1bC5faGVpZ2h0KVxyXG4gICAgICAgIC5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIrbW9kdWwuX3dpZHRoK1wiLFwiK21vZHVsLl9oZWlnaHQrXCIpXCIpO1xyXG4gICAgY29uc29sZS5sb2coXCJtb3Zlc3ZnXCIpO1xyXG59XHJcbmZ1bmN0aW9uIHN0YXJ0cXVldWUoY3N2X25hbWUsIGpzb25fbmFtZSl7XHJcbiAgICBxdWV1ZSgpXHJcbiAgICAgICAgLmRlZmVyKGQzLmNzdiwgY3N2X25hbWUpXHJcbiAgICAgICAgLmRlZmVyKGQzLmpzb24sIGpzb25fbmFtZSlcclxuICAgICAgICAuYXdhaXQoa2VlcERhdGEpOy8vb25seSBmdW5jdGlvbiBuYW1lIGlzIG5lZWRlZFxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjEuMTAuMjAxNi5cclxuICovXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcbm1vZHVsZS5leHBvcnRzPXtcclxuICAgIGNyZWF0ZVRpdGxlOmNyZWF0ZVRpdGxlXHJcbn1cclxuIGZ1bmN0aW9uIGNyZWF0ZVRpdGxlKCkge1xyXG4gICAgIG1vZHVsLl9jaG9yZC5hcHBlbmQoXCJ0aXRsZVwiKS50ZXh0KGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgcmV0dXJuIG1vZHVsLl9zdXBwbGllcltkLnNvdXJjZS5pbmRleF0uc3VwcGxpZXJcclxuICAgICAgICAgICAgKyBcIiDihpIgXCIgKyBtb2R1bC5fc3VwcGxpZXJbZC50YXJnZXQuaW5kZXhdLnN1cHBsaWVyXHJcbiAgICAgICAgICAgICsgXCI6IFwiICsgbW9kdWwuX2Zvcm1hdFBlcmNlbnQoZC5zb3VyY2UudmFsdWUpXHJcbiAgICAgICAgICAgICsgXCJcXG5cIiArIG1vZHVsLl9zdXBwbGllcltkLnRhcmdldC5pbmRleF0uc3VwcGxpZXJcclxuICAgICAgICAgICAgKyBcIiDihpIgXCIgKyBtb2R1bC5fc3VwcGxpZXJbZC5zb3VyY2UuaW5kZXhdLnN1cHBsaWVyXHJcbiAgICAgICAgICAgICsgXCI6IFwiICttb2R1bC5fZm9ybWF0UGVyY2VudChkLnRhcmdldC52YWx1ZSk7XHJcbiAgICB9KTtcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDI1LjEwLjIwMTYuXHJcbiAqL1xyXG4vL3N0YXJ0IGZpbGUvL1xyXG5cInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBtb2R1bCA9ICAgcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9Nb2R1bCcpO1xyXG4vL3ZhciBTZXR0aW5nRGF0YSA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0RhdGEnKTtcclxuICAgIHZhciBTZXR0aW5nTGF5b3V0ID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9TZXR0aW5nTGF5b3V0Jyk7XHJcbiAgICB2YXIgU2V0dGluZ0Nob3JkcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0Nob3JkcycpO1xyXG4gICAgdmFyIFNldHRpbmdJbnB1dCAgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdJbnB1dCcpO1xyXG4gICAgdmFyIFNldHRpbmdHcm91cHMgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdHcm91cHMnKTtcclxuICAgIHZhciBTZXR0aW5nVGl0bGUgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdUaXRsZScpO1xyXG4gICAgdmFyIENyZWF0aW5nTGlua3MgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL0NyZWF0aW5nTGlua3MnKTtcclxuICAgIHZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvRGF0YU1hbmFnZXInKTtcclxuICAgIHZhciBxO1xyXG5cclxuZ2xvYmFsLnN0YXJ0d2l0aExpbms9ZnVuY3Rpb24oY2hvaWNlLCBjb250ZW50LCBjaG9pY2VfQyl7XHJcbiAgICBjb25zb2xlLmxvZyhcInN2Zy5yZW1vdmUoKVwiKTtcclxuICAgIGQzLnNlbGVjdChcInN2Z1wiKS5yZW1vdmUoKTtcclxuICAgIGNvbnNvbGUubG9nKFwiKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcIlwiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyPTA7XHJcbiAgICBjb25zb2xlLmxvZyhtb2R1bC5fZXJyb3JfY291bnRlcitcIiBzdGFydCB3aXRoIExpbms6XCIrY2hvaWNlK1wiIFwiK2NvbnRlbnQrXCIgXCIrY2hvaWNlX0MpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIGlmIChjb250ZW50ICE9bnVsbClcclxuICAgICAgICBtb2R1bC5fdl9jaG9pY2U9Y29udGVudDtcclxuICAgIHN0YXJ0aW5nd2l0aFF1ZXJ5KG1vZHVsLl92X2Nob2ljZSk7XHJcbn1cclxuXHJcbiAgICAvLyBDcmVhdGVMaW5rXHJcbmdsb2JhbC5zdGFydGNyZWF0aW5nbGluaz1mdW5jdGlvbigpe1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgc3RhcnQgY3JlYXRpbmdsaW5rXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIHJldHVybiBtb2R1bC5fdmh0dHArXCI/Y2hvaWNlPVwiK21vZHVsLl92X2Nob2ljZTtcclxufVxyXG5cclxuLy9zdGFydGluZyB3aXRoIGNob2ljZWQgY3N2LWZpbHNcclxuZ2xvYmFsLnN0YXJ0cHJvY2Vzc2dsb2JhbCA9IGZ1bmN0aW9uKGNob2ljZSxjb250ZW50LCBjb250ZW50X0IsY29udGVudF9DLGNvbnRlbnRfRCkge1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgc3RhcnRwcm9jZXNzZ2xvYmFsXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIG1vZHVsLl9jdXJyZW50Y3N2PVwiXCI7XHJcbiAgICBtb2R1bC5fdl9jaG9pY2U9Y2hvaWNlO1xyXG4gICAgc2V0dGluZ1BhcmFtKDAsIDAsIDcyMCwgNzIwLCA2LCAxNSwgMCwgMCk7XHJcbiAgICBwcm9jZXNzKGNvbnRlbnQsIGNvbnRlbnRfQixjb250ZW50X0MsY29udGVudF9EKTtcclxufVxyXG5cclxuLy9jaGFuZ2luZyB3aWR0aCwgaGVpZ2h0LCBvdXRlciByYWRpdXMgcGVyIGh0bWxcclxuZ2xvYmFsLnN0YXJ0cHJvY2Vzc0Rlc2lnbj1mdW5jdGlvbihjb250ZW50LCBuYW1lLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXNfaSwgcmFkaXVzX28pe1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgc3RhcnRwcm9jZXNzRGVzaWduXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIG1vZHVsLl9jdXJyZW50Y3N2PVwiXCI7XHJcbiAgICBjb25zb2xlLmxvZyhcInByb2Nlc3M6ZGVzaWduXCIrY29udGVudCk7XHJcbiAgICBjb25zb2xlLmxvZyh3aWR0aCArXCIgXCIrIGhlaWdodCArXCIgXCIgK3JhZGl1c19vKTtcclxuICAgIHNldHRpbmdQYXJhbSgwLCAwLCB3aWR0aCwgaGVpZ2h0LCA2LCAxNSwgMCwgcmFkaXVzX28pO1xyXG4gICAgcHJvY2Vzcyhjb250ZW50KTtcclxufTtcclxuZnVuY3Rpb24gaGFzRmlsZShmaWxlbmFtZSwgZmlsZW5hbWVfQiwgZmlsZW5hbWVfQywgZmlsZW5hbWVfRCxmaWxlbmFtZV9FLCBmaWxlbmFtZV9GLCBmaWxlbmFtZV9HLCBmaWxlbmFtZV9IKXtcclxuICAgIGlmIChmaWxlbmFtZV9DIT0wKXsgICAgIC8vbMO2c3VuZyBpbW1lciA0IGZpbGVzIG1pdGdlYmVuKi9cclxuICAgICAgICBtb2R1bC5fY3VycmVudGNzdl9DPVwiY3N2L1wiK2ZpbGVuYW1lX0M7XHJcbiAgICAgICAgbW9kdWwuX2NvdW50RGVwPTI7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsZW5hbWVfRCE9MCl7XHJcbiAgICAgICAgbW9kdWwuX2N1cnJlbnRjc3ZfRD1cImNzdi9cIitmaWxlbmFtZV9EO1xyXG4gICAgICAgIG1vZHVsLl9jb3VudERlcD0zO1xyXG4gICAgfVxyXG4gICAgaWYgKGZpbGVuYW1lX0UhPTApeyAgICAgLy9sw7ZzdW5nIGltbWVyIDQgZmlsZXMgbWl0Z2ViZW4qL1xyXG4gICAgICAgIG1vZHVsLl9jdXJyZW50Y3N2X0U9XCJjc3YvXCIrZmlsZW5hbWVfRTtcclxuICAgICAgICBtb2R1bC5fY291bnREZXA9ODtcclxuICAgIH1cclxuICAgIGlmIChmaWxlbmFtZV9GIT0wKXtcclxuICAgICAgICBtb2R1bC5fY3VycmVudGNzdl9GPVwiY3N2L1wiK2ZpbGVuYW1lX0Y7XHJcbiAgICAgICAgbW9kdWwuX2NvdW50RGVwPTg7XHJcbiAgICB9XHJcbiAgICBpZiAoZmlsZW5hbWVfRyE9MCl7ICAgICAvL2zDtnN1bmcgaW1tZXIgNCBmaWxlcyBtaXRnZWJlbiovXHJcbiAgICAgICAgbW9kdWwuX2N1cnJlbnRjc3ZfRz1cImNzdi9cIitmaWxlbmFtZV9HO1xyXG4gICAgICAgIG1vZHVsLl9jb3VudERlcD04O1xyXG4gICAgfVxyXG4gICAgaWYgKGZpbGVuYW1lX0ghPTApe1xyXG4gICAgICAgIG1vZHVsLl9jdXJyZW50Y3N2X0g9XCJjc3YvXCIrZmlsZW5hbWVfSDtcclxuICAgICAgICBtb2R1bC5fY291bnREZXA9ODtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcHJvY2VzcyhmaWxlbmFtZSwgZmlsZW5hbWVfQiwgZmlsZW5hbWVfQywgZmlsZW5hbWVfRCkge1xyXG4gICAgbW9kdWwuX3N2Zz1kMy5zZWxlY3QoXCJzdmdcIikucmVtb3ZlKCk7XHJcbiAgICBtb2R1bC5fc3ZnID0gZDMuc2VsZWN0KFwic3ZnXCIpO1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgcHJvY2VzczptYWluXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIC8vZGVmYXVsdFxyXG4gICAgbW9kdWwuX2N1cnJlbnRjc3Y9XCJjc3YvXCIrZmlsZW5hbWU7XHJcbiAgICBtb2R1bC5fY3VycmVudGNzdl9CPVwiY3N2L1wiK2ZpbGVuYW1lX0I7XHJcblxyXG4gICAgaGFzRmlsZShmaWxlbmFtZSwgZmlsZW5hbWVfQiwgZmlsZW5hbWVfQywgZmlsZW5hbWVfRCwgMCwgMCwgMCwgMCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIiBwcm9jZXNzIFwiK2ZpbGVuYW1lK1wiIFwiKyBmaWxlbmFtZV9CK1wiIFwiKyBmaWxlbmFtZV9DK1wiIFwiKyBmaWxlbmFtZV9EKTtcclxuICAgIFNldHRpbmdMYXlvdXQuY3JlYXRlQXJjKCk7XHJcbiAgICBTZXR0aW5nTGF5b3V0LmxheW91dCgpO1xyXG4gICAgU2V0dGluZ0xheW91dC5wYXRoKCk7XHJcbiAgICBTZXR0aW5nTGF5b3V0LnNldFNWRygpO1xyXG4gICAgLy9TZXR0aW5nTGF5b3V0Lm1vdmVzdmcoKTtcclxuICAgIFNldHRpbmdMYXlvdXQuYXBwZW5kQ2lyY2xlKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcInByb2Nlc3M6ZGVmZXI6XCIrbW9kdWwuX2N1cnJlbnRjc3YpO1xyXG4gICAgdmFyIHRlc3Q9MDsgLy8wIG5vcm1hbCwgMSBrdW1tdWxhdGlvblxyXG4gICAgY29uc29sZS5sb2coXCJjaG9pY2UgbW9kdXM6XCIrbW9kdWwuX3Ztb2R1cyk7XHJcbiAgICBpZiAobW9kdWwuX3Ztb2R1cz09XCJkZWZhdWx0XCIpey8vZWFjaCB5ZWFyXHJcbiAgICAgICAgcT0gZDMucXVldWUoKVxyXG4gICAgICAgIHFcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjc3YpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0IpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0MpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0QpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0UpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0YpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0cpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0gpXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5qc29uLG1vZHVsLl9jdXJyZW50anNvbilcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjb2xvcilcclxuICAgICAgICAgICAgLmF3YWl0KFNldHRpbmdzQilcclxuICAgIH1cclxuICAgIGVsc2V7IC8vMjAxMSAtIDIwMTQvL2t1bW11bGF0aW9uXHJcbiAgICAgICAgdmFyIGNzdj1cImNzdi9cIjtcclxuICAgICAgICB2YXIgc3VwcGxpZXJBPVtjc3YrXCJCSyAtIDIwMTEuY3N2XCIsY3N2K1wiQksgLSAyMDEyLmNzdlwiLGNzditcIkJLIC0gMjAxMy5jc3ZcIixjc3YrXCJCSyAtIDIwMTQuY3N2XCJdO1xyXG4gICAgICAgIHZhciBzdXBwbGllckI9W2NzditcIkVESSAtIDIwMTEuY3N2XCIsY3N2K1wiRURJIC0gMjAxMi5jc3ZcIixjc3YrXCJFREkgLSAyMDEzLmNzdlwiLGNzditcIkVESSAtIDIwMTQuY3N2XCJdO1xyXG4gICAgICAgIC8vdmFyIHN1cHBsaWVyQz1bY3N2K1wiRURBIC0gMjAxMS5jc3ZcIixjc3YrXCJFREEgLSAyMDEyLmNzdlwiLGNzditcIkVEQSAtIDIwMTMuY3N2XCIsY3N2K1wiRURBIC0gMjAxNC5jc3ZcIl07XHJcbiAgICAgICAgcT0gZDMucXVldWUoKVxyXG4gICAgICAgIHFcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJBWzBdKVxyXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBzdXBwbGllckFbMV0pXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQVsyXSlcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJBWzNdKVxyXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBzdXBwbGllckJbMF0pXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQlsxXSlcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJCWzJdKVxyXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBzdXBwbGllckJbM10pXHJcbiAgICAgICAgICAgIC8qLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJDWzBdKVxyXG4gICAgICAgICAgICAuZGVmZXIoZDMuY3N2LCBzdXBwbGllckNbMV0pXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5jc3YsIHN1cHBsaWVyQ1syXSlcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgc3VwcGxpZXJDWzNdKSovXHJcbiAgICAgICAgICAgIC5kZWZlcihkMy5qc29uLG1vZHVsLl9jdXJyZW50anNvbilcclxuICAgICAgICAgICAgLmRlZmVyKGQzLmNzdiwgbW9kdWwuX2N1cnJlbnRjb2xvcilcclxuICAgICAgICAgICAgLmF3YWl0KHNldHRpbmdzQylcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gU2V0dGluZ3NCKGVycm9yLCBtX3N1cHBsaWVyLCAgbV9zdXBwbGllcl9CLCBtX3N1cHBsaWVyX0MsbV9zdXBwbGllcl9ELFxyXG4gICAgICAgICAgICAgICAgICAgbV9zdXBwbGllcl9FLCAgbV9zdXBwbGllcl9GLCBtX3N1cHBsaWVyX0csbV9zdXBwbGllcl9ILFxyXG4gICAgICAgICAgICAgICAgICAgbWF0cml4LCBjb2xvcilcclxue1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgU2V0dGluZ3NCXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIG1vZHVsLl9zdXBwbGllcj1tX3N1cHBsaWVyOy8vTMOkbmRlcmJvZ2VubmFtZW5uIHNldHplblxyXG4gICAgU2V0dGluZ0lucHV0LnJlYWRjc3YobV9zdXBwbGllciwgbV9zdXBwbGllcl9CLCBtX3N1cHBsaWVyX0MsbV9zdXBwbGllcl9ELFxyXG4gICAgbV9zdXBwbGllcl9FLCAgbV9zdXBwbGllcl9GLCBtX3N1cHBsaWVyX0csbV9zdXBwbGllcl9ILG1hdHJpeCk7Ly9GaWxsIERTLVN1cHBsaWVyICsgRFMtRGVwdCwgTWF0cml4XHJcbiAgICBtb2R1bC5fbGF5b3V0Lm1hdHJpeChtb2R1bC5fbWF0cml4KTtcclxuICAgIG1vZHVsLl9jb2xvcj1jb2xvcjtcclxuICAgIC8vY29uc29sZS5sb2coXCIyOlNldHRpbmdzQjogQW56YWg6X3N1cHBsaWVyOlwiK21vZHVsLl9zdXBwbGllci5sZW5ndGgpO1xyXG4gICAgU2V0dGluZ190aGVNZXRob2RzKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldHRpbmdzQyhlcnJvciwgbV9zdXBwbGllcl8yMDExLCBtX3N1cHBsaWVyXzIwMTIsIG1fc3VwcGxpZXJfMjAxMyxtX3N1cHBsaWVyXzIwMTQsXHJcbiAgICAgICAgICAgICAgICBtX3N1cHBsaWVyX0JfMjAxMSwgbV9zdXBwbGllcl9CXzIwMTIsIG1fc3VwcGxpZXJfQl8yMDEzLCBtX3N1cHBsaWVyX0JfMjAxNCxcclxuICAgICAgICAgICAgICAgIG1hdHJpeCwgY29sb3Ipe1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgU2V0dGluZ3NDXCIpO1xyXG4gICAgbW9kdWwuX2Vycm9yX2NvdW50ZXIrKztcclxuICAgIG1vZHVsLl9zdXBwbGllcj1tX3N1cHBsaWVyXzIwMTE7Ly9Mw6RuZGVyYm9nZW5uYW1lbm4gc2V0emVuXHJcbiAgICAvL01lcmdpbmcgMjAxMSAtIDIwMTRcclxuXHJcbiAgICAvL3Rlc3Qgb25seSAyMDEyLzIwMTNcclxuICAgIFNldHRpbmdJbnB1dC5yZWFkY3N2KG1lcmdpbmdGaWxlcyhbbV9zdXBwbGllcl8yMDExLCBtX3N1cHBsaWVyXzIwMTIsIG1fc3VwcGxpZXJfMjAxMyxtX3N1cHBsaWVyXzIwMTRdKSxcclxuICAgIG1lcmdpbmdGaWxlcyhbbV9zdXBwbGllcl9CXzIwMTEsIG1fc3VwcGxpZXJfQl8yMDEyLCBtX3N1cHBsaWVyX0JfMjAxMywgbV9zdXBwbGllcl9CXzIwMTRdKSxcclxuICAgICAgICBtZXJnaW5nRmlsZXMoW21fc3VwcGxpZXJfQl8yMDExLCBtX3N1cHBsaWVyX0JfMjAxMiwgbV9zdXBwbGllcl9CXzIwMTMsIG1fc3VwcGxpZXJfQl8yMDE0XSlcclxuICAgICxtYXRyaXgpO1xyXG4gICAgbW9kdWwuX2xheW91dC5tYXRyaXgobW9kdWwuX21hdHJpeCk7XHJcbiAgICBtb2R1bC5fY29sb3I9Y29sb3I7XHJcbiAgICAvL2NvbnNvbGUubG9nKFwiMjpTZXR0aW5nc0I6IEFuemFoOl9zdXBwbGllcjpcIittb2R1bC5fc3VwcGxpZXIubGVuZ3RoKTtcclxuICAgIFNldHRpbmdfdGhlTWV0aG9kcygpO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gU2V0dGluZ190aGVNZXRob2RzKClcclxue1xyXG4gICAgU2V0dGluZ0dyb3Vwcy5uZWlnaGJvcmhvb2QoKTtcclxuICAgIFNldHRpbmdHcm91cHMuZ3JvdXBQYXRoKCk7XHJcbiAgICBTZXR0aW5nR3JvdXBzLmdyb3VwVGV4dCgpO1xyXG4gICAgU2V0dGluZ0dyb3Vwcy5ncm91cHRleHRGaWx0ZXIoKTtcclxuICAgIFNldHRpbmdDaG9yZHMuc2VsZWN0Y2hvcmRzKCk7XHJcbiAgICBTZXR0aW5nVGl0bGUuY3JlYXRlVGl0bGUoKTtcclxufVxyXG4vL1NldHRpbmcgUGFyYW1zXHJcbmZ1bmN0aW9uIHNldHRpbmdQYXJhbSh0cmFuc193aWR0aCwgdHJhbnNfaGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgZ3JvdXBfeCwgZ3JvdXBfZHkscmFkaXVzX2ksIHJhZGl1c19vKSB7XHJcbiAgICBtb2R1bC5fdHJhbnNmb3JtX3dpZHRoID0gdHJhbnNfd2lkdGg7XHJcbiAgICBtb2R1bC5fdHJhbnNmb3JtX2hlaWdodCA9IHRyYW5zX2hlaWdodDtcclxuICAgIG1vZHVsLl93aWR0aCA9IHdpZHRoO1xyXG4gICAgbW9kdWwuX2hlaWdodCA9IGhlaWdodDtcclxuICAgIC8vUmFkaXVzXHJcbiAgICBpZiAocmFkaXVzX289PTApe1xyXG4gICAgICAgIG1vZHVsLl9vdXRlclJhZGl1cyA9IE1hdGgubWluKG1vZHVsLl93aWR0aCwgbW9kdWwuX2hlaWdodCkgLyAyIC0gMTA7XHJcbiAgICAgICAgbW9kdWwuX2lubmVyUmFkaXVzID0gbW9kdWwuX291dGVyUmFkaXVzIC0gMjQ7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIG1vZHVsLl9vdXRlclJhZGl1cyA9IE1hdGgubWluKG1vZHVsLl93aWR0aCwgbW9kdWwuX2hlaWdodCkgLyAyIC0gMTA7XHJcbiAgICAgICAgbW9kdWwuX2lubmVyUmFkaXVzID0gcmFkaXVzX28gLSAyNDtcclxuICAgIH1cclxuICAgIC8vcGVyY2VudHJhZ2VcclxuICAgIG1vZHVsLl9mb3JtYXRQZXJjZW50ID0gZDMuZm9ybWF0KFwiLjElXCIpO1xyXG4gICAgLy9zZWV0aW5nIGlucHVcclxuICAgIG1vZHVsLl9ncm91cF94ID0gZ3JvdXBfeDtcclxuICAgIG1vZHVsLl9ncm91cF9keSA9IGdyb3VwX2R5O1xyXG59XHJcbmZ1bmN0aW9uIGdldF9yZXF1ZXN0UGFyYW0oY3N2ZmlsZSwgIGRlcCl7XHJcbiAgICBRdWVyeXN0cmluZ1xyXG59XHJcbmZ1bmN0aW9uIHN0YXJ0aW5nd2l0aFF1ZXJ5KGNvbnRlbnQpe1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX2Vycm9yX2NvdW50ZXIrXCIgc3RhcnRpbmcgd2l0aCBRdWVyeVwiKTtcclxuICAgIG1vZHVsLl9lcnJvcl9jb3VudGVyKys7XHJcbiAgICBpZiAoY29udGVudD09XCJCS19FRElfQWxsXCIpXHJcbiAgICAgICAgbW9kdWwuX3Ztb2R1cz1cIkJLX0VESV9jdW11bGF0aW9uXCI7XHJcbiAgICBlbHNlXHJcbiAgICAgICAgbW9kdWwuX3Ztb2R1cz1cImRlZmF1bHRcIjtcclxuICAgIHN3aXRjaChjb250ZW50KSB7Ly9FREEtRURJIDIwMTEtIDIwMTRcclxuICAgICAgICBjYXNlICdFREFfRURJXzIwMTEnOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTFcIixcIkVEQSAtIDIwMTEuY3N2XCIsXCJFREkgLSAyMDExLmNzdlwiLCAwLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdFREFfRURJXzIwMTInOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTJcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLCAwLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdFREFfRURJXzIwMTMnOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTNcIixcIkVEQSAtIDIwMTMuY3N2XCIsXCJFREkgLSAyMDEzLmNzdlwiLDAsIDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdFREFfRURJXzIwMTQnOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJFREFfRURJXzIwMTRcIixcIkVEQSAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLDAsMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy9CSyBFREkgMjAxMSAtIDIwMTRcclxuICAgICAgICBjYXNlICdCS19FRElfMjAxMSc6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VESV8yMDExXCIsXCJCSyAtIDIwMTEuY3N2XCIsXCJFREEgLSAyMDExLmNzdlwiLDAsMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ0JLX0VESV8yMDEyJzpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURJXzIwMTJcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsMCwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnQktfRURJXzIwMTMnOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FRElfMjAxM1wiLFwiQksgLSAyMDEzLmNzdlwiLFwiRURBIC0gMjAxMy5jc3ZcIiwwLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdCS19FRElfMjAxNCc6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VESV8yMDE0XCIsXCJCSyAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLDAsMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ0JLX0VESV9BbGwnOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FRElfMjAxNFwiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIiwwLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vQksgRURBIEVESSAyMDExIC0gMjAxNFxyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDExXCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMVwiLFwiQksgLSAyMDExLmNzdlwiLFwiRURBIC0gMjAxMS5jc3ZcIixcIkVESSAtIDIwMTEuY3N2XCIsIDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxMlwiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTJcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxM1wiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTNcIixcIkJLIC0gMjAxMy5jc3ZcIixcIkVEQSAtIDIwMTMuY3N2XCIsXCJFREkgLSAyMDEzLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxNFwiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTRcIixcIkJLIC0gMjAxNC5jc3ZcIixcIkVEQSAtIDIwMTQuY3N2XCIsXCJFREkgLSAyMDE0LmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy9CSyBFREEgRURJIDIwMTEgLSAyMDE0IFRyaVxyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDExX1RyaVwiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTFfVHJpXCIsXCJCSyAtIDIwMTEuY3N2XCIsXCJFREEgLSAyMDExLmNzdlwiLFwiRURJIC0gMjAxMS5jc3ZcIiwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTJfVHJpXCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMl9UcmlcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxM19UcmlcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEzX1RyaVwiLFwiQksgLSAyMDEzLmNzdlwiLFwiRURBIC0gMjAxMy5jc3ZcIixcIkVESSAtIDIwMTMuY3N2XCIsMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDE0X1RyaVwiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTRfVHJpXCIsXCJCSyAtIDIwMTQuY3N2XCIsXCJFREEgLSAyMDE0LmNzdlwiLFwiRURJIC0gMjAxNC5jc3ZcIiwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvL0NhdCBCSyBFREEgRURJIDIwMTEgLSAyMDE0XHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTFfQ2F0XCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxMV9DYXRcIixcIkJLIC0gMjAxMS5jc3ZcIixcIkVEQSAtIDIwMTEuY3N2XCIsXCJFREkgLSAyMDExLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxMl9DYXRcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEyX0NhdFwiLFwiQksgLSAyMDEyLmNzdlwiLFwiRURBIC0gMjAxMi5jc3ZcIixcIkVESSAtIDIwMTIuY3N2XCIsMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDEzX0NhdFwiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTNfQ2F0XCIsXCJCSyAtIDIwMTMuY3N2XCIsXCJFREEgLSAyMDEzLmNzdlwiLFwiRURJIC0gMjAxMy5jc3ZcIiwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTRfQ2F0XCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxNF9DYXRcIixcIkJLIC0gMjAxNC5jc3ZcIixcIkVEQSAtIDIwMTQuY3N2XCIsXCJFREkgLSAyMDE0LmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgLy9DYXQgQksgRURBIEVESSAyMDExIC0gMjAxNCAyXHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTFfQ2F0XzJcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDExX0NhdF8yXCIsXCJCSyAtIDIwMTEuY3N2XCIsXCJFREEgLSAyMDExLmNzdlwiLFwiRURJIC0gMjAxMS5jc3ZcIiwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTJfQ2F0XzJcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEyX0NhdF8yXCIsXCJCSyAtIDIwMTIuY3N2XCIsXCJFREEgLSAyMDEyLmNzdlwiLFwiRURJIC0gMjAxMi5jc3ZcIiwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJXzIwMTNfQ2F0XzJcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV8yMDEzX0NhdF8yXCIsXCJCSyAtIDIwMTMuY3N2XCIsXCJFREEgLSAyMDEzLmNzdlwiLFwiRURJIC0gMjAxMy5jc3ZcIiwwKTtcclxuICAgICAgICAgICAgYnJlYWs7O1xyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV8yMDE0X0NhdF8yXCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfMjAxNF9DYXRfMlwiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIixcIkVESSAtIDIwMTQuY3N2XCIsMCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAvL0NhdCBCSyBFREEgRURJIDIwMTEgLSAyMDE0IDNcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxMV9DYXRfM1wiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTFfQ2F0XzNcIixcIkJLIC0gMjAxMS5jc3ZcIixcIkVEQSAtIDIwMTEuY3N2XCIsXCJFREkgLSAyMDExLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxMl9DYXRfM1wiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTJfQ2F0XzNcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxM19DYXRfM1wiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTNfQ2F0XzNcIixcIkJLIC0gMjAxMy5jc3ZcIixcIkVEQSAtIDIwMTMuY3N2XCIsXCJFREkgLSAyMDEzLmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfMjAxNF9DYXRfM1wiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJXzIwMTRfQ2F0XzNcIixcIkJLIC0gMjAxNC5jc3ZcIixcIkVEQSAtIDIwMTQuY3N2XCIsXCJFREkgLSAyMDE0LmNzdlwiLDApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vZHVtbXlcclxuICAgICAgICBjYXNlICBcIkR1bW15XCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkR1bW15XCIsXCJEdW1teV9FREEuY3N2XCIsXCJEdW1teV9FREkuY3N2XCIsMCwwKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIC8vQ2F0IEJLIEVEQSBFREkgRUpQRCAyMDExIC0gMjAxNFxyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV9FSlBEXzIwMTFfQ2F0XCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfRUpQRF8yMDExX0NhdFwiLFwiQksgLSAyMDExLmNzdlwiLFwiRURBIC0gMjAxMS5jc3ZcIixcIkVESSAtIDIwMTEuY3N2XCIsIFwiRUpQRCAtIDIwMTEuY3N2XCIpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfRUpQRF8yMDEyX0NhdFwiOlxyXG4gICAgICAgICAgICBzdGFydHByb2Nlc3NnbG9iYWwoXCJCS19FREFfRURJX0VKUERfMjAxMl9DYXRcIixcIkJLIC0gMjAxMi5jc3ZcIixcIkVEQSAtIDIwMTIuY3N2XCIsXCJFREkgLSAyMDEyLmNzdlwiLCBcIkVKUEQgLSAyMDEyLmNzdlwiKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAgXCJCS19FREFfRURJX0VKUERfMjAxM19DYXRcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsKFwiQktfRURBX0VESV9FSlBEXzIwMTNfQ2F0XCIsXCJCSyAtIDIwMTMuY3N2XCIsXCJFREEgLSAyMDEzLmNzdlwiLFwiRURJIC0gMjAxMy5jc3ZcIiwgXCJFSlBEIC0gMjAxMy5jc3ZcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgIFwiQktfRURBX0VESV9FSlBEXzIwMTRfQ2F0XCI6XHJcbiAgICAgICAgICAgIHN0YXJ0cHJvY2Vzc2dsb2JhbChcIkJLX0VEQV9FRElfRUpQRF8yMDE0X0NhdFwiLFwiQksgLSAyMDE0LmNzdlwiLFwiRURBIC0gMjAxNC5jc3ZcIixcIkVESSAtIDIwMTQuY3N2XCIsIFwiRUpQRCAtIDIwMTQuY3N2XCIpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG5cclxuICAgICAgICAvL0JLIEVEQSBFREkgRUZEIEVKUEQgVVZFSyBWQlMgV0JGIDIwMTFcclxuICAgICAgICBjYXNlICBcIkJLX0VEQV9FRElfRUZEX0VKUERfVVZFS19WQlNfV0JGXzIwMTFcIjpcclxuICAgICAgICAgICAgc3RhcnRwcm9jZXNzZ2xvYmFsXHJcbiAgICAgICAgICAgIChcIkJLX0VEQV9FRElfRUZEX0VKUERfVVZFS19WQlNfV0JGXzIwMTFcIixcIkJLIC0gMjAxMS5jc3ZcIiwgICBcIkVEQSAtIDIwMTEuY3N2XCIsXCJFREkgLSAyMDExLmNzdlwiLCBcIkVGRCAtIDIwMTEuY3N2XCIsXHJcbiAgICAgICAgICAgICBcIkVKUEQgLSAyMDExLmNzdlwiLCBcIlVWRUsgLSAyMDExLmNzdlwiLCBcIlZCUyAtIDIwMTEuY3N2XCIsXCJXQkYgLSAyMDExLmNzdlwiXHJcblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBtZXJnaW5nRmlsZXMoY3N2RmlsZXMpIHtcclxuICAgIGNvbnNvbGUubG9nKG1vZHVsLl9lcnJvcl9jb3VudGVyK1wiIG1lcmdpbmcgZmlsZXNcIik7XHJcbiAgICBtb2R1bC5fZXJyb3JfY291bnRlcisrO1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIHZhciBvdXRwdXQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNzdkZpbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKGNzdkZpbGVzW2ldKTtcclxuICAgIH1cclxuICAgIG91dHB1dCA9IGQzLm1lcmdlKHJlc3VsdHMpO1xyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufVxyXG5cclxuIl19
