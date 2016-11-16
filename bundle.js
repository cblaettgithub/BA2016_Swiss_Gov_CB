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
    var _currentcsv_C="CSV/EDA-2011.csv";
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
    var _choice;
    /*creatinglinks*/

    module.exports ={
        _currentcsv:_currentcsv,
        _currentcsv_B:_currentcsv_B,
        _currentcsv_C:_currentcsv_C,
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
        _ds_supplier_BK:_ds_supplier_BK,
        _v_choice:_ds_supplier_BK
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
    readcsv:readcsv
}

function readcsv(data, data_B,data_C, matrix)  {
    console.log("readcsv");
    var supplier;
    var csvall;
    var filtercontent;
    console.log(modul._v_choice);
    compareCSV(data, data_B,data_C);
    switch (modul._v_choice){
        case "#EDA_EDI_2011"://EDA 2011, EDI 2011
        case "#EDA_EDI_2012"://EDA 2012, EDI 2011
        case "#EDA_EDI_2013"://EDA 2013, EDI 2011
        case "#EDA_EDI_2014"://EDA 2014, EDI 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"]
            data =filter(data,filtercontent);
            data_B =filter(data_B,filtercontent);
            modul._ds_supplier_EDA= getDummy_EDA(data, "supplier");
            modul._ds_supplier_EDI= getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA,modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
            break;
        case "#BK_EDI_2011"://BK EDA 2011,
        case "#BK_EDI_2012"://BK EDA 2012,
        case "#BK_EDI_2013"://BK EDA 2013,
        case "#BK_EDI_2014"://BK EDA 2014,
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"]
            data =filter(data,filtercontent);
            data_B =filter(data_B,filtercontent);
            modul._ds_supplier_EDI= getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumEDA","sumBundeskanzelt"]);
            break;
        case "#BK_EDA_EDI_2011"://EDA 2014, EDI 2011, BK 2011
        case "#BK_EDA_EDI_2012"://EDA 2014, EDI 2011, BK 2011
        case "#BK_EDA_EDI_2013"://EDA 2014, EDI 2011, BK 2011
        case "#BK_EDA_EDI_2014"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent);
            data_B =filter(data_B,filtercontent);
            data_C =filter(data_C,filtercontent);
            console.log("filter created");
            modul._ds_supplier_BK= getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            modul._supplier= modul._ds_supplier_EDA;
            break;
        case "csv/Dummy_EDA.csv":
            var dummyEDA=getDummy_EDA(data, "supplier");
            var dummyEDI=getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([dummyEDA, dummyEDI]);
            //modul._ds_supplier = matrix_dummay_All(csvall);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI");
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
function filter(data, param){
    console.log("filter");
    if (param.length==2){
        return data.filter(function(row) {
            if (row["supplier"] == param[0]
                ||  row["supplier"] == param[1]
               )
            {  return row;  }
        });
    }
    else{
        return data.filter(function(row) {
            if (row["supplier"] == param[0]
                ||  row["supplier"] == param[1]
                ||  row["supplier"] == param[2])
            {  return row;    }
        });
    }
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
function getDummy_BK(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d.supplier})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumBundeskanzelt: d3.sum(v, function(d){return d["Bundeskanzlei"]})
        };})
        .entries(csv);
    return nested_data;
}
function compareCSV(dataA, dataB, dataC){

    var mrow=[];
    for (var i=0;i<dataA.length;i++){
        for (var j=0;j<dataB.length;j++){
            if (dataA[i].supplier==dataB[j].supplier){
                for (var k=0;k<dataC.length;k++)
                    if (dataA[i].supplier==dataC[k].supplier)
                        mrow.push(dataA[i].supplier);
            }
        }
    }
    var expensesByName = d3.nest()
        .key(function(d) { return d.supplier; })
        .entries(mrow);

}

function matrix_EDI_EDA(DataEDI_EDA, Name_sumEDA, Name_sumEDI, Names_sumsEDA_EDI_BK){
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

    console.log("matrix_DummyALL");
    return supplier;
}

