/**
 * Created by chris on 21.10.2016.
 */

modul =   require('./Modul');

module.exports={
    readcsv:readcsv
}

function readcsv(data, matrix, data_B)  {
    console.log("readcsv");
    var supplier;
    var csvall;
    switch (modul._currentcsv){
        case "csv/EDA - 2011.csv"://EDA 2011, EDI 2011
        case "csv/EDA - 2012.csv"://EDA 2012, EDI 2011
        case "csv/EDA - 2013.csv"://EDA 2013, EDI 2011
        case "csv/EDA - 2014.csv"://EDA 2014, EDI 2011
            data =filter(data);
            data_B =filter(data_B);
            modul._ds_supplier_EDA= getDummy_EDA(data, "supplier");
            modul._ds_supplier_EDI= getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA,modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI");
            break;
        case "csv/BK - 2011.csv"://EDA 2011, EDI 2011
        case "csv/BK - 2012.csv"://EDA 2012, EDI 2011
        case "csv/BK - 2013.csv"://EDA 2013, EDI 2011
        case "csv/BK - 2014.csv"://EDA 2014, EDI 2011
            data =filter(data);
            data_B =filter(data_B);
            modul._ds_supplier_EDI= getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt");
            break;
        case "csv/EDI - 2012.csv":
        case "csv/EDI - 2013.csv":
        case "csv/EDI - 2014.csv":
            modul._ds_supplier_EDI= getSupplier_EDI(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDI(modul._ds_supplier_EDI, 10);
            modul._supplier= modul._ds_supplier_EDI;
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
     return data.filter(function(row) {
        if (row["supplier"] == "AirPlus International AG"
        ||  row["supplier"] == "Schweizerische Bundesbahnen SBB")
        {
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

function matrix_EDI_EDA(DataEDI_EDA, Name_sumEDA, Name_sumEDI){
    var matrix = [];
    var counter=2;
    var supplier="";
    var minus=4000000;
    var length = DataEDI_EDA.length;
    var middle= length/2;

    //Array filtern

    for (var i=0;i<length;i++ ){
        var mrow=[];
        if (i < middle){
            for(var j=0;j<middle;j++)
                mrow.push(0);
            for(var j=0;j<middle;j++){
                if (counter %2 ==0)
                    mrow.push(d3.round(DataEDI_EDA[j].values[0].values[Name_sumEDA]));
                else
                    mrow.push(d3.round(DataEDI_EDA[j+middle].values[0].values[Name_sumEDI]));
            }
            counter++;
        }
        else{
            for(var j=0;j<middle;j++)
                if (counter %2 ==0)
                    mrow.push(d3.round(DataEDI_EDA[j].values[0].values[Name_sumEDA]));
                else
                    mrow.push(d3.round(DataEDI_EDA[j+middle].values[0].values[Name_sumEDI]));
            for(var j=0;j<middle;j++)
                mrow.push(0);

            counter++;
        }
        matrix.push(mrow);
    }

    modul._matrix = matrix;
    while(modul._supplier.length>0)
         modul._supplier.pop();


    //supplier
    modul._supplier.push(DataEDI_EDA[0].values[0]);
    modul._supplier.push(DataEDI_EDA[2].values[0]);
    modul._supplier.push(DataEDI_EDA[2]);
    modul._supplier.push(DataEDI_EDA[3]);

    console.log("matrix_DummyALL");
    return supplier;
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
    var results = [];
    var output;
    for (var i = 0; i < 2; i++) {
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



