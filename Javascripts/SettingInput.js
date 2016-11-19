/**
 * Created by chris on 21.10.2016.
 */

modul =   require('./Modul');

module.exports={
    readcsv:readcsv
}

function readcsv(data, data_B,data_C, matrix)  {
    console.log(modul._error_counter+" readcsv");
    modul._error_counter++;
    var supplier;
    var csvall;
    var filtercontent;
    console.log(modul._v_choice);
    compareCSV(data, data_B,data_C, "fullCategory");
    switch (modul._v_choice){
        case "EDA_EDI_2011"://EDA 2011, EDI 2011
        case "EDA_EDI_2012"://EDA 2012, EDI 2011
        case "EDA_EDI_2013"://EDA 2013, EDI 2011
        case "EDA_EDI_2014"://EDA 2014, EDI 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data, "supplier");
            modul._ds_supplier_EDI= getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA,modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
            break;
        case "BK_EDI_2011"://BK EDA 2011,
        case "BK_EDI_2012"://BK EDA 2012,
        case "BK_EDI_2013"://BK EDA 2013,
        case "BK_EDI_2014"://BK EDA 2014,
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDI= getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumEDA","sumBundeskanzelt"]);
            break;
        case "BK_EDA_EDI_2011"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Tri"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Tri"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Trivadis AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Hardware","SW-Pflege und HW Wartung",
            "Informatik-DL exkl. Personalverleih im Bereich IKT"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat_2"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat_2"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
                "Beratungs-DL für Management und Organisation sowie Coaching",
                "SW-Pflege und HW Wartung"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat_3"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat_3"://EDA 2014, EDI 2011, BK 2011
            filtercontent=["Postdienste","Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
                "Hardware"];
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            modul._ds_supplier=matrix_EDI_EDA(csvall, "sumEDA", "sumBundeskanzelt", ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "csv/EDA - 2011.csv":
        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            modul._supplier= modul._ds_supplier_EDA;
            break;
        case "Dummy":
            var dummyEDA=getDummy_EDA(data, "supplier");
            var dummyEDI=getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([dummyEDA, dummyEDI]);
            //modul._ds_supplier = matrix_dummay_All(csvall);
            modul._ds_supplier=matrix_EDI_EDA(csvall,"sumEDA", "sumEDI", ["sumEDA","sumEDI"]);
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
function filter(data, param, filtername){
    console.log(modul._error_counter+" filter");
    modul._error_counter++;
    if (param.length==2){
        return data.filter(function(row) {
            if (row[filtername] == param[0]
                ||  row[filtername] == param[1]
               )
            {  return row;  }
        });
    }
    else{
        return data.filter(function(row) {
            if (row[filtername] == param[0]
                ||  row[filtername] == param[1]
                ||  row[filtername] == param[2])
            {  return row;    }
        });
    }
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
        .key(function(d){return d[name]})
        .key(function(d){return d.dept})
        .rollup(function(v){return{
            sumEDI: d3.sum(v, function(d){return d["BAG"]})
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
function compareCSV(dataA, dataB, dataC, field) {
    var mrow = [];
    for (var i = 0; i < dataA.length; i++) {
        for (var j = 0; j < dataB.length; j++) {
            if (dataA[i][field] == dataB[j][field]) {
                for (var k = 0; k < dataC.length; k++) {
                    if (dataA[i][field] == dataC[k][field])
                        if (mrow.length < 3){
                            mrow.push(dataA[i][field]);
                        }
                        else{
                            if (checkexistRow(mrow, dataA[i][field]))
                                mrow.push(dataA[i][field]);
                        }
                }
            }
        }
    }
    console.log("Result:compare CSV");
    for (var i = 0; i < mrow.length; i++)
        console.log(mrow[i]);
}
function checkexistRow(mrow, onerow){
    /*if (mrow.length>2)
     if (checkexistRow(mrow, dataC[k][field]))
     mrow.push(dataA[i][field]);*/
    var check=true;
   if (mrow.length > 1){
       for(var i=0;i<mrow.length;i++){
           if (mrow[i]==onerow){
               check=false;
           }
       }
   }
    return check;
}

function matrix_EDI_EDA(DataEDI_EDA, Name_sumEDA, Name_sumEDI, Names_sumsEDA_EDI_BK){
    console.log(modul._error_counter+" matrix_EDI_EDA files");
    modul._error_counter++;
    var matrix = [];
    var supplier="";
    var minus=4000000;
    var length = DataEDI_EDA.length;
    var totallength = (length/(Names_sumsEDA_EDI_BK.length))*2;
    var middle= d3.round(length/Names_sumsEDA_EDI_BK.length);
    var vobjectid=0;

    //Array filtern
    for (var i=0;i<totallength;i++ ){
        var mrow=[];
        if (i==middle)
            vobjectid=0;
        if (i < middle){
            for(var j=0;j<middle;j++)
                mrow.push(0);
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid ));
                vobjectid++;
            }
        }
        else{
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid));
                vobjectid++;
            }
            for(var j=0;j<middle;j++)
                mrow.push(0);
        }
        matrix.push(mrow);
    }
    modul._matrix = matrix;
    while(modul._supplier.length > 0)
         modul._supplier.pop();
    createSupplierList(DataEDI_EDA,Names_sumsEDA_EDI_BK );

    console.log("matrix_DummyALL");
    return supplier;
}

function createSupplierList(dataRows, supplier_field){
    console.log(modul._error_counter+" createSupplierList");
    modul._error_counter++;
    var v_Supplier=supplier_field.length;
    var i=0;
    var end=v_Supplier*2;
    console.log("createSupplierList:"+end);

    //first dept
    if (end==4){
        while( i<end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
    }
    else if (end==6){
        while( i<=end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
    }

    //second supplier
    for (var i=0;i<v_Supplier; i++)
        modul._supplier.push("Exists supplier:"+dataRows[i])
    console.log("createSupplierList");
}

function getMatrixValue(row,nameValue, counter){
    var depName;    //get Fieldname summ of each Department
    if (nameValue.length==2) {
        switch (counter) {//2 Supplier
            case 0:
            case 1:
                depName = nameValue[0];
                break;
            case 2:
            case 3:
                depName = nameValue[1];
                break;
            default:
        }
    }
      else if (nameValue.length==3){
            switch(counter){//3 Supplier
                case 0:
                case 1:
                case 2:
                    depName=nameValue[0];
                    break;
                case 3:
                case 4:
                case 5:
                    depName=nameValue[1];
                    break;
                case 6:
                case 7:
                case 8:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
        else if(nameValue.length==4)        {
            switch(counter){//4 Supplier
                case 0:
                case 1:
                case 2:
                case 3:
                    depName=nameValue[0];
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                    depName=nameValue[1];
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                    depName=nameValue[2];
                    break;
                case 10:
                case 11:
                case 12:
                case 13:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
       return d3.round(row.values[0].values[depName]);
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
    console.log("merging files");
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
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
