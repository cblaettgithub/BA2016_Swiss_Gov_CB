function matrix_dummy(dataEDA, dataEDI){
    //Fill Matrix EDA
    var matrix = [];
    var counter=0;
    var supplier;

    dataEDA.forEach(function(row){
        dataEDI.push(row);
    })

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

    modul._matrix = matrix;
    /*modul._supplier=dataEDA;
     dataEDI.forEach(function(row){
     modul._supplier.push(row)
     })*/
    //2. version
    modul._supplier.pop();
    modul._supplier.pop();

    var i=0;
    var k=0;
    for (var j=0;j<2;j++){
        getValueEDI_EDA(dataEDI[j]);
        k=j;
        if (j==1){k=0;}
        getValueEDI_EDA(dataEDA[k]);
    }

    function getValueEDI_EDA(row){
        modul._supplier.push(row);
        if (i == 0 || i == 1){
            modul._supplier[i].key=row.values[0].key;//dept
            i++;
        }

    }
    /* supplier.forEach(function(row){
     modul._supplier[i].supplier=row;
     });*/
    console.log("matrix_Dummy");
    return supplier;
}

function matrix_dummay_All(DataEDI_EDA){
    //ersten zwei Rows EDA
    //nachfolgenden Rows EDI

    //Fill Matrix EDA
    var matrix = [];
    var counter=0;
    var supplier="";
    var minus=4000000;

    for (var i=0; i<4; i++){
        var mrow = [];
        if (i==0){
            mrow.push(0); mrow.push(0);
            mrow.push(d3.round(DataEDI_EDA[0].values[0].values["sumEDA"]));
            mrow.push(d3.round(DataEDI_EDA[1].values[0].values["sumEDA"]));
        }
        else if(i==1){
            mrow.push(0); mrow.push(0);
            mrow.push(d3.round(DataEDI_EDA[2].values[0].values["sumEDI"]));
            mrow.push(d3.round(DataEDI_EDA[3].values[0].values["sumEDI"]));
        }
        else if(i==2){
            mrow.push(d3.round(DataEDI_EDA[0].values[0].values["sumEDA"]));
            mrow.push(d3.round(DataEDI_EDA[1].values[0].values["sumEDA"]));
            mrow.push(0); mrow.push(0);
        }
        else if(i==3){
            mrow.push(d3.round(DataEDI_EDA[2].values[0].values["sumEDI"]));
            mrow.push(d3.round(DataEDI_EDA[3].values[0].values["sumEDI"]));
            mrow.push(0); mrow.push(0);
        }
        matrix.push(mrow);
    }

    modul._matrix = matrix;
    modul._supplier.pop();
    modul._supplier.pop();

    //supplier
    modul._supplier.push(DataEDI_EDA[0].values[0]);
    modul._supplier.push(DataEDI_EDA[2].values[0]);
    modul._supplier.push(DataEDI_EDA[2]);
    modul._supplier.push(DataEDI_EDA[3]);

    console.log("matrix_DummyALL");
    return supplier;
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
function getSupplier_EJPD(csv, name) {
    var nested_data = d3.nest()
        .key(function(d) { return d.supplier; })
        .rollup(function(v) { return{
            sumBFM: d3.sum(v, function(d) { return d["ISC-EJPD"]+d["ESBK"]+d["GS-EJPD"]+d["BJ"]
                +d["fedpol"]+d["SIR"]+d["METAS"]+d["BFM"]; })
        };})
        .entries(csv);
    console.log("getSupplier_EJPD");
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
};

var server = http.createServer(request, response)
{
     var queryData = url.parse(request.url, true).query;
     response.writeHead(200, {"Content-Type": "text/plain"});
     if (queryData.name) {
     // user told us their name in the GET request, ex: http://host:8000/?name=Tom
     response.end('Hello ' + queryData.name + '\n');
     } else {
         response.end("Hello World\n");
     }
 };

 d3.request("/path/to/resource")
 .header("X-Requested-With", "XMLHttpRequest")
 .header("Content-Type", "application/x-www-form-urlencoded")
 .post("a=2&b=3", callback);

var http = require('http'),
 queryString = require('querystring');
 http.createServer(function (oRequest, oResponse) {
 var oQueryParams;
 // get query params as object
 if (oRequest.url.indexOf('?') >= 0) {
 oQueryParams = queryString.parse(oRequest.url.replace(/^.*\?/, ''));
 // do stuff
 console.log(oQueryParams);
 }

 oResponse.writeHead(200, {'Content-Type': 'text/plain'});
 oResponse.end('Hello world.');

 }).listen(1337, '127.0.0.1');

var url1 = new URL('http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_01.html');
 var parsed =parse('http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_01.html');

d3.request(parsed)
 .header("Accept-Language", "en-US")
 .header("X-Requested-With", "XMLHttpRequest")
 .get(callback);

d3.request(myurl)
 .header("X-Requested-With", "XMLHttpRequest")
 .header("Content-Type", "application/x-www-form-urlencoded")
 .post("a=2&b=3", callback);
 function callback(){};

d3.html("http:www.bluewin.ch", callback());
settingCSVFiles("EDA_EDI_2011");
//Request//->function ->function back<-
 d3.request(myurl)
 .header("X-Requested-With", "XMLHttpRequest")
 .header("Content-Type", "application/x-www-form-urlencoded")
 .get("?a=2&b=3", settingCSVFiles("EDA_EDI_2011"));

d3.request(myurl)
.header("X-Requested-With", "XMLHttpRequest")
 .post("choice=BK_EDI_2012", callback);

var parsed =parse(loc);
var parts=url.parse("'"+loc+"'", true);
parsed.set('hostname', 'yahoo.com');

console.log("Location "+loc);
console.log("Parsed "+parsed);
console.log("Url formats"+url.format(parts));

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