function createSupplierList(dataRows, supplier_field){
    console.log()
    var v_Supplier=supplier_field.length;
    var i=0;
    var end=v_Supplier*2;
    console.log("createSupplierList:"+end);

    //first dept
    if (end==4){
        while( i<end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
    }
    else if (end==6){
        while( i<=end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
    }

    //second supplier
    for (var i=0;i<v_Supplier; i++)
        modul._supplier.push(dataRows[i])
    console.log("createSupplierList");
}

function getMatrixValue(row,nameValue, counter){
    var depName;    //get Fieldname summ of each Department
    if (nameValue.length==2) {
        switch (counter) {//3 Supplier
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
            switch(counter){//3 Supplier
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
                case 6:
                case 7:
                case 8:
                case 9:
                    depName=nameValue[2];
                    break;
                case 10:
                case 11:
                case 12:
                case 13:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
       return d3.round(row.values[0].values[depName]);
}

function getSupplier_EDI(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
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
function getSupplier_BK(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
        .rollup(function(v) { return{
            sumBundeskanzelt: d3.sum(v, function(d) { return d["Bundeskanzlei"]; })
        };})
        .entries(csv);
    console.log("getSupplier_BK");
    return nested_data;
}
function mergingFiles(csvFiles) {
    console.log("merging files");
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    return output;
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
global.startprocessglobal = function(content, content_B,content_C, choice) {
    console.log("startprocessglobal");
    modul._currentcsv="";
    modul._v_choice=choice;
    //d3.select("#result").property("value", csv);
    //var res = document.forms[0]["result"].value;
    console.log("process:start"+content, content_B,content_C);
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);
    process(content, content_B,content_C);
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

function process(filename, filename_B, filename_C) {
    modul._svg=d3.select("svg").remove();
    modul._svg = d3.select("svg");
    console.log("process:main");
    //default
    modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;
    if (filename_C!=0)
        modul._currentcsv_C="csv/"+filename_C;
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
        .defer(d3.csv, modul._currentcsv_B)
        .defer(d3.csv, modul._currentcsv_C)
        .defer(d3.json,modul._currentjson)
        .defer(d3.csv, modul._currentcolor)
        .defer(d3.csv, "csv/"+"Dummy_EDA_EDI_All.csv")
        .await(SettingsB)
}
function SettingsB(error, m_supplier,  m_supplier_B, m_supplier_C,matrix, color,m_dummy)
{
    console.log("SettingsB");
    modul._supplier=m_supplier;//Länderbogennamenn setzen
    SettingInput.readcsv(m_supplier, m_supplier_B, m_supplier_C,matrix);//Fill DS-Supplier + DS-Dept, Matrix
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIkphdmFzY3JpcHRzL0NyZWF0aW5nTGlua3MuanMiLCJKYXZhc2NyaXB0cy9Nb2R1bC5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdDaG9yZHMuanMiLCJKYXZhc2NyaXB0cy9TZXR0aW5nR3JvdXBzLmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0lucHV0LmpzIiwiSmF2YXNjcmlwdHMvU2V0dGluZ0xheW91dC5qcyIsIkphdmFzY3JpcHRzL1NldHRpbmdUaXRsZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjQuMTAuMjAxNi5cclxuICovXHJcbm1vZHVsID0gICByZXF1aXJlKCcuL01vZHVsJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHNldEN1cnJlbnRVcmw6IHNldEN1cnJlbnRVcmwsXHJcbiAgICBzZXRQYXJhbTogICAgICBzZXRQYXJhbSxcclxuICAgIF9jdXJyZW50VVJMOiAgIF9jdXJyZW50VVJMLFxyXG4gICAgX3F1ZXJ5T3V0cHV0OiAgX3F1ZXJ5T3V0cHV0XHJcbn1cclxuXHJcbnZhciBfeWVhcjtcclxudmFyIF9kZXB0O1xyXG52YXIgX3N1cHBsaWVyO1xyXG52YXIgX3RvdGFsX0VESTtcclxudmFyIF90b3RhbF9FREE7XHJcbnZhciBfd2lkdGg7XHJcbnZhciBfaGVpZ2h0O1xyXG52YXIgX2N1cnJlbnRVUkw9XCJTdXBwbGllcl8yMDE2X2Nob3JkLmh0bWxcIjtcclxudmFyIF9BcnJheVBhcmFtcztcclxudmFyIF9xdWVyeU91dHB1dD1cIlwiO1xyXG5cclxudmFyIHBhcmFtcyA9XHJcbnsgICB5ZWFyOiAgICAgIFwiZGF0YS5jc3ZcIixkZXB0OiBcImRhdGEuY3N2XCIsICAgICBzdXBwbGllcjogXCJkYXRhLmNzdlwiLFxyXG4gICAgdG90YWxfRURJOiBcImRhdGEuY3N2XCIsdG90YWxfRURBOiBcImRhdGEuY3N2XCIsd2lkdGg6IFwiZGF0YS5jc3ZcIixcclxuICAgIGhlaWdodDogICAgXCJkYXRhLmNzdlwiLGN1cnJlbnRVUkw6IFwiZGF0YS5jc3ZcIlxyXG59O1xyXG5cclxuZnVuY3Rpb24gc2V0Q3VycmVudFVybChzdGFydFVybCl7XHJcbiAgICBfY3VycmVudFVSTD1zdGFydFVybFxyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRQYXJhbSh5ZWFyLCBkZXB0LCBzdXBwbGllciwgdG90YWxfRURJLCB0b3RhbF9FREEsIHdpZHRoLCBoZWlnaHQpXHJcbntcclxuICAgIF95ZWFyPXllYXI7XHJcbiAgICBfZGVwdD1kZXB0O1xyXG4gICAgX3N1cHBsaWVyPXN1cHBsaWVyO1xyXG4gICAgX3RvdGFsX0VEST10b3RhbF9FREk7XHJcbiAgICBfdG90YWxfRURBPXRvdGFsX0VEQTtcclxuICAgIF93aWR0aD13aWR0aDtcclxuICAgIF9oZWlnaHQ9aGVpZ2h0O1xyXG5cclxuICAgIHBhcmFtc1swXT1feWVhcjtcclxuICAgIHBhcmFtc1sxXT1fZGVwdDtcclxuICAgIHBhcmFtc1syXT1fc3VwcGxpZXI7XHJcbiAgICBwYXJhbXNbM109X3RvdGFsX0VESTtcclxuICAgIHBhcmFtc1s0XT1fdG90YWxfRURBO1xyXG4gICAgcGFyYW1zWzVdPV93aWR0aDtcclxuICAgIHBhcmFtc1s2XT1faGVpZ2h0O1xyXG59XHJcbi8qZnVuY3Rpb24gY3JlYXRlTGluaygpe1xyXG5cclxuICAgIHZhciBzdGFydGFwcGVuZD1cIj9cIjtcclxuICAgIHZhciBzZXBlcmF0b3I9XCI9XCI7XHJcbiAgICB2YXIgYXBwZW5kZXI9XCImXCI7XHJcbiAgICB2YXIgaT0wO1xyXG5cclxuICAgIF9xdWVyeU91dHB1dD1fY3VycmVudFVSTDtcclxuICAgIF9xdWVyeU91dHB1dD1fY3VycmVudFVSTCtzdGFydGFwcGVuZDtcclxuXHJcbiAgICBwYXJhbXMuZm9yRWFjaChmdW5jdGlvbih2KXtcclxuICAgICAgICBfcXVlcnlPdXRwdXQ9X3F1ZXJ5T3V0cHV0K3BhcmFtc1tpXS5uYW1lICtzZXBlcmF0b3IrcGFyYW1zW2ldO1xyXG4gICAgICAgIGk9aSsxO1xyXG4gICAgfSk7XHJcbn0qL1xyXG4iLCIgICAgLyoqXHJcbiAgICAgKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDI0LjEwLjIwMTYuXHJcbiAgICAgKi9cclxuICAgIHZhciBfY3VycmVudGNzdj1cIkNTVi9FREEtMjAxMS5jc3ZcIjtcclxuICAgIHZhciBfY3VycmVudGNzdl9CPVwiQ1NWL0VEQS0yMDExLmNzdlwiO1xyXG4gICAgdmFyIF9jdXJyZW50Y3N2X0M9XCJDU1YvRURBLTIwMTEuY3N2XCI7XHJcbiAgICB2YXIgX2N1cnJlbnRqc29uPVwiQ1NWL21hdHJpeC5qc29uXCI7XHJcbiAgICB2YXIgX2N1cnJlbnRjb2xvcj1cIkNTVi9Db2xvci5jc3ZcIjtcclxuICAgIHZhciBfc3ZnOy8vID0gZDMuc2VsZWN0KFwic3ZnXCIpO1xyXG4gICAgdmFyIF93aWR0aDtcclxuICAgIHZhciBfaGVpZ2h0O1xyXG4gICAgdmFyIF9vdXRlclJhZGl1cztcclxuICAgIHZhciBfaW5uZXJSYWRpdXM7XHJcbiAgICB2YXIgX2xheW91dDtcclxuICAgIHZhciBfcGF0aDtcclxuICAgIHZhciBfYXJjO1xyXG4gICAgdmFyIF9ncm91cFBhdGg7XHJcbiAgICB2YXIgX2dyb3VwO1xyXG4gICAgdmFyIF9ncm91cFRleHQ7XHJcbiAgICB2YXIgX2Nob3JkO1xyXG4gICAgdmFyIF9mb3JtYXRQZXJjZW50O1xyXG4gICAgdmFyIF90cmFuc2Zvcm1fd2lkdGg7XHJcbiAgICB2YXIgX3RyYW5zZm9ybV9oZWlnaHQ7XHJcbiAgICB2YXIgX2dyb3VwX3g7XHJcbiAgICB2YXIgX2dyb3VwX2R5O1xyXG4gICAgdmFyIF9tYXRyaXg7XHJcbiAgICB2YXIgX3N1cHBsaWVyO1xyXG4gICAgdmFyIF9jb2xvcjtcclxuICAgIHZhciBfZGVwdDtcclxuICAgIHZhciBfZHNfc3VwcGxpZXI7XHJcbiAgICB2YXIgX2RzX2RlcHQ7XHJcbiAgICB2YXIgX2RzX2Nvc3Q7XHJcbiAgICB2YXIgX2RzX3N1cHBsaWVyX0VESTtcclxuICAgIHZhciBfZHNfc3VwcGxpZXJfRURBO1xyXG4gICAgdmFyIF9kc19zdXBwbGllcl9CSztcclxuICAgIHZhciBfY2hvaWNlO1xyXG4gICAgLypjcmVhdGluZ2xpbmtzKi9cclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9e1xyXG4gICAgICAgIF9jdXJyZW50Y3N2Ol9jdXJyZW50Y3N2LFxyXG4gICAgICAgIF9jdXJyZW50Y3N2X0I6X2N1cnJlbnRjc3ZfQixcclxuICAgICAgICBfY3VycmVudGNzdl9DOl9jdXJyZW50Y3N2X0MsXHJcbiAgICAgICAgX2N1cnJlbnRqc29uOl9jdXJyZW50anNvbixcclxuICAgICAgICBfY3VycmVudGNvbG9yOl9jdXJyZW50Y29sb3IsXHJcbiAgICAgICAgX3N2Zzpfc3ZnLFxyXG4gICAgICAgIF93aWR0aDpfd2lkdGgsXHJcbiAgICAgICAgX3dpZHRoOl93aWR0aCxcclxuICAgICAgICBfaGVpZ2h0Ol9oZWlnaHQsXHJcbiAgICAgICAgX291dGVyUmFkaXVzOl9vdXRlclJhZGl1cyxcclxuICAgICAgICBfaW5uZXJSYWRpdXM6X2lubmVyUmFkaXVzLFxyXG4gICAgICAgIF9sYXlvdXQ6X2xheW91dCxcclxuICAgICAgICBfcGF0aDpfcGF0aCxcclxuICAgICAgICBfYXJjOl9hcmMsXHJcbiAgICAgICAgX2dyb3VwUGF0aDpfZ3JvdXBQYXRoLFxyXG4gICAgICAgIF9ncm91cDpfZ3JvdXAsXHJcbiAgICAgICAgX2dyb3VwVGV4dDpfZ3JvdXBUZXh0LFxyXG4gICAgICAgIF9jaG9yZDpfY2hvcmQsXHJcbiAgICAgICAgX2Zvcm1hdFBlcmNlbnQ6X2Zvcm1hdFBlcmNlbnQsXHJcbiAgICAgICAgX3RyYW5zZm9ybV93aWR0aDpfdHJhbnNmb3JtX3dpZHRoLFxyXG4gICAgICAgIF90cmFuc2Zvcm1faGVpZ2h0Ol90cmFuc2Zvcm1faGVpZ2h0LFxyXG4gICAgICAgIF9ncm91cF94Ol9ncm91cF94LFxyXG4gICAgICAgIF9ncm91cF9keTpfZ3JvdXBfZHksXHJcbiAgICAgICAgX21hdHJpeDpfbWF0cml4LFxyXG4gICAgICAgIF9zdXBwbGllcjpfc3VwcGxpZXIsXHJcbiAgICAgICAgX2NvbG9yOl9jb2xvcixcclxuICAgICAgICBfZGVwdDpfZGVwdCxcclxuICAgICAgICBfZHNfc3VwcGxpZXI6X2RzX3N1cHBsaWVyLFxyXG4gICAgICAgIF9kc19kZXB0Ol9kc19kZXB0LFxyXG4gICAgICAgIF9kc19jb3N0Ol9kc19jb3N0LFxyXG4gICAgICAgIF9kc19zdXBwbGllcl9FREk6X2RzX3N1cHBsaWVyX0VESSxcclxuICAgICAgICBfZHNfc3VwcGxpZXJfRURBOl9kc19zdXBwbGllcl9FREEsXHJcbiAgICAgICAgX2RzX3N1cHBsaWVyX0JLOl9kc19zdXBwbGllcl9CSyxcclxuICAgICAgICBfdl9jaG9pY2U6X2RzX3N1cHBsaWVyX0JLXHJcbiAgICB9IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjEuMTAuMjAxNi5cclxuICovXHJcbi8vN1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxuLyp2YXIgU2V0dGluZ0RhdGEgPSByZXF1aXJlKCcuL1NldHRpbmdEYXRhcy5qcycpO1xyXG5fbWFpbmRhdGEgPSBuZXcgU2V0dGluZ0RhdGEoKTsqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBzZWxlY3RjaG9yZHM6c2VsZWN0Y2hvcmRzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbGVjdGNob3JkcygpIHtcclxuICAgIG1vZHVsLl9jaG9yZCA9IG1vZHVsLl9zdmcuc2VsZWN0QWxsKFwiLmNob3JkXCIpXHJcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNob3JkXCIpXHJcbiAgICAgICAgLmRhdGEobW9kdWwuX2xheW91dC5jaG9yZHMpXHJcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwicGF0aFwiKVxyXG4gICAgICAgIC5hdHRyKFwiZFwiLCAgbW9kdWwuX3BhdGgsIGZ1bmN0aW9uKGQpe3JldHVybiBkLnN1cHBsaWVyfSlcclxuICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIG1vZHVsLl9zdXBwbGllcltkLnNvdXJjZS5pbmRleF0uY29sb3I7XHJcbiAgICAgICAgICAgIHJldHVybiBtb2R1bC5fY29sb3JbZC5zb3VyY2UuaW5kZXhdLmNvbG9yO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IGNocmlzIG9uIDIxLjEwLjIwMTYuXHJcbiAqL1xyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxuLyp2YXIgU2V0dGluZ0RhdGEgPSByZXF1aXJlKCcuL1NldHRpbmdEYXRhcy5qcycpO1xyXG52YXIgX21haW5kYXRhID0gbmV3IFNldHRpbmdEYXRhKCk7Ki9cclxuXHJcbm1vZHVsZS5leHBvcnRzID17XHJcbiAgICBuZWlnaGJvcmhvb2Q6bmVpZ2hib3Job29kLFxyXG4gICAgZ3JvdXBQYXRoOmdyb3VwUGF0aCxcclxuICAgIGdyb3VwVGV4dDpncm91cFRleHQsXHJcbiAgICBncm91cHRleHRGaWx0ZXI6Z3JvdXB0ZXh0RmlsdGVyLFxyXG4gICAgbW91c2VvdmVyOm1vdXNlb3ZlclxyXG5cclxufVxyXG5mdW5jdGlvbiBuZWlnaGJvcmhvb2QoKSB7Ly9Mw6RuZGVyYm9nZW5cclxuICAgIGNvbnNvbGUubG9nKFwibmVpZ2hib3JcIik7XHJcbiAgICBtb2R1bC5fZ3JvdXAgPSBtb2R1bC5fc3ZnLnNlbGVjdEFsbChcImcuZ3JvdXBcIilcclxuICAgICAgICAuZGF0YShtb2R1bC5fbGF5b3V0Lmdyb3VwcylcclxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJzdmc6Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJncm91cFwiKVxyXG4gICAgICAgIC5vbihcIm1vdXNlb3ZlclwiLCBtb3VzZW92ZXIpICAgICAvL2RhcsO8YmVyIGZhaHJlblxyXG4gICAgICAgIC5vbihcIm1vdXNlb3V0XCIsIG1vdXNlb3V0KSA7ICAgIC8vZGFyw7xiZXIgZmFocmVuXHJcblxyXG59XHJcbmZ1bmN0aW9uIGdyb3VwUGF0aCgpIHsvL2luIGzDpG5kZXJib2dlbiBlaW5zZXR6ZW5cclxuICAgIG1vZHVsLl9ncm91cFBhdGggPSAgbW9kdWwuX2dyb3VwLmFwcGVuZChcInBhdGhcIilcclxuICAgICAgICAuYXR0cihcImlkXCIsIGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcImdyb3VwXCIgKyBpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmF0dHIoXCJkXCIsIG1vZHVsLl9hcmMpXHJcbiAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBmdW5jdGlvbiAoZCwgaSkgey8vRmFyYmUgdW0gQm9nZW5cclxuICAgICAgICAgICAgcmV0dXJuIG1vZHVsLl9jb2xvcltpXS5jb2xvcjtcclxuICAgICAgICB9KTtcclxufVxyXG5mdW5jdGlvbiBncm91cFRleHQoKSB7Ly9kZW4gbMOkbmRlcmJvZ2VuIGJlc2NocmlmdGVuXHJcbiAgICBtb2R1bC5fZ3JvdXBUZXh0ID0gbW9kdWwuX2dyb3VwLmFwcGVuZChcInN2Zzp0ZXh0XCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4XCIsIG1vZHVsLl9ncm91cF94KS8vNlxyXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJzdXBwbGllclwiKVxyXG4gICAgICAgIC5hdHRyKFwiZHlcIiwgbW9kdWwuX2dyb3VwX2R5KTsvL2JybzE1XHJcblxyXG4gICAgLyppZiAobW9kdWwuX2N1cnJlbnRjc3YgPSBcImNzdi9cIiArIFwiRHVtbXlfRURBLmNzdlwiKSB7Ki9cclxuICAgICAgICBtb2R1bC5fZ3JvdXBUZXh0LmFwcGVuZChcInN2Zzp0ZXh0UGF0aFwiKVxyXG4gICAgICAgICAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIiNncm91cFwiICsgZC5pbmRleDtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1vZHVsLl9zdXBwbGllcltpXS5rZXkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vZHVsLl9zdXBwbGllcltpXS5rZXk7XHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAvL3JldHVybiBtb2R1bC5fZHNfc3VwcGxpZXJbaV0ua2V5Oy8vU3BhbHRlbsO8YmVyc2NocmlmdGVuXHJcbiAgICAgICAgIC8vIG1vZHVsLl9kc19zdXBwbGllcltpXS52YWx1ZXNbMF0ua2V5ID1cIkVEQVwiXHJcbiAgICAgICAgICAgIC8vIG1vZHVsLl9kc19zdXBwbGllcltpXS52YWx1ZXNbMF0udmFsdWVzID0gMjAwMDAoc3VtbWUpXHJcblxyXG4gICAgZnVuY3Rpb24gZ3JvdXBUaWNrcyhkKSB7XHJcbiAgICAgICAgdmFyIGsgPSAoZC5lbmRBbmdsZSAtIGQuc3RhcnRBbmdsZSkgLyBkLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiBkMy5yYW5nZSgwLCBkLnZhbHVlLCAxMDAwMDAwKS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGFuZ2xlOiB2ICogayArIGQuc3RhcnRBbmdsZSxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBpICUgNSAhPSAwID8gbnVsbCA6IHYgLyAxMDAwMDAwICsgXCIgRnIuXCJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHZhciBnID0gbW9kdWwuX3N2Zy5zZWxlY3RBbGwoXCJnLmdyb3VwXCIpXHJcbiAgICB2YXIgdGlja3MgPWcuc2VsZWN0QWxsKFwiZ1wiKVxyXG4gICAgICAgIC5kYXRhKGdyb3VwVGlja3MpXHJcbiAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwiZ1wiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcInJvdGF0ZShcIiArIChkLmFuZ2xlICogMTgwIC8gTWF0aC5QSSAtIDkwKSArIFwiKVwiXHJcbiAgICAgICAgICAgICAgICArIFwidHJhbnNsYXRlKFwiICsgbW9kdWwuX291dGVyUmFkaXVzICsgXCIsMClcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB0aWNrcy5hcHBlbmQoXCJsaW5lXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ4MVwiLCAxKVxyXG4gICAgICAgIC5hdHRyKFwieTFcIiwgMClcclxuICAgICAgICAuYXR0cihcIngyXCIsIDUpXHJcbiAgICAgICAgLmF0dHIoXCJ5MlwiLCAwKVxyXG4gICAgICAgIC5zdHlsZShcInN0cm9rZVwiLCBcIiMwMDBcIik7XHJcblxyXG4gICAgdGlja3MuYXBwZW5kKFwidGV4dFwiKVxyXG4gICAgICAgIC5hdHRyKFwieFwiLCA4KVxyXG4gICAgICAgIC5hdHRyKFwiZHlcIiwgXCIuMzVlbVwiKVxyXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQuYW5nbGUgPiBNYXRoLlBJID9cclxuICAgICAgICAgICAgICAgIFwicm90YXRlKDE4MCl0cmFuc2xhdGUoLTE2KVwiIDogbnVsbDtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGQuYW5nbGUgPiBNYXRoLlBJID8gXCJlbmRcIiA6IG51bGw7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBkLmxhYmVsOyB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ3JvdXB0ZXh0RmlsdGVyKCkge1xyXG4gICAgbW9kdWwuX2dyb3VwVGV4dC5maWx0ZXIoZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1vZHVsLl9ncm91cFBhdGhbMF1baV0uZ2V0VG90YWxMZW5ndGgoKSAvIDIgLSAxNiA8IHRoaXMuZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAucmVtb3ZlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1vdXNlb3ZlcihkLCBpKSB7XHJcbiAgICBtb2R1bC5fY2hvcmQuY2xhc3NlZChcImZhZGVcIiwgZnVuY3Rpb24ocCkge1xyXG4gICAgICAgIHJldHVybiBwLnNvdXJjZS5pbmRleCAhPSBpXHJcbiAgICAgICAgICAgICYmIHAudGFyZ2V0LmluZGV4ICE9IGk7XHJcbiAgICB9KVxyXG4gICAgLnRyYW5zaXRpb24oKVxyXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwLjEpO1xyXG59XHJcbmZ1bmN0aW9uIG1vdXNlb3V0KGQsIGkpIHtcclxuICAgIG1vZHVsLl9jaG9yZC5jbGFzc2VkKFwiZmFkZVwiLCBmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwLnNvdXJjZS5pbmRleCAhPSBpXHJcbiAgICAgICAgICAgICAgICAmJiBwLnRhcmdldC5pbmRleCAhPSBpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRyYW5zaXRpb24oKVxyXG4gICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSk7XHJcbn1cclxuXHJcblxyXG5cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjEuMTAuMjAxNi5cclxuICovXHJcblxyXG5tb2R1bCA9ICAgcmVxdWlyZSgnLi9Nb2R1bCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgcmVhZGNzdjpyZWFkY3N2XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlYWRjc3YoZGF0YSwgZGF0YV9CLGRhdGFfQywgbWF0cml4KSAge1xyXG4gICAgY29uc29sZS5sb2coXCJyZWFkY3N2XCIpO1xyXG4gICAgdmFyIHN1cHBsaWVyO1xyXG4gICAgdmFyIGNzdmFsbDtcclxuICAgIHZhciBmaWx0ZXJjb250ZW50O1xyXG4gICAgY29uc29sZS5sb2cobW9kdWwuX3ZfY2hvaWNlKTtcclxuICAgIGNvbXBhcmVDU1YoZGF0YSwgZGF0YV9CLGRhdGFfQyk7XHJcbiAgICBzd2l0Y2ggKG1vZHVsLl92X2Nob2ljZSl7XHJcbiAgICAgICAgY2FzZSBcIiNFREFfRURJXzIwMTFcIjovL0VEQSAyMDExLCBFREkgMjAxMVxyXG4gICAgICAgIGNhc2UgXCIjRURBX0VESV8yMDEyXCI6Ly9FREEgMjAxMiwgRURJIDIwMTFcclxuICAgICAgICBjYXNlIFwiI0VEQV9FRElfMjAxM1wiOi8vRURBIDIwMTMsIEVESSAyMDExXHJcbiAgICAgICAgY2FzZSBcIiNFREFfRURJXzIwMTRcIjovL0VEQSAyMDE0LCBFREkgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIkFpclBsdXMgSW50ZXJuYXRpb25hbCBBR1wiLFwiU2Nod2VpemVyaXNjaGUgQnVuZGVzYmFobmVuIFNCQlwiXVxyXG4gICAgICAgICAgICBkYXRhID1maWx0ZXIoZGF0YSxmaWx0ZXJjb250ZW50KTtcclxuICAgICAgICAgICAgZGF0YV9CID1maWx0ZXIoZGF0YV9CLGZpbHRlcmNvbnRlbnQpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBnZXREdW1teV9FREEoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gZ2V0RHVtbXlfRURJKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSxtb2R1bC5fZHNfc3VwcGxpZXJfRURJXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsXCJzdW1FREFcIiwgXCJzdW1FRElcIiwgW1wic3VtRURBXCIsXCJzdW1FRElcIl0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiI0JLX0VESV8yMDExXCI6Ly9CSyBFREEgMjAxMSxcclxuICAgICAgICBjYXNlIFwiI0JLX0VESV8yMDEyXCI6Ly9CSyBFREEgMjAxMixcclxuICAgICAgICBjYXNlIFwiI0JLX0VESV8yMDEzXCI6Ly9CSyBFREEgMjAxMyxcclxuICAgICAgICBjYXNlIFwiI0JLX0VESV8yMDE0XCI6Ly9CSyBFREEgMjAxNCxcclxuICAgICAgICAgICAgZmlsdGVyY29udGVudD1bXCJBaXJQbHVzIEludGVybmF0aW9uYWwgQUdcIixcIlNjaHdlaXplcmlzY2hlIEJ1bmRlc2JhaG5lbiBTQkJcIl1cclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsZmlsdGVyY29udGVudCk7XHJcbiAgICAgICAgICAgIGRhdGFfQiA9ZmlsdGVyKGRhdGFfQixmaWx0ZXJjb250ZW50KTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEST0gZ2V0RHVtbXlfQksoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0VEQT0gZ2V0RHVtbXlfRURBKGRhdGFfQiwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgY3N2YWxsPW1lcmdpbmdGaWxlcyhbbW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgbW9kdWwuX2RzX3N1cHBsaWVyX0VESV0pO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXI9bWF0cml4X0VESV9FREEoY3N2YWxsLCBcInN1bUVEQVwiLCBcInN1bUJ1bmRlc2thbnplbHRcIiwgW1wic3VtRURBXCIsXCJzdW1CdW5kZXNrYW56ZWx0XCJdKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIiNCS19FREFfRURJXzIwMTFcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgIGNhc2UgXCIjQktfRURBX0VESV8yMDEyXCI6Ly9FREEgMjAxNCwgRURJIDIwMTEsIEJLIDIwMTFcclxuICAgICAgICBjYXNlIFwiI0JLX0VEQV9FRElfMjAxM1wiOi8vRURBIDIwMTQsIEVESSAyMDExLCBCSyAyMDExXHJcbiAgICAgICAgY2FzZSBcIiNCS19FREFfRURJXzIwMTRcIjovL0VEQSAyMDE0LCBFREkgMjAxMSwgQksgMjAxMVxyXG4gICAgICAgICAgICBmaWx0ZXJjb250ZW50PVtcIkFpclBsdXMgSW50ZXJuYXRpb25hbCBBR1wiLFwiU2Nod2VpemVyaXNjaGUgQnVuZGVzYmFobmVuIFNCQlwiLFxyXG4gICAgICAgICAgICAgICAgXCJEaWUgU2Nod2VpemVyaXNjaGUgUG9zdCBTZXJ2aWNlIENlbnRlciBGaW5hbnplbiBNaXR0ZVwiXTtcclxuICAgICAgICAgICAgZGF0YSA9ZmlsdGVyKGRhdGEsIGZpbHRlcmNvbnRlbnQpO1xyXG4gICAgICAgICAgICBkYXRhX0IgPWZpbHRlcihkYXRhX0IsZmlsdGVyY29udGVudCk7XHJcbiAgICAgICAgICAgIGRhdGFfQyA9ZmlsdGVyKGRhdGFfQyxmaWx0ZXJjb250ZW50KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaWx0ZXIgY3JlYXRlZFwiKTtcclxuICAgICAgICAgICAgbW9kdWwuX2RzX3N1cHBsaWVyX0JLPSBnZXREdW1teV9CSyhkYXRhLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBnZXREdW1teV9FREEoZGF0YV9CLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURJPSBnZXREdW1teV9FREkoZGF0YV9DLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBjc3ZhbGw9bWVyZ2luZ0ZpbGVzKFsgbW9kdWwuX2RzX3N1cHBsaWVyX0JLLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURBLCBtb2R1bC5fZHNfc3VwcGxpZXJfRURJXSk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsIFwic3VtRURBXCIsIFwic3VtQnVuZGVza2FuemVsdFwiLCBbXCJzdW1CdW5kZXNrYW56ZWx0XCIsXCJzdW1FREFcIixcInN1bUVESVwiXSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJjc3YvRURBIC0gMjAxMS5jc3ZcIjpcclxuICAgICAgICBjYXNlIFwiY3N2L0VEQSAtIDIwMTMuY3N2XCI6XHJcbiAgICAgICAgY2FzZSBcImNzdi9FREEgLSAyMDE0LmNzdlwiOlxyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXJfRURBPSBnZXRTdXBwbGllcl9FREEobW9kdWwuX3N1cHBsaWVyLCBcInN1cHBsaWVyXCIpO1xyXG4gICAgICAgICAgICBzdXBwbGllciA9IG1hdHJpeF9TdXBwbGllcl9FREEobW9kdWwuX2RzX3N1cHBsaWVyX0VEQSwgNCk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllcj0gbW9kdWwuX2RzX3N1cHBsaWVyX0VEQTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImNzdi9EdW1teV9FREEuY3N2XCI6XHJcbiAgICAgICAgICAgIHZhciBkdW1teUVEQT1nZXREdW1teV9FREEoZGF0YSwgXCJzdXBwbGllclwiKTtcclxuICAgICAgICAgICAgdmFyIGR1bW15RURJPWdldER1bW15X0VESShkYXRhX0IsIFwic3VwcGxpZXJcIik7XHJcbiAgICAgICAgICAgIGNzdmFsbD1tZXJnaW5nRmlsZXMoW2R1bW15RURBLCBkdW1teUVESV0pO1xyXG4gICAgICAgICAgICAvL21vZHVsLl9kc19zdXBwbGllciA9IG1hdHJpeF9kdW1tYXlfQWxsKGNzdmFsbCk7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19zdXBwbGllcj1tYXRyaXhfRURJX0VEQShjc3ZhbGwsXCJzdW1FREFcIiwgXCJzdW1FRElcIik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVhZGNzdjpkZWZhdWx0XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfc3VwcGxpZXIgICAgPSBnZXRTdXBwbGllcihtb2R1bC5fc3VwcGxpZXIsIFwic3VwcGxpZXJcIik7Ly9uZXN0XHJcbiAgICAgICAgICAgIHN1cHBsaWVyID0gbWF0cml4X1N1cHBsaWVyKGRhdGEpO1xyXG4gICAgICAgICAgICBtb2R1bC5fZHNfZGVwdCAgICAgICAgPSBnZXREZXAobW9kdWwuX3N1cHBsaWVyLCBcImRlcHRcIik7XHJcbiAgICAgICAgICAgIG1vZHVsLl9kc19jb3N0ICAgICAgICA9IGdldENvc3QobW9kdWwuX3N1cHBsaWVyLCBcIkVEQV8xMDA2XCIpO1xyXG4gICAgICAgICAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJzZXRtYXRyaXhcIik7XHJcbn1cclxuZnVuY3Rpb24gZmlsdGVyKGRhdGEsIHBhcmFtKXtcclxuICAgIGNvbnNvbGUubG9nKFwiZmlsdGVyXCIpO1xyXG4gICAgaWYgKHBhcmFtLmxlbmd0aD09Mil7XHJcbiAgICAgICAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uKHJvdykge1xyXG4gICAgICAgICAgICBpZiAocm93W1wic3VwcGxpZXJcIl0gPT0gcGFyYW1bMF1cclxuICAgICAgICAgICAgICAgIHx8ICByb3dbXCJzdXBwbGllclwiXSA9PSBwYXJhbVsxXVxyXG4gICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIHsgIHJldHVybiByb3c7ICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbihyb3cpIHtcclxuICAgICAgICAgICAgaWYgKHJvd1tcInN1cHBsaWVyXCJdID09IHBhcmFtWzBdXHJcbiAgICAgICAgICAgICAgICB8fCAgcm93W1wic3VwcGxpZXJcIl0gPT0gcGFyYW1bMV1cclxuICAgICAgICAgICAgICAgIHx8ICByb3dbXCJzdXBwbGllclwiXSA9PSBwYXJhbVsyXSlcclxuICAgICAgICAgICAgeyAgcmV0dXJuIHJvdzsgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIG1hdHJpeF9TdXBwbGllcihkYXRhKSB7XHJcbiAgICAgICAgdmFyIG1hdHJpeCA9IFtdO1xyXG4gICAgICAgIHZhciBjb3VudGVyPTA7XHJcbiAgICAgICAgLy9tb2R1bC5fZHNfc3VwcGxpZXJbaV0udmFsdWVzWzBdLmtleSA9XCJFREFcIlxyXG4gICAgICAgIHZhciBzdXBwbGllciA9IGQzLmtleXMoZGF0YVswXSkuc2xpY2UoMSk7XHJcbiAgICAgICAgLy9TcGFsdGVuw7xiZXJzY2hyaWZ0ZW5cclxuICAgICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgICAgICBpZiAoY291bnRlciA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtcm93ID0gW107XHJcbiAgICAgICAgICAgICAgICBzdXBwbGllci5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGMgPT0gXCIxMDA1IEVEQVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtcm93LnB1c2goTnVtYmVyKHJvd1tjXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjID09IFwiMTAwNiBFREFcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgbXJvdy5wdXNoKE51bWJlcihyb3dbY10pKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHVzaFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICAgICAgcmV0dXJuIHN1cHBsaWVyO1xyXG4gICAgfVxyXG5cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyX0VESShkYXRhLCBlbmQpIHtcclxuICAgIC8vRmlsbCBNYXRyaXggRURBXHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgY291bnRlcj0wO1xyXG4gICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKTtcclxuICAgIC8vU3BhbHRlbsO8YmVyc2NocmlmdGVuXHJcbiAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xyXG4gICAgICAgIGlmIChjb3VudGVyIDwgZW5kKSB7XHJcbiAgICAgICAgICAgIHZhciBtcm93ID0gW107XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtR1NFRElcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVCR1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkFSXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CQUtcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bU1ldGVvQ0hcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUJBR1wiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtQkZTXCJdKTtcclxuICAgICAgICAgICAgbXJvdy5wdXNoKHJvdy52YWx1ZXNbXCJzdW1CU1ZcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bVNCRlwiXSk7XHJcbiAgICAgICAgICAgIG1yb3cucHVzaChyb3cudmFsdWVzW1wic3VtTkJcIl0pO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1hdHJpeF9TdXBwbGllcl9FREFcIik7XHJcbiAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcbmZ1bmN0aW9uIGdldER1bW15X0VESShjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuc3VwcGxpZXJ9KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KXtyZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUVESTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpe3JldHVybiBkW1wiQkFHXCJdfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBnZXREdW1teV9FREEoY3N2LCBuYW1lKXtcclxuICAgIHZhciBuZXN0ZWRfZGF0YT1kMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLnN1cHBsaWVyfSlcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpe3JldHVybiBkLmRlcHR9KVxyXG4gICAgICAgIC5yb2xsdXAoZnVuY3Rpb24odil7cmV0dXJue1xyXG4gICAgICAgICAgICBzdW1FREE6IGQzLnN1bSh2LCBmdW5jdGlvbihkKXtyZXR1cm4gZFtcIjEwMDUgRURBXCJdfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBnZXREdW1teV9CSyhjc3YsIG5hbWUpe1xyXG4gICAgdmFyIG5lc3RlZF9kYXRhPWQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuc3VwcGxpZXJ9KVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCl7cmV0dXJuIGQuZGVwdH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KXtyZXR1cm57XHJcbiAgICAgICAgICAgIHN1bUJ1bmRlc2thbnplbHQ6IGQzLnN1bSh2LCBmdW5jdGlvbihkKXtyZXR1cm4gZFtcIkJ1bmRlc2thbnpsZWlcIl19KVxyXG4gICAgICAgIH07fSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcbmZ1bmN0aW9uIGNvbXBhcmVDU1YoZGF0YUEsIGRhdGFCLCBkYXRhQyl7XHJcblxyXG4gICAgdmFyIG1yb3c9W107XHJcbiAgICBmb3IgKHZhciBpPTA7aTxkYXRhQS5sZW5ndGg7aSsrKXtcclxuICAgICAgICBmb3IgKHZhciBqPTA7ajxkYXRhQi5sZW5ndGg7aisrKXtcclxuICAgICAgICAgICAgaWYgKGRhdGFBW2ldLnN1cHBsaWVyPT1kYXRhQltqXS5zdXBwbGllcil7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrPTA7azxkYXRhQy5sZW5ndGg7aysrKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhQVtpXS5zdXBwbGllcj09ZGF0YUNba10uc3VwcGxpZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1yb3cucHVzaChkYXRhQVtpXS5zdXBwbGllcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgZXhwZW5zZXNCeU5hbWUgPSBkMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc3VwcGxpZXI7IH0pXHJcbiAgICAgICAgLmVudHJpZXMobXJvdyk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBtYXRyaXhfRURJX0VEQShEYXRhRURJX0VEQSwgTmFtZV9zdW1FREEsIE5hbWVfc3VtRURJLCBOYW1lc19zdW1zRURBX0VESV9CSyl7XHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgc3VwcGxpZXI9XCJcIjtcclxuICAgIHZhciBtaW51cz00MDAwMDAwO1xyXG4gICAgdmFyIGxlbmd0aCA9IERhdGFFRElfRURBLmxlbmd0aDtcclxuICAgIHZhciB0b3RhbGxlbmd0aCA9IChsZW5ndGgvKE5hbWVzX3N1bXNFREFfRURJX0JLLmxlbmd0aCkpKjI7XHJcbiAgICB2YXIgbWlkZGxlPSBkMy5yb3VuZChsZW5ndGgvTmFtZXNfc3Vtc0VEQV9FRElfQksubGVuZ3RoKTtcclxuICAgIHZhciB2b2JqZWN0aWQ9MDtcclxuXHJcbiAgICAvL0FycmF5IGZpbHRlcm5cclxuICAgIGZvciAodmFyIGk9MDtpPHRvdGFsbGVuZ3RoO2krKyApe1xyXG4gICAgICAgIHZhciBtcm93PVtdO1xyXG4gICAgICAgIGlmIChpPT1taWRkbGUpXHJcbiAgICAgICAgICAgIHZvYmplY3RpZD0wO1xyXG4gICAgICAgIGlmIChpIDwgbWlkZGxlKXtcclxuICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxtaWRkbGU7aisrKVxyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKDApO1xyXG4gICAgICAgICAgICBmb3IodmFyIGo9MDtqPG1pZGRsZTtqKyspe1xyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKGdldE1hdHJpeFZhbHVlKERhdGFFRElfRURBW3ZvYmplY3RpZF0sTmFtZXNfc3Vtc0VEQV9FRElfQkssdm9iamVjdGlkICkpO1xyXG4gICAgICAgICAgICAgICAgdm9iamVjdGlkKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxtaWRkbGU7aisrKXtcclxuICAgICAgICAgICAgICAgIG1yb3cucHVzaChnZXRNYXRyaXhWYWx1ZShEYXRhRURJX0VEQVt2b2JqZWN0aWRdLE5hbWVzX3N1bXNFREFfRURJX0JLLHZvYmplY3RpZCkpO1xyXG4gICAgICAgICAgICAgICAgdm9iamVjdGlkKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKHZhciBqPTA7ajxtaWRkbGU7aisrKVxyXG4gICAgICAgICAgICAgICAgbXJvdy5wdXNoKDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRyaXgucHVzaChtcm93KTtcclxuICAgIH1cclxuICAgIG1vZHVsLl9tYXRyaXggPSBtYXRyaXg7XHJcbiAgICB3aGlsZShtb2R1bC5fc3VwcGxpZXIubGVuZ3RoID4gMClcclxuICAgICAgICAgbW9kdWwuX3N1cHBsaWVyLnBvcCgpO1xyXG4gICAgY3JlYXRlU3VwcGxpZXJMaXN0KERhdGFFRElfRURBLE5hbWVzX3N1bXNFREFfRURJX0JLICk7XHJcblxyXG4gICAgY29uc29sZS5sb2coXCJtYXRyaXhfRHVtbXlBTExcIik7XHJcbiAgICByZXR1cm4gc3VwcGxpZXI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVN1cHBsaWVyTGlzdChkYXRhUm93cywgc3VwcGxpZXJfZmllbGQpe1xyXG4gICAgY29uc29sZS5sb2coKVxyXG4gICAgdmFyIHZfU3VwcGxpZXI9c3VwcGxpZXJfZmllbGQubGVuZ3RoO1xyXG4gICAgdmFyIGk9MDtcclxuICAgIHZhciBlbmQ9dl9TdXBwbGllcioyO1xyXG4gICAgY29uc29sZS5sb2coXCJjcmVhdGVTdXBwbGllckxpc3Q6XCIrZW5kKTtcclxuXHJcbiAgICAvL2ZpcnN0IGRlcHRcclxuICAgIGlmIChlbmQ9PTQpe1xyXG4gICAgICAgIHdoaWxlKCBpPGVuZCl7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgIGk9aSt2X1N1cHBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGVuZD09Nil7XHJcbiAgICAgICAgd2hpbGUoIGk8PWVuZCl7XHJcbiAgICAgICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldLnZhbHVlc1swXSk7XHJcbiAgICAgICAgICAgIGk9aSt2X1N1cHBsaWVyO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL3NlY29uZCBzdXBwbGllclxyXG4gICAgZm9yICh2YXIgaT0wO2k8dl9TdXBwbGllcjsgaSsrKVxyXG4gICAgICAgIG1vZHVsLl9zdXBwbGllci5wdXNoKGRhdGFSb3dzW2ldKVxyXG4gICAgY29uc29sZS5sb2coXCJjcmVhdGVTdXBwbGllckxpc3RcIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE1hdHJpeFZhbHVlKHJvdyxuYW1lVmFsdWUsIGNvdW50ZXIpe1xyXG4gICAgdmFyIGRlcE5hbWU7ICAgIC8vZ2V0IEZpZWxkbmFtZSBzdW1tIG9mIGVhY2ggRGVwYXJ0bWVudFxyXG4gICAgaWYgKG5hbWVWYWx1ZS5sZW5ndGg9PTIpIHtcclxuICAgICAgICBzd2l0Y2ggKGNvdW50ZXIpIHsvLzMgU3VwcGxpZXJcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBkZXBOYW1lID0gbmFtZVZhbHVlWzBdO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgZGVwTmFtZSA9IG5hbWVWYWx1ZVsxXTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgICAgZWxzZSBpZiAobmFtZVZhbHVlLmxlbmd0aD09Myl7XHJcbiAgICAgICAgICAgIHN3aXRjaChjb3VudGVyKXsvLzMgU3VwcGxpZXJcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVsxXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgIGNhc2UgNzpcclxuICAgICAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgICAgICAgICBkZXBOYW1lPW5hbWVWYWx1ZVsyXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZihuYW1lVmFsdWUubGVuZ3RoPT00KSAgICAgICAge1xyXG4gICAgICAgICAgICBzd2l0Y2goY291bnRlcil7Ly8zIFN1cHBsaWVyXHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICAgICAgZGVwTmFtZT1uYW1lVmFsdWVbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEwOlxyXG4gICAgICAgICAgICAgICAgY2FzZSAxMTpcclxuICAgICAgICAgICAgICAgIGNhc2UgMTI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEzOlxyXG4gICAgICAgICAgICAgICAgICAgIGRlcE5hbWU9bmFtZVZhbHVlWzJdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgIHJldHVybiBkMy5yb3VuZChyb3cudmFsdWVzWzBdLnZhbHVlc1tkZXBOYW1lXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFN1cHBsaWVyX0VESShjc3YsIG5hbWUpIHtcclxuICAgIHZhciBuZXN0ZWRfZGF0YSA9IGQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zdXBwbGllcjsgfSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJue1xyXG4gICAgICAgICAgICBzdW1HU0VESTogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJHUy1FRElcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1FQkc6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiRUJHXCJdOyB9KSxcclxuICAgICAgICAgICAgc3VtQkFSOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJBUlwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bUJBSzogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJCQUtcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1NZXRlb0NIOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkge3JldHVybiBkW1wiTWV0ZW9TY2h3ZWl6XCJdOyB9KSxcclxuICAgICAgICAgICAgc3VtQkFHOiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJBR1wiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bUJGUzogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJCRlNcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1CU1Y6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7ICByZXR1cm4gZFtcIkJTVlwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bVNCRjogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJTQkZcIl07IH0pLFxyXG4gICAgICAgICAgICBzdW1OQjogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCJOQlwiXTsgfSlcclxuICAgICAgICB9O30pXHJcbiAgICAgICAgLmVudHJpZXMoY3N2KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhcIiBnZXRTdXBwbGllcl9FRElcIik7XHJcbiAgICByZXR1cm4gbmVzdGVkX2RhdGE7XHJcbn1cclxuZnVuY3Rpb24gbWF0cml4X1N1cHBsaWVyX0VEQShkYXRhLCBlbmQpIHtcclxuICAgIC8vRmlsbCBNYXRyaXggRURBXHJcbiAgICB2YXIgbWF0cml4ID0gW107XHJcbiAgICB2YXIgY291bnRlcj0wO1xyXG4gICAgdmFyIHN1cHBsaWVyID0gZDMua2V5cyhkYXRhWzBdKTtcclxuXHJcbiAgICAvL1NwYWx0ZW7DvGJlcnNjaHJpZnRlblxyXG4gICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcclxuICAgICAgICBpZiAoY291bnRlciA8IGVuZCkge1xyXG4gICAgICAgICAgICB2YXIgbXJvdyA9IFtdO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVEQTEwMDVcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bUVEQTEwMDZcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bTEwOTdcIl0pO1xyXG4gICAgICAgICAgICBtcm93LnB1c2gocm93LnZhbHVlc1tcInN1bTExMTJcIl0pO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcbiAgICAgICAgICAgIG1hdHJpeC5wdXNoKG1yb3cpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInB1c2hcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBtb2R1bC5fbWF0cml4ID0gbWF0cml4O1xyXG4gICAgY29uc29sZS5sb2coXCJtYXRyaXhfU3VwcGxpZXJfRURJXCIpO1xyXG4gICAgcmV0dXJuIHN1cHBsaWVyO1xyXG59XHJcbmZ1bmN0aW9uIGdldFN1cHBsaWVyX0VEQShjc3YsIG5hbWUpIHtcclxuICAgIHZhciBuZXN0ZWRfZGF0YSA9IGQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zdXBwbGllcjsgfSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJue1xyXG4gICAgICAgICAgICBzdW1FREExMDA1OiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIjEwMDUgRURBXCJdOyB9KSxcclxuICAgICAgICAgICAgc3VtRURBMTAwNjogZDMuc3VtKHYsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbXCIxMDA2IEVEQVwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bTEwOTc6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiMTA5NyBJbmZvcm1hdGlrIEVEQVwiXTsgfSksXHJcbiAgICAgICAgICAgIHN1bTExMTI6IGQzLnN1bSh2LCBmdW5jdGlvbihkKSB7IHJldHVybiBkW1wiMTExMiBCUlpcIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICBjb25zb2xlLmxvZyhcImdldFN1cHBsaWVyX0VEQVwiKTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG5mdW5jdGlvbiBnZXRTdXBwbGllcl9CSyhjc3YsIG5hbWUpIHtcclxuICAgIHZhciBuZXN0ZWRfZGF0YSA9IGQzLm5lc3QoKVxyXG4gICAgICAgIC5rZXkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zdXBwbGllcjsgfSlcclxuICAgICAgICAucm9sbHVwKGZ1bmN0aW9uKHYpIHsgcmV0dXJue1xyXG4gICAgICAgICAgICBzdW1CdW5kZXNrYW56ZWx0OiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIkJ1bmRlc2thbnpsZWlcIl07IH0pXHJcbiAgICAgICAgfTt9KVxyXG4gICAgICAgIC5lbnRyaWVzKGNzdik7XHJcbiAgICBjb25zb2xlLmxvZyhcImdldFN1cHBsaWVyX0JLXCIpO1xyXG4gICAgcmV0dXJuIG5lc3RlZF9kYXRhO1xyXG59XHJcbmZ1bmN0aW9uIG1lcmdpbmdGaWxlcyhjc3ZGaWxlcykge1xyXG4gICAgY29uc29sZS5sb2coXCJtZXJnaW5nIGZpbGVzXCIpO1xyXG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgIHZhciBvdXRwdXQ7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNzdkZpbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKGNzdkZpbGVzW2ldKTtcclxuICAgIH1cclxuICAgIG91dHB1dCA9IGQzLm1lcmdlKHJlc3VsdHMpO1xyXG4gICAgcmV0dXJuIG91dHB1dDtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0U3VwcGxpZXIoY3N2LCBuYW1lKSB7XHJcbiAgICB2YXIgbmVzdGVkX2RhdGEgPSBkMy5uZXN0KClcclxuICAgICAgICAua2V5KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc3VwcGxpZXI7IH0pXHJcbiAgICAgICAgLmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLmRlcHQ7IH0pXHJcbiAgICAgICAgLnJvbGx1cChmdW5jdGlvbih2KSB7IHJldHVybiBkMy5zdW0odiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZFtcIjEwMDYgRURBXCJdOyB9KTsgfSlcclxuICAgICAgICAuZW50cmllcyhjc3YpO1xyXG4gICAgY29uc29sZS5sb2coXCJnZXRTdXBwbGllclwiKTtcclxuICAgIHJldHVybiBuZXN0ZWRfZGF0YTtcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgY3JlYXRlQXJjOmNyZWF0ZUFyYyxcclxuICAgIGxheW91dDpsYXlvdXQsXHJcbiAgICBwYXRoOnBhdGgsXHJcbiAgICBzZXRTVkc6c2V0U1ZHLFxyXG4gICAgYXBwZW5kQ2lyY2xlOmFwcGVuZENpcmNsZSxcclxuICAgIG1vdmVzdmc6bW92ZXN2ZyxcclxuICAgIHN0YXJ0cXVldWU6c3RhcnRxdWV1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBcmMoKXtcclxuICAgIG1vZHVsLl9hcmMgPSBkMy5zdmcuYXJjKClcclxuICAgICAgICAuaW5uZXJSYWRpdXMobW9kdWwuX2lubmVyUmFkaXVzKVxyXG4gICAgICAgIC5vdXRlclJhZGl1cyhtb2R1bC5fb3V0ZXJSYWRpdXMpXHJcbiAgICBjb25zb2xlLmxvZyhcImNyZWF0ZUFyY1wiKTtcclxufVxyXG4vLzNcclxuZnVuY3Rpb24gbGF5b3V0KCl7Ly9wYWRkaW5nIDAuMDQgYWJzdGFuZCA0JVxyXG4gICAgbW9kdWwuX2xheW91dCA9IGQzLmxheW91dC5jaG9yZCgpXHJcbiAgICAgICAgLnBhZGRpbmcoLjA0KVxyXG4gICAgICAgIC5zb3J0U3ViZ3JvdXBzKGQzLmRlc2NlbmRpbmcpXHJcbiAgICAgICAgLnNvcnRDaG9yZHMoZDMuYXNjZW5kaW5nKTtcclxuICAgIGNvbnNvbGUubG9nKFwibGF5b3V0XCIpO1xyXG59XHJcbi8vNFxyXG5mdW5jdGlvbiBwYXRoKCl7XHJcbiAgICBtb2R1bC5fcGF0aCA9IGQzLnN2Zy5jaG9yZCgpXHJcbiAgICAgICAgLnJhZGl1cyhtb2R1bC5faW5uZXJSYWRpdXMpO1xyXG4gICAgY29uc29sZS5sb2coXCJwYXRoXCIpO1xyXG59XHJcbi8vNVxyXG5mdW5jdGlvbiBzZXRTVkcoKXtcclxuICAgIC8vbW9kdWwuX3N2Zz1fc3ZnLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XHJcbiAgICBtb2R1bC5fc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIilcclxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIG1vZHVsLl93aWR0aClcclxuICAgICAgICAuYXR0cihcImhlaWdodFwiLG1vZHVsLl9oZWlnaHQpXHJcbiAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAuYXR0cihcImlkXCIsIFwiY2lyY2xlXCIpXHJcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtb2R1bC5fd2lkdGggLyAyICsgXCIsXCIgKyBtb2R1bC5faGVpZ2h0IC8gMiArIFwiKVwiKTtcclxufVxyXG4vLzZcclxuZnVuY3Rpb24gYXBwZW5kQ2lyY2xlKCl7XHJcbiAgICBtb2R1bC5fc3ZnLmFwcGVuZChcImNpcmNsZVwiKVxyXG4gICAgICAgIC5hdHRyKFwiclwiLG1vZHVsLl9vdXRlclJhZGl1cyk7XHJcbiAgICBjb25zb2xlLmxvZyhcImFwcGVuZENpcmNsZVwiKTtcclxufVxyXG4vLzE0XHJcbmZ1bmN0aW9uIG1vdmVzdmcoKXtcclxuICAgIG1vZHVsLl9zdmcgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgbW9kdWwuX3dpZHRoKVxyXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIG1vZHVsLl9oZWlnaHQpXHJcbiAgICAgICAgLmFwcGVuZChcImdcIilcclxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIittb2R1bC5fd2lkdGgrXCIsXCIrbW9kdWwuX2hlaWdodCtcIilcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1vdmVzdmdcIik7XHJcbn1cclxuZnVuY3Rpb24gc3RhcnRxdWV1ZShjc3ZfbmFtZSwganNvbl9uYW1lKXtcclxuICAgIHF1ZXVlKClcclxuICAgICAgICAuZGVmZXIoZDMuY3N2LCBjc3ZfbmFtZSlcclxuICAgICAgICAuZGVmZXIoZDMuanNvbiwganNvbl9uYW1lKVxyXG4gICAgICAgIC5hd2FpdChrZWVwRGF0YSk7Ly9vbmx5IGZ1bmN0aW9uIG5hbWUgaXMgbmVlZGVkXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSBjaHJpcyBvbiAyMS4xMC4yMDE2LlxyXG4gKi9cclxubW9kdWwgPSAgIHJlcXVpcmUoJy4vTW9kdWwnKTtcclxubW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgY3JlYXRlVGl0bGU6Y3JlYXRlVGl0bGVcclxufVxyXG4gZnVuY3Rpb24gY3JlYXRlVGl0bGUoKSB7XHJcbiAgICAgbW9kdWwuX2Nob3JkLmFwcGVuZChcInRpdGxlXCIpLnRleHQoZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICByZXR1cm4gbW9kdWwuX3N1cHBsaWVyW2Quc291cmNlLmluZGV4XS5zdXBwbGllclxyXG4gICAgICAgICAgICArIFwiIOKGkiBcIiArIG1vZHVsLl9zdXBwbGllcltkLnRhcmdldC5pbmRleF0uc3VwcGxpZXJcclxuICAgICAgICAgICAgKyBcIjogXCIgKyBtb2R1bC5fZm9ybWF0UGVyY2VudChkLnNvdXJjZS52YWx1ZSlcclxuICAgICAgICAgICAgKyBcIlxcblwiICsgbW9kdWwuX3N1cHBsaWVyW2QudGFyZ2V0LmluZGV4XS5zdXBwbGllclxyXG4gICAgICAgICAgICArIFwiIOKGkiBcIiArIG1vZHVsLl9zdXBwbGllcltkLnNvdXJjZS5pbmRleF0uc3VwcGxpZXJcclxuICAgICAgICAgICAgKyBcIjogXCIgK21vZHVsLl9mb3JtYXRQZXJjZW50KGQudGFyZ2V0LnZhbHVlKTtcclxuICAgIH0pO1xyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgY2hyaXMgb24gMjUuMTAuMjAxNi5cclxuICovXHJcbi8vc3RhcnQgZmlsZS8vXHJcblwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIG1vZHVsID0gICByZXF1aXJlKCcuL0phdmFzY3JpcHRzL01vZHVsJyk7XHJcbi8vdmFyIFNldHRpbmdEYXRhID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9TZXR0aW5nRGF0YScpO1xyXG4gICAgdmFyIFNldHRpbmdMYXlvdXQgPSByZXF1aXJlKCcuL0phdmFzY3JpcHRzL1NldHRpbmdMYXlvdXQnKTtcclxuICAgIHZhciBTZXR0aW5nQ2hvcmRzID0gcmVxdWlyZSgnLi9KYXZhc2NyaXB0cy9TZXR0aW5nQ2hvcmRzJyk7XHJcbiAgICB2YXIgU2V0dGluZ0lucHV0ICA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0lucHV0Jyk7XHJcbiAgICB2YXIgU2V0dGluZ0dyb3VwcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ0dyb3VwcycpO1xyXG4gICAgdmFyIFNldHRpbmdUaXRsZSA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvU2V0dGluZ1RpdGxlJyk7XHJcbiAgICB2YXIgQ3JlYXRpbmdMaW5rcyA9IHJlcXVpcmUoJy4vSmF2YXNjcmlwdHMvQ3JlYXRpbmdMaW5rcycpO1xyXG4gICAgdmFyIHE7XHJcblxyXG4vL3N0YXJ0aW5nIHdpdGggY2hvaWNlZCBjc3YtZmlsc1xyXG5nbG9iYWwuc3RhcnRwcm9jZXNzZ2xvYmFsID0gZnVuY3Rpb24oY29udGVudCwgY29udGVudF9CLGNvbnRlbnRfQywgY2hvaWNlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0cHJvY2Vzc2dsb2JhbFwiKTtcclxuICAgIG1vZHVsLl9jdXJyZW50Y3N2PVwiXCI7XHJcbiAgICBtb2R1bC5fdl9jaG9pY2U9Y2hvaWNlO1xyXG4gICAgLy9kMy5zZWxlY3QoXCIjcmVzdWx0XCIpLnByb3BlcnR5KFwidmFsdWVcIiwgY3N2KTtcclxuICAgIC8vdmFyIHJlcyA9IGRvY3VtZW50LmZvcm1zWzBdW1wicmVzdWx0XCJdLnZhbHVlO1xyXG4gICAgY29uc29sZS5sb2coXCJwcm9jZXNzOnN0YXJ0XCIrY29udGVudCwgY29udGVudF9CLGNvbnRlbnRfQyk7XHJcbiAgICBzZXR0aW5nUGFyYW0oMCwgMCwgNzIwLCA3MjAsIDYsIDE1LCAwLCAwKTtcclxuICAgIHByb2Nlc3MoY29udGVudCwgY29udGVudF9CLGNvbnRlbnRfQyk7XHJcbn1cclxuXHJcbi8vY2hhbmdpbmcgd2lkdGgsIGhlaWdodCwgb3V0ZXIgcmFkaXVzIHBlciBodG1sXHJcbmdsb2JhbC5zdGFydHByb2Nlc3NEZXNpZ249ZnVuY3Rpb24oY29udGVudCwgbmFtZSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzX2ksIHJhZGl1c19vKXtcclxuICAgIGNvbnNvbGUubG9nKFwic3RhcnRwcm9jZXNzRGVzaWduXCIpO1xyXG4gICAgbW9kdWwuX2N1cnJlbnRjc3Y9XCJcIjtcclxuICAgIGNvbnNvbGUubG9nKFwicHJvY2VzczpkZXNpZ25cIitjb250ZW50KTtcclxuICAgIGNvbnNvbGUubG9nKHdpZHRoICtcIiBcIisgaGVpZ2h0ICtcIiBcIiArcmFkaXVzX28pO1xyXG4gICAgc2V0dGluZ1BhcmFtKDAsIDAsIHdpZHRoLCBoZWlnaHQsIDYsIDE1LCAwLCByYWRpdXNfbyk7XHJcbiAgICBwcm9jZXNzKGNvbnRlbnQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcm9jZXNzKGZpbGVuYW1lLCBmaWxlbmFtZV9CLCBmaWxlbmFtZV9DKSB7XHJcbiAgICBtb2R1bC5fc3ZnPWQzLnNlbGVjdChcInN2Z1wiKS5yZW1vdmUoKTtcclxuICAgIG1vZHVsLl9zdmcgPSBkMy5zZWxlY3QoXCJzdmdcIik7XHJcbiAgICBjb25zb2xlLmxvZyhcInByb2Nlc3M6bWFpblwiKTtcclxuICAgIC8vZGVmYXVsdFxyXG4gICAgbW9kdWwuX2N1cnJlbnRjc3Y9XCJjc3YvXCIrZmlsZW5hbWU7XHJcbiAgICBtb2R1bC5fY3VycmVudGNzdl9CPVwiY3N2L1wiK2ZpbGVuYW1lX0I7XHJcbiAgICBpZiAoZmlsZW5hbWVfQyE9MClcclxuICAgICAgICBtb2R1bC5fY3VycmVudGNzdl9DPVwiY3N2L1wiK2ZpbGVuYW1lX0M7XHJcbiAgICBjb25zb2xlLmxvZyhcImNzdi9cIitmaWxlbmFtZSk7XHJcbiAgICBTZXR0aW5nTGF5b3V0LmNyZWF0ZUFyYygpO1xyXG4gICAgU2V0dGluZ0xheW91dC5sYXlvdXQoKTtcclxuICAgIFNldHRpbmdMYXlvdXQucGF0aCgpO1xyXG4gICAgU2V0dGluZ0xheW91dC5zZXRTVkcoKTtcclxuICAgIC8vU2V0dGluZ0xheW91dC5tb3Zlc3ZnKCk7XHJcbiAgICBTZXR0aW5nTGF5b3V0LmFwcGVuZENpcmNsZSgpO1xyXG4gICAgY29uc29sZS5sb2coXCJwcm9jZXNzOmRlZmVyOlwiK21vZHVsLl9jdXJyZW50Y3N2KTtcclxuICAgIHE9IGQzLnF1ZXVlKClcclxuICAgIHFcclxuICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNzdilcclxuICAgICAgICAuZGVmZXIoZDMuY3N2LCBtb2R1bC5fY3VycmVudGNzdl9CKVxyXG4gICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y3N2X0MpXHJcbiAgICAgICAgLmRlZmVyKGQzLmpzb24sbW9kdWwuX2N1cnJlbnRqc29uKVxyXG4gICAgICAgIC5kZWZlcihkMy5jc3YsIG1vZHVsLl9jdXJyZW50Y29sb3IpXHJcbiAgICAgICAgLmRlZmVyKGQzLmNzdiwgXCJjc3YvXCIrXCJEdW1teV9FREFfRURJX0FsbC5jc3ZcIilcclxuICAgICAgICAuYXdhaXQoU2V0dGluZ3NCKVxyXG59XHJcbmZ1bmN0aW9uIFNldHRpbmdzQihlcnJvciwgbV9zdXBwbGllciwgIG1fc3VwcGxpZXJfQiwgbV9zdXBwbGllcl9DLG1hdHJpeCwgY29sb3IsbV9kdW1teSlcclxue1xyXG4gICAgY29uc29sZS5sb2coXCJTZXR0aW5nc0JcIik7XHJcbiAgICBtb2R1bC5fc3VwcGxpZXI9bV9zdXBwbGllcjsvL0zDpG5kZXJib2dlbm5hbWVubiBzZXR6ZW5cclxuICAgIFNldHRpbmdJbnB1dC5yZWFkY3N2KG1fc3VwcGxpZXIsIG1fc3VwcGxpZXJfQiwgbV9zdXBwbGllcl9DLG1hdHJpeCk7Ly9GaWxsIERTLVN1cHBsaWVyICsgRFMtRGVwdCwgTWF0cml4XHJcbiAgICBtb2R1bC5fbGF5b3V0Lm1hdHJpeChtb2R1bC5fbWF0cml4KTtcclxuICAgIG1vZHVsLl9jb2xvcj1jb2xvcjtcclxuICAgIC8vY29uc29sZS5sb2coXCIyOlNldHRpbmdzQjogQW56YWg6X3N1cHBsaWVyOlwiK21vZHVsLl9zdXBwbGllci5sZW5ndGgpO1xyXG5cclxuICAgIFNldHRpbmdHcm91cHMubmVpZ2hib3Job29kKCk7XHJcbiAgICBTZXR0aW5nR3JvdXBzLmdyb3VwUGF0aCgpO1xyXG4gICAgU2V0dGluZ0dyb3Vwcy5ncm91cFRleHQoKTtcclxuICAgIFNldHRpbmdHcm91cHMuZ3JvdXB0ZXh0RmlsdGVyKCk7XHJcbiAgICBTZXR0aW5nQ2hvcmRzLnNlbGVjdGNob3JkcygpO1xyXG4gICAgU2V0dGluZ1RpdGxlLmNyZWF0ZVRpdGxlKCk7XHJcbn1cclxuLy9TZXR0aW5nIFBhcmFtc1xyXG5mdW5jdGlvbiBzZXR0aW5nUGFyYW0odHJhbnNfd2lkdGgsIHRyYW5zX2hlaWdodCwgd2lkdGgsIGhlaWdodCxcclxuICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX3gsIGdyb3VwX2R5LHJhZGl1c19pLCByYWRpdXNfbykge1xyXG4gICAgbW9kdWwuX3RyYW5zZm9ybV93aWR0aCA9IHRyYW5zX3dpZHRoO1xyXG4gICAgbW9kdWwuX3RyYW5zZm9ybV9oZWlnaHQgPSB0cmFuc19oZWlnaHQ7XHJcbiAgICBtb2R1bC5fd2lkdGggPSB3aWR0aDtcclxuICAgIG1vZHVsLl9oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAvL1JhZGl1c1xyXG4gICAgaWYgKHJhZGl1c19vPT0wKXtcclxuICAgICAgICBtb2R1bC5fb3V0ZXJSYWRpdXMgPSBNYXRoLm1pbihtb2R1bC5fd2lkdGgsIG1vZHVsLl9oZWlnaHQpIC8gMiAtIDEwO1xyXG4gICAgICAgIG1vZHVsLl9pbm5lclJhZGl1cyA9IG1vZHVsLl9vdXRlclJhZGl1cyAtIDI0O1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBtb2R1bC5fb3V0ZXJSYWRpdXMgPSBNYXRoLm1pbihtb2R1bC5fd2lkdGgsIG1vZHVsLl9oZWlnaHQpIC8gMiAtIDEwO1xyXG4gICAgICAgIG1vZHVsLl9pbm5lclJhZGl1cyA9IHJhZGl1c19vIC0gMjQ7XHJcbiAgICB9XHJcbiAgICAvL3BlcmNlbnRyYWdlXHJcbiAgICBtb2R1bC5fZm9ybWF0UGVyY2VudCA9IGQzLmZvcm1hdChcIi4xJVwiKTtcclxuICAgIC8vc2VldGluZyBpbnB1XHJcbiAgICBtb2R1bC5fZ3JvdXBfeCA9IGdyb3VwX3g7XHJcbiAgICBtb2R1bC5fZ3JvdXBfZHkgPSBncm91cF9keTtcclxufVxyXG5mdW5jdGlvbiBnZXRfcmVxdWVzdFBhcmFtKGNzdmZpbGUsICBkZXApe1xyXG4gICAgUXVlcnlzdHJpbmdcclxufVxyXG4iXX0=
