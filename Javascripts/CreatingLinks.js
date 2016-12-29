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
    createLink:createLink,
    create_choicevariable:create_choicevariable,
    create_supp_category_modulvariable:create_supp_category_modulvariable,
    setParamMain:setParamMain,
    createLinkMain:createLinkMain
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
var _ArrayCounterDept=0;
var _ArrayCounterSupplier=0;
var _ArrayCounterCategorys=0;

var myurl="http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html";
var myurl2="http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_main.html";


var params =
{   year:      "data.csv",dept: "data.csv",     supplier: "data.csv",
    total_EDI: "data.csv",total_EDA: "data.csv",width: "data.csv",
    height:    "data.csv",currentURL: "data.csv"
};
var depts={};
var suppliers={};
var categorys={};

function setCurrentUrl(startUrl){
    _currentURL=startUrl
};

function setParam(dept, supplier, category, year)
{
    console.log("CreatingLinks:setparam");
    var name="";
    for (var i=0;i<dept.length;i++){
        name="de";
        name+=i;
        depts[name]=dept[i];
        console.log("dept:"+depts[i]);
        name="";
        _ArrayCounterDept++;
    }
    //supplier
     _supplier=supplier;//->alte version

    //categorys
     _category=category;//->alte version
    _year=year;
}
function setParamMain(dept, supplier, category, year)
{
    console.log("CreatingLinks:setparam");
    var name="";
    for (var i=0;i<dept.length;i++){
        name="de";
        name+=i;
        depts[name]=dept[i];
        console.log("dept:"+depts[i]);
        name="";
        _ArrayCounterDept++;
    }
    //supplier
    // _supplier=supplier;//->alte version
    for (var i=0;i<supplier.length;i++){
        name="de";
        name+=i;
        suppliers[name]=supplier[i];
        console.log("dept:"+suppliers[i]);
        name="";
        _ArrayCounterSupplier++;
    }
    //categorys
    // _category=category;//->alte version
    for (var i=0;i<category.length;i++){
        name="de";
        name+=i;
        categorys[name]=category[i];
        console.log("dept:"+categorys[i]);
        name="";
        _ArrayCounterCategorys++;
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

    for(var i=0; i<_ArrayCounterDept; i++){
        name="de";
        name+=i;
        _queryOutput+="depts"+seperator+depts[name]+appender;
        console.log("query:"+_queryOutput);
        name="";
    }
    //supplier
    _queryOutput+="supplier="+_supplier;//->alte version

    //categorys
    _queryOutput+=appender+"cat="+_category;//->alte version
    _queryOutput+=appender+"year="+_year;

    modul._http_query=_queryOutput;
    console.log(_queryOutput);
}
function createLinkMain(){
    console.log("createLink");

    var startappend="?";
    var seperator="=";
    var appender="&";
    var name="";

    _queryOutput=myurl2;
    _queryOutput+=startappend;

    for(var i=0; i<_ArrayCounterDept; i++){
        name="de";
        name+=i;
        _queryOutput+="depts"+seperator+depts[name]+appender;
        console.log("query:"+_queryOutput);
        name="";
    }

    //supplier
    //_queryOutput+="supplier="+_supplier;//->alte version
    for(var i=0; i<_ArrayCounterSupplier; i++){
        name="de";
        name+=i;
        _queryOutput+="sup"+seperator+suppliers[name]+appender;
        console.log("query:"+_queryOutput);
        name="";
    }

    //categorys
    //_queryOutput+=appender+"cat="+_category;//->alte version
    for(var i=0; i<_ArrayCounterCategorys; i++){//-->neue version
        name="de";
        name+=i;
        _queryOutput+="cat"+seperator+categorys[name]+appender;
        console.log("query:"+_queryOutput);
        name="";
    }
    _queryOutput+=appender+"year="+_year;

    modul._http_query=_queryOutput;
    console.log(_queryOutput);
}

function create_choicevariable(queryObject){
    var choice="";
    console.log("create_choicevariable:"+queryObject.cat);
    console.log("create_choicevariable:"+queryObject.supplier);
    console.log("create_choicevariable:"+queryObject.year);

    for (var i=0;i<queryObject.depts.length;i++){
        console.log(queryObject.depts[i]);
    }
    for (var i=0;i<queryObject.depts.length;i++)
        choice+=queryObject.depts[i]+"_";

    choice+=queryObject.year.substr(0,4);
    modul._v_choice=choice;
    modul._choiceData=queryObject.supplier;
    modul._choiceData_Cat=queryObject.cat;

    switch ( modul._choiceData){
        case "supp_A":
            modul._currentcolor="csv/color_2.csv";
            break;
        case "supp_B":
            modul._currentcolor="csv/color_3.csv";
            break;
        case "supp_C":
            modul._currentcolor="csv/color_4.csv";
            break;
        default:
    }
}
function create_supp_category_modulvariable(queryObject){
    var deptlist=[];
    var supplierlist=[];
    var categorylist=[];
    var year;

    //dept
    for (var i=0;i<queryObject.depts.length;i++)
        deptlist[i]=queryObject.depts[i];

    //supplier
    for (var i=0;i<queryObject.supplier.length;i++)
        supplierlist[i]=queryObject.supplier[i];

    //cateogry
    for (var i=0;i<queryObject.cat.length;i++)
        categorylist[i]=queryObject.cat[i];

    //year
    year=queryObject.year.substr(0,4);

    //fill in modulvariable
    modul._currentdepList=deptlist;
    modul._currentsupplierList=supplierlist;
    modul._currentcategoryList=categorylist;
    modul._currentYear=year;
}




