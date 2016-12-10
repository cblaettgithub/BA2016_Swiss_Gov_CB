/**
 * Created by chris on 24.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    setCurrentUrl: setCurrentUrl,
    setParam:      setParam,
    _currentURL:   _currentURL,
    _queryOutput:  _queryOutput,
    depts:       depts,
    createLink:createLink
};

var _year;
var _dept;
var _supplier;
var _category;
var _total_EDI;
var _total_EDA;
var _width;
var _height;
var _currentURL="Supplier_2016_chord.html";
var _ArrayParams;
var _queryOutput="";
var _ArrayCounter=0;
var myurl="http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html";

var params =
{   year:      "data.csv",dept: "data.csv",     supplier: "data.csv",
    total_EDI: "data.csv",total_EDA: "data.csv",width: "data.csv",
    height:    "data.csv",currentURL: "data.csv"
};
var depts=
{
};
function setCurrentUrl(startUrl){
    _currentURL=startUrl
};

function setParam(dept, supplier, category, year)
{
    console.log("setparam");
    var name="";
    for (var i=0;i<dept.length;i++){
        name="de";
        name+=i;
        depts[name]=dept[i];
        console.log("dept:"+depts[i]);
        name="";
        _ArrayCounter++;
    }

    console.log("l:"+_ArrayCounter);
    if (supplier=0){
        _supplier=0;
       _category=category;
    }
    else{
        _supplier=supplier;
        _category=0;
    }
    _year=year;
}

function createLink(){
    console.log("createLink");

    var startappend="?";
    var seperator="=";
    var appender="&";
    var name="";

    _queryOutput=myurl;
    _queryOutput+=startappend;

    for(var i=0;i<_ArrayCounter;i++){
        name="de";
        name+=i;
        _queryOutput+="depts"+seperator+depts[name]+appender;
        console.log("query:"+_queryOutput);
        name="";
    }
    _queryOutput+="supplier="+_supplier;
    _queryOutput+=appender+"cat="+_category;
    _queryOutput+=appender+"year="+_year;

    modul._http_query=_queryOutput;
    console.log(_queryOutput);
}


