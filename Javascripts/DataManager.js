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
    getDummy_UVEK:getDummy_UVEK,
    getDummy_VBS:getDummy_VBS,
    getDummy_WBF:getDummy_WBF,
    getSupplier:getSupplier
};
var d3 = require("d3");

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
            sumEDI: d3.sum(v, function(d){return d["BAG"]+d["BFS"]})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EFD(csv, name){
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            //sumEFD: d3.sum(v, function(d) { return d["EZF"]+ d["BIT"]+ d["BBL"]; })
            sumEFD: d3.sum(v, function(d) { return d["BIT"]+d["EFK"]+d["EPA"];})
        };})
        .entries(csv);
    return nested_data;
}
function getDummy_EJPD(csv, name){
    var temp;
    var nested_data=d3.nest()
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v) { return{
            sumBFM: d3.sum(v, function(d) {
                console.log("1:"+ d["ISC-EJPD"]);
                if ((d["ISC-EJPD"].value!== undefined)){
                         //console.log("not undefined:"+d["ISC-EJPD"].value);
                         temp=d["ISC-EJPD"].value;
                }
                if ((d["ISC-EJPD"].value== undefined)){
                    //console.log("undefined:"+d["ISC-EJPD"].value);
                }
                //console.log("2:"+ d["BFM"]);
                /*if (isNaN(d["ISC-EJPD"].value)){
                    console.log("getDummy_EJPD:isna");
                    d["ISC-EJPD"]=0;
                }*/
                /*if (isNaN(d["ISC-EJPD"])){
                    d["ISC-EJPD"]=0;
                }*/
                return d["BFM"]+ d["ISC-EJPD"]; })
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
            //sumWBF: d3.sum(v, function(d) { return d["GS-WBF"]+d["BLW"]+d["Agroscope"]; })
            sumWBF: d3.sum(v, function(d) { return d["GS-WBF"]+d["BLW"]; })
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

