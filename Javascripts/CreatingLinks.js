/**
 * Created by chris on 24.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    _currentURL:   _currentURL,
    _queryOutput:  _queryOutput,
    setCurrentUrl: setCurrentUrl,
    createLink:    creatLink,
    setParam:      setParam
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
function createLink(){

    var startappend="?";
    var seperator="=";
    var appender="&";
    var i=0;

    _queryOutput=_currentURL;
    _queryOutput=_currentURL+startappend;

    params.forEach(function(v){
        _queryOutput=_queryOutput+params[i].name +seperator+params[i];
        i=i+1;
    })
}
