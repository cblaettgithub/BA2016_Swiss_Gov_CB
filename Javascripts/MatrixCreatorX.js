/**
 * Created by chris on 09.12.2016.
 */

modul =   require('./Modul');

module.exports={
    matrix_Creator:matrix_Creator
};

function matrix_Creator(DataEDI_EDA, DataEDI_EDA_Sort, Names_sumsEDA_EDI_BK){
    console.log(modul._error_counter+" matrix_Creator files");
    modul._error_counter++;
    var matrix = [];
    var supplier="";
    var minus=4000000;
    var length = DataEDI_EDA.length;
    var totallength = (length/(Names_sumsEDA_EDI_BK.length))*2;
    var middle= d3.round(length/Names_sumsEDA_EDI_BK.length);
    var vobjectid=0;

    if (Names_sumsEDA_EDI_BK.length==8){
        totallength=16;
        middle=totallength/2;
    };
    if (Names_sumsEDA_EDI_BK.length==7){
        totallength=14;
        middle=totallength/2;
    };
    if (Names_sumsEDA_EDI_BK.length==6){
        totallength=12;
        middle=totallength/2;
    };
    if (Names_sumsEDA_EDI_BK.length==5){
        totallength=10;
        middle=totallength/2;
    };

    if (Names_sumsEDA_EDI_BK.length==1){
        totallength=4;
        middle=totallength/2;
    };

    for (var i=0;i<totallength;i++ ){
        var mrow=[];
        if (i==middle)
            vobjectid=0;
        if (i < middle){
            for(var j=0;j<middle;j++)
                mrow.push(0);
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA[vobjectid],Names_sumsEDA_EDI_BK,vobjectid, true ));
                vobjectid++;
            }
        }
        else{
            for(var j=0;j<middle;j++){
                mrow.push(getMatrixValue(DataEDI_EDA_Sort[vobjectid],Names_sumsEDA_EDI_BK,vobjectid, false));
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

    console.log(modul._error_counter+" matrix_Creator");
    modul._error_counter++;
    //return supplier;
}

function compareCSV(dataA, dataB, dataC,dataD, field) {
    var mrow = [];
    for (var i = 0; i < dataA.length; i++) {
        for (var j = 0; j < dataB.length; j++) {
            if (dataA[i][field] == dataB[j][field]) {
                for (var k = 0; k < dataC.length; k++) {
                    if (dataA[i][field] == dataC[k][field])
                        for (var l = 0; l < dataD.length; l++) {
                            if (dataA[i][field] == dataD[l][field]){
                                if (mrow.length < 4){
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
        }
    }
    console.log("***********Result:compare CSV");
    console.log("***********"+field);
    for (var i = 0; i < mrow.length; i++)
        console.log(mrow[i]);
}

function getMatrixValue(row,nameValue, counter, dep_sup){
    var depName;    //get Fieldname sum of each Department
    var result=0;
    if (nameValue.length==2) {
        if (dep_sup){
            switch (counter) {//dept
                case 0: case 1:
                    depName = nameValue[0];
                    break;
                case 2:case 3:
                    depName = nameValue[1];
                    break;
                default:
            }
        }
        else{ //untere Reihe
            switch (counter) {//supplier
                case 0:
                    depName = nameValue[0];
                    break;
                case 1:
                    depName = nameValue[1];
                    break;
                case 2:
                    depName = nameValue[0];
                    break;
                case 3:
                    depName = nameValue[1];
                    break;
                default:
            }
        }
    }
    else if (nameValue.length==3){
        if (dep_sup){
            switch(counter){//3 Supplier
                case 0: case 1:  case 2:
                    depName=nameValue[0];
                    break;
                case 3:case 4: case 5:
                    depName=nameValue[1];
                    break;
                case 6: case 7: case 8:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
        else{
            switch(counter){//3 Supplier
                case 0:
                    depName=nameValue[0];
                    break;
                case 1:
                    depName=nameValue[1];
                    break;
                case 2:
                    depName=nameValue[2];
                    break;
                case 3:
                    depName=nameValue[0];
                    break;
                case 4:
                    depName=nameValue[1];
                    break;
                case 5:
                    depName=nameValue[2];
                    break;
                case 6:
                    depName=nameValue[0];
                    break;
                case 7:
                    depName=nameValue[1];
                    break;
                case 8:
                    depName=nameValue[2];
                    break;
                default:
            }
        }
    }
    else if(nameValue.length==4)        {
        switch(counter){//4 Supplier
            case 0: case 1: case 2: case 3:
                depName=nameValue[0];
                break;
            case 4: case 5: case 6: case 7:
                depName=nameValue[1];
                break;
            case 8:  case 9: case 10: case 11:
                depName=nameValue[2];
                break;
            case 12:case 13:  case 14:  case 15:
                depName=nameValue[3];
                break;
            default:
        }
    }
    else if(nameValue.length==5)        {

        if (counter <5){
            depName=nameValue[0];
        }
        else if (counter < 10){
            depName=nameValue[1];
        }
        else if (counter < 15){
            depName=nameValue[2];
        }
        else if (counter < 20){
            depName=nameValue[3];
        }
        else  {
            depName=nameValue[4];
        }
    }
    else if(nameValue.length==6) {

        if (counter <6){
            depName=nameValue[0];
        }
        else if (counter < 12){
            depName=nameValue[1];
        }
        else if (counter < 18){
            depName=nameValue[2];
        }
        else if (counter < 24){
            depName=nameValue[3];
        }
        else if (counter < 30){
            depName=nameValue[4];
        }
        else {
            depName=nameValue[5];
        }
    }
    else if(nameValue.length==7)  {

        if (counter <7){
            depName=nameValue[0];
        }
        else if (counter < 14){
            depName=nameValue[1];
        }
        else if (counter < 21){
            depName=nameValue[2];
        }
        else if (counter < 28){
            depName=nameValue[3];
        }
        else if (counter < 35){
            depName=nameValue[4];
        }
        else if (counter < 42){
            depName=nameValue[5];
        }
        else {
            depName=nameValue[6];
        }

    }
    else if (nameValue.length==8){

        if (counter <8){
            depName=nameValue[0];
        }
        else if (counter < 16){
            depName=nameValue[1];
        }
        else if (counter < 24){
            depName=nameValue[2];
        }
        else if (counter < 32){
            depName=nameValue[3];
        }
        else if (counter < 40){
            depName=nameValue[4];
        }
        else if (counter < 48){
            depName=nameValue[5];
        }
        else if (counter < 56){
            depName=nameValue[6];
        }
        else{
            depName=nameValue[7];
        }
    }
    else if (nameValue.length==1){
        depName=nameValue[0];
    }

    if (row.values[0].key!="null"){
        setMaxNumber(d3.round(row.values[0].value[depName]));
        result=d3.round(row.values[0].value[depName]);
    }
    return result;
}
function createSupplierList(dataRows, supplier_field){
    console.log(modul._error_counter+" createSupplierList");
    modul._error_counter++;
    var v_Supplier=supplier_field.length;
    console.log("creatsupplier+ anzahl supplier:"+v_Supplier);
    var i=0;
    var end;

    if (v_Supplier==1){
        end=2;
        for(var i=0;i<end;i++)
            modul._supplier.push(dataRows[i].values[0]);
        for(var i=0;i<end;i++)
            modul._supplier.push(dataRows[i]);
    }
    if (v_Supplier==3){
        //end=v_Supplier*3;
        supplierlabel();
    }

    if (v_Supplier==4){
        //end=v_Supplier*3;
        supplierlabel();
    }
    else if   (modul._countDep==5){
        supplierlabel();
    }
    else{
        end=v_Supplier*2;
    }
    console.log("createSupplierList:"+end);

    //first dept
    if (end==4){
        while( i<end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;//+4
        }
        //second supplier
        for (var i=0;i<v_Supplier; i++){
            modul._supplier.push(dataRows[i]);
        }
    }
    else if (end==6 || end==12){
        while( i<=end){
            modul._supplier.push(dataRows[i].values[0]);
            i=i+v_Supplier;
        }
        //second supplier
        for (var i=0;i<v_Supplier; i++){
            modul._supplier.push(dataRows[i]);
        }
    }
    else{//test
        supplierlabel();
    }

    //8 depte
    console.log(modul._error_counter+" createSupplierList "+"supplier");
    modul._error_counter++;
}

function supplierlabel(){
    console.log("supplierlabel");
    var elements;
    var dept=modul._filterFullCategory;//ändern auf fillFullDept
    filtercontent=modul._filterSupplier;

    //dept
    console.log("supplierlabel:dept");
    for (var i=0;i< filtercontent.length;i++){
        elements={"key":dept[i].substr(0,15), "values":[dept[i], 20]};
        modul._supplier.push(elements);
    };

    //supplier
    console.log("supplierlabel:supplier");
    for (var i=0;i< filtercontent.length;i++){
        elements={"key":filtercontent[i].substr(0,15), "values":[dept[i], 20]};
        modul._supplier.push(elements);
    }

}
function setMaxNumber(currentValue){
    if (currentValue > modul._maxnumber)
        modul._maxnumber=currentValue;
}
