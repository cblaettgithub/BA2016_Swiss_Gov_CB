/**
 * Created by chris on 21.10.2016.
 */

modul =   require('./Modul');

module.exports={
    readcsv:readcsv,
    delayedHello:delayedHello
}

function readcsv(data, matrix, data_B)  {
    var supplier;
    switch (modul._currentcsv){
        case "csv/EDI - 2011.csv":
        case "csv/EDI - 2012.csv":
        case "csv/EDI - 2013.csv":
        case "csv/EDI - 2014.csv":
            modul._ds_supplier_EDI= getSupplier_EDI(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDI(modul._ds_supplier_EDI, 10);
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2012.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            break;
        case "csv/Dummy_EDA.csv":
            var dummyEDA=getDummy_EDA(data, "supplier");
            var dummyEDI=getDummy_EDI(data_B, "supplier");
            modul._ds_supplier = matrix_dummy(dummyEDA,dummyEDI);
        default:
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
    supplier.push("1")
    supplier.push("2")
    supplier.push("3")
    supplier.push("4")

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

