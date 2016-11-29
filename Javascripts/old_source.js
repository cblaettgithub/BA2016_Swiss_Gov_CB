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
}




