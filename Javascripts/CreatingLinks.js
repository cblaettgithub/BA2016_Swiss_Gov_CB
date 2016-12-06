/**
 * Created by chris on 24.10.2016.
 */
modul =   require('./Modul');

module.exports = {
    setCurrentUrl: setCurrentUrl,
    setParam:      setParam,
    _currentURL:   _currentURL,
    _queryOutput:  _queryOutput,
    createLink:createLink
}

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

var params =
{   year:      "data.csv",dept: "data.csv",     supplier: "data.csv",
    total_EDI: "data.csv",total_EDA: "data.csv",width: "data.csv",
    height:    "data.csv",currentURL: "data.csv"
};
var paramsdept=
{
    dept1:"", dept2:"", dept3:"", dept4:""
};

function setCurrentUrl(startUrl){
    _currentURL=startUrl
}

function setParam(dept, supplier, category, year)
{
    for (var i=0;i<dept.length;i++){
        paramsdept[i]=dept[i];
    }

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

    /*
    _year=year;
    _supplier=supplier;
    _total_EDI=total_EDI;
    _total_EDA=total_EDA;
    _width=width;
    _height=height;

    params[0]=_year;//params für dept und supplier
    params[1]=_dept;
    params[2]=_supplier;
    params[3]=_total_EDI;
    params[4]=_total_EDA;
    params[5]=_width;
    params[6]=_height;
}
*/
function createLink(){

    var startappend="?";
    var seperator="=";
    var appender="&";

    _queryOutput=_currentURL;
    _queryOutput=_currentURL+startappend;

    paramsdept.forEach(function(item){
        _queryOutput=_queryOutput+item.name +seperator+item;
    });
    _queryOutput+=appender+"supplier="+_supplier;
    _queryOutput+=appender+"cat="+_category;
    _queryOutput+=appender+"year="+_year;
    modul._http_query=_queryOutput;
}
