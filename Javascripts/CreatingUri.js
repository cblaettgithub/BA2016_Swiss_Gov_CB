/**
 * Created by chris on 10.12.2016.
 */
modul =   require('./Modul');

module.exports = {
    setCurrentUrl: setCurrentUrl,
    setParamsUri:setParamsUri,
    _currentURL:   _currentURL,
    _UriOutput:_UriOutput,
    depts:       depts,
    createUri:  createUri,
    create_choicevariableUri:create_choicevariableUri
};

var _year;
var _dept;
var _supplier;
var _category;
var _currentURL="Supplier_2016_chord.html";
var _UriOutput="";
var _ArrayCounter=0;
var myurl="http://localhost:63343/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html";

var depts={ };

function setCurrentUrl(startUrl){
    _currentURL=startUrl
};

function setParamsUri(dept, supplier, category, year){
    console.log("CreatingUri:setparam");
    var name="";
    for (var i=0;i<dept.length;i++){
        name="de";
        name+=i;
        depts[name]=dept[i];
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
function createUri(){
    console.log("createUri");

    var startappend="/";
    var seperator="/";
    var seperatorItem=",";
    var appender="&";
    var name="de0";

    _UriOutput=myurl;
    _UriOutput+=startappend;

    _UriOutput+="dept"+seperator;//dept
    _UriOutput+=depts[name];//first
    for(var i=1;i<_ArrayCounter;i++){
        name="";
        name="de";
        name+=i;
        _UriOutput+=seperatorItem+depts[name];
    }
    _UriOutput+=seperator+"supplier"+seperator;//supp
    _UriOutput+=_supplier;

    _UriOutput+=seperator+"cat"+seperator;//cat
    _UriOutput+=_category;

    _UriOutput+=seperator+"year"+seperator;//year
    _UriOutput+=_year+seperator;
    modul._http_uri=_UriOutput;
    console.log(_UriOutput);
}
//creates the stringname for starting application
function create_choicevariableUri(queryObject){
    var choice="";
    for (var i=0;i<queryObject.depts.length;i++)
        choice+=queryObject.depts[i]+"_";

    choice+=queryObject.year.substr(0,4);
    modul._v_choice=choice;
}



