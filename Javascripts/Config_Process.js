/**
 * Created by chris on 09.12.2016.
 */

modul =   require('./Modul');
DataManager = require('./DataManager');
MatrixCreatorX =require('./MatrixCreatorX');
var d3 = require("d3");

module.exports={
    readcsv:readcsv
};

var csvall;
var csvsort;
var filtercontent;
var filtercontentB;
var ds_supplier_x=[];
var choicecatarray=[];
var supplierarray=[];
var column_name="idSupplier";

function readcsv(data, data_B,data_C,data_D,data_E, data_F,data_G,
                 data_H ,matrix, choicesupplier, choiceCat){
    console.log(modul._error_counter + " readcsv");
    modul._error_counter++;
    var supplier;
    /*var csvall;
    var csvsort;
    var filtercontent;
    var filtercontentB;*/
    //var ds_supplier_x=[];

    //setSupplierCat("supp_B", 10);
    console.log(modul._choiceData);
    console.log("readcsv:datas:"+data.length+" :"+data_B.length+" :"+data_C.length+" :"+data_D.length+" :"+
    data_E.length+" :"+data_F.length+" :"+data_G.length+" :"+data_H.length+" :");

    var JSONData ={
        "name":"mapping",
        "cat":
        {
            "18.4":     "Informationsarbeit",
            "18.2":        "Informatik-DL exkl. Personalverleih im Bereich IKT",
            "15.1":         "Hardware",
            "14.1":     "Postdienste",
            "18.3":      "Beratungs-DL fÃ¼r Management und Organisation sowie Coaching",
            "15.2":      "Software inkl. Lizenzen",
            "5"   :        "Medizinische Produkte und Pharmabereich",
            "15.3":     "Telekommunikation",
            "18.1":      "Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare"
        }
    };

    var JsonDataSupplier={
        "name":"mapping",
        "supp":
            {
            "481426823": "Schweiz. Depeschenagentur AG",
            "484457734":"Trivadis AG",
            "480822068": "Fabasoft CH Software AG",
            "485486377": "Ecoplan AG",
            "480683648": "Schweizerische Bundesbahnen SBB",
            "487360646": "FS Communications GmbH Satellitenkommunikation",
            "480907146": "Victorinox AG",
            "480580922": "SRG SSR idÃ©e suisse Media Services"
            }
    };

    //test
    var supplier = [
        "Schweiz. Depeschenagentur AG",
        "Trivadis AG",
        "Fabasoft CH Software AG",
        "Ecoplan AG",
        "Schweizerische Bundesbahnen SBB",
        "GFS.Bern Forsch.Politik Kommunikation+Gesellsch.",
        "Stoupa & Partners AG Beratungsgesellschaft Betriebswi",
        "SRG SSR idÃ©e suisse Media Services"
    ];
    //chord main
    if (modul._v_choice=="chord_main"){
        for (var i=0;i<modul._currentcategoryList.length;i++){
            choicecatarray[i]=JSONData.cat[modul._currentcategoryList[i]];
            console.log(choicecatarray[i]);
        }
        for (var i=0;i<modul._currentsupplierList.length;i++){
            supplierarray[i]=JsonDataSupplier.supp[modul._currentsupplierList[i]];
            console.log( supplierarray[i]);
        }
        filtercontent=supplierarray;// selectedsupplier
    }//chord 02
    else{
        //old version für chord02
        filtercontent=choicesupplier[modul._choiceData].value;// selectedsupplier
        modul._filterSupplier=filtercontent;//filtersupplier notwendig später im modul matrix
        filtercontentB=choiceCat[modul._choiceData_Cat].value; //selectedcategories
    }
    switch (modul._v_choice){
        case "EDA_EDI_2011"://EDA 2011, EDI 2011
        case "EDA_EDI_2012"://EDA 2012, EDI 2011
        case "EDA_EDI_2013"://EDA 2013, EDI 2011
        case "EDA_EDI_2014"://EDA 2014, EDI 2011
            modul._choiceData="supp_B";//offen Aenderungen
            filtercontent=choicesupplier[modul._choiceData].value;
            filtercontent=filtercontent.slice(0,2);
            console.log("*******************EDA_EDI:länge:"+filtercontent.length);
            data =filter(data,filtercontent, "supplier");//EDA
            data_B =filter(data_B,filtercontent, "supplier");//EDI
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA,modul._ds_supplier_EDI]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvsort,["sumEDA","sumEDI"]);
            break;
        case "BK_EDI_2011"://BK EDA 2011,
        case "BK_EDI_2012"://BK EDA 2012,
        case "BK_EDI_2013"://BK EDA 2013,
        case "BK_EDI_2014"://BK EDA 2014,
            modul._choiceData="supp_B";//offen Aenderungen
            filtercontent=choicesupplier[modul._choiceData].value;
            filtercontent=filtercontent.slice(0,2);
            data =filter(data,filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            csvall=mergingFiles([modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvsort, ["sumEDA","sumBundeskanzelt"]);
            break;
        case "BK_EDA_EDI_2011"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014"://EDA 2014, EDI 2011, BK 2011
            modul._choiceData="supp_B";//offen Aenderungen
            filtercontent=choicesupplier[modul._choiceData].value;
            filtercontent=filtercontent.slice(0,3);
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvsort, ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            modul._choiceData_Cat="category_B";
            filtercontent=choiceCat[modul._choiceData_Cat].value;
            filtercontent=filtercontent.slice(0,3);
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvsort, ["sumBundeskanzelt","sumEDA","sumEDI"]);
            break;
        case "BK_EDA_EDI_EJPD_2011_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2012_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2013_Cat"://EDA 2014, EDI 2011, BK 2011
        case "BK_EDA_EDI_EJPD_2014_Cat"://EDA 2014, EDI 2011, BK 2011
            modul._choiceData_Cat="category_D";
            filtercontent=choiceCat[modul._choiceData_Cat].value; //jedes data ein departement, mindesten 4 pro dept
            filtercontent=filtercontent.slice(0,4);
            console.log("**************output:"+filtercontent.length);
            data =filter(data, filtercontent, "fullCategory");
            data_B =filter(data_B,filtercontent, "fullCategory");
            data_C =filter(data_C,filtercontent, "fullCategory");
            data_D =filter(data_D,filtercontent, "fullCategory");
            console.log("filter created");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_D, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI,modul._ds_supplier_EJPD]);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumEDA","sumEDI", "sumBFM"]);
            break;//neu
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2012":
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2013":
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2014":
            modul._countDep=7;
            modul._filterSupplier=filtercontent.slice(0, 8);
            filtercontent=filtercontent.slice(0, 8);
            var dept=["BK", "EDI","EDA","EFD","EJPD","UVEK","VBS", "WBK"];
            modul._filterFullCategory=dept;//
            data =filter(data, filtercontent, column_name);
            data_B =filter(data_B,filtercontent, column_name);
            data_C =filter(data_C,filtercontent, column_name);
            data_D =filter(data_D,filtercontent, column_name);
            data_E =filter(data_E, filtercontent, column_name);
            data_F=filter(data_F,filtercontent, column_name);
            data_G =filter(data_G,filtercontent, column_name);
            data_H =filter(data_H,filtercontent, column_name);
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, column_name);
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, column_name);
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, column_name);
            modul._ds_supplier_EFD= DataManager.getDummy_EFD(data_D, column_name);
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_E, column_name);
            modul._ds_supplier_UVEK= DataManager.getDummy_UVEK(data_F, column_name);
            modul._ds_supplier_VBS= DataManager.getDummy_VBS(data_G, column_name);
            modul._ds_supplier_WBF= DataManager.getDummy_WBF(data_H, column_name);
            checkCountRowsSupplier();//check if exist 8 rows per departement(matrix)
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI, modul._ds_supplier_EFD,
                modul._ds_supplier_EJPD, modul._ds_supplier_UVEK, modul._ds_supplier_VBS, modul._ds_supplier_WBF,
            ]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                "sumBFM", "sumUVEK", "sumVBS", "sumWBF"]);
            break;
            //7 elements
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_2011":
            modul._countDep=6;
            console.log("7 elemente");
            modul._filterSupplier=filtercontent.slice(0, 7);
            filtercontent=filtercontent.slice(0, 7);
            console.log("elemente:"+ modul._filterSupplier.length);
            var dept=["BK", "EDI","EDA","EFD","EJPD","UVEK","VBS"];
            modul._filterFullCategory=dept;
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            data_D =filter(data_D,filtercontent, "supplier");
            data_E =filter(data_E, filtercontent, "supplier");
            data_F=filter(data_F,filtercontent, "supplier");
            data_G =filter(data_G,filtercontent, "supplier");
            data_H =filter(data_H,filtercontent, "supplier");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            modul._ds_supplier_EFD= DataManager.getDummy_EFD(data_D, "supplier");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_E, "supplier");
            modul._ds_supplier_UVEK= DataManager.getDummy_UVEK(data_F, "supplier");
            modul._ds_supplier_VBS= DataManager.getDummy_VBS(data_G, "supplier");
            modul._ds_supplier_WBF= DataManager.getDummy_WBF(data_H, "supplier");
            checkCountRowsSupplier();//check if exist 8 rows per departement(matrix)
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI, modul._ds_supplier_EFD,
                modul._ds_supplier_EJPD, modul._ds_supplier_UVEK, modul._ds_supplier_VBS
            ]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                "sumBFM", "sumUVEK", "sumVBS"]);
            break;
        //6 elements
        case "BK_EDA_EDI_EFD_EJPD_UVEK_2011":
            modul._countDep=5;
            modul._filterSupplier=filtercontent.slice(0, 6);
            filtercontent=filtercontent.slice(0, 6);
            var dept=["BK", "EDI","EDA","EFD","EJPD","UVEK"];
            modul._filterFullCategory=dept;
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            data_D =filter(data_D,filtercontent, "supplier");
            data_E =filter(data_E, filtercontent, "supplier");
            data_F=filter(data_F,filtercontent, "supplier");
            data_G =filter(data_G,filtercontent, "supplier");
            data_H =filter(data_H,filtercontent, "supplier");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            modul._ds_supplier_EFD= DataManager.getDummy_EFD(data_D, "supplier");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_E, "supplier");
            modul._ds_supplier_UVEK= DataManager.getDummy_UVEK(data_F, "supplier");
            modul._ds_supplier_VBS= DataManager.getDummy_VBS(data_G, "supplier");
            modul._ds_supplier_WBF= DataManager.getDummy_WBF(data_H, "supplier");
            checkCountRowsSupplier();//check if exist 8 rows per departement(matrix)
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI, modul._ds_supplier_EFD,
                modul._ds_supplier_EJPD, modul._ds_supplier_UVEK,
            ]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                "sumBFM", "sumUVEK"]);
            break;
        //5 elements
        case "BK_EDA_EDI_EFD_EJPD_2011":
            modul._countDep=4;
            modul._filterSupplier=filtercontent.slice(0, 5);
            filtercontent=filtercontent.slice(0, 5);
            var dept=["BK", "EDI","EDA","EFD","EJPD"];
            modul._filterFullCategory=dept;
            data =filter(data, filtercontent, "supplier");
            data_B =filter(data_B,filtercontent, "supplier");
            data_C =filter(data_C,filtercontent, "supplier");
            data_D =filter(data_D,filtercontent, "supplier");
            data_E =filter(data_E, filtercontent, "supplier");
            data_F=filter(data_F,filtercontent, "supplier");
            data_G =filter(data_G,filtercontent, "supplier");
            data_H =filter(data_H,filtercontent, "supplier");
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "supplier");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "supplier");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "supplier");
            modul._ds_supplier_EFD= DataManager.getDummy_EFD(data_D, "supplier");
            modul._ds_supplier_EJPD= DataManager.getDummy_EJPD(data_E, "supplier");
            modul._ds_supplier_UVEK= DataManager.getDummy_UVEK(data_F, "supplier");
            modul._ds_supplier_VBS= DataManager.getDummy_VBS(data_G, "supplier");
            modul._ds_supplier_WBF= DataManager.getDummy_WBF(data_H, "supplier");
            checkCountRowsSupplier();//check if exist 8 rows per departement(matrix)
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI, modul._ds_supplier_EFD,
                modul._ds_supplier_EJPD
            ]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                "sumBFM"]);
            break;
        case "csv/EDA - 2011.csv":        case "csv/EDA - 2013.csv":
        case "csv/EDA - 2014.csv":
            modul._ds_supplier_EDA= DataManager.getSupplier_EDA(modul._supplier, "supplier");
            supplier = matrix_Supplier_EDA(modul._ds_supplier_EDA, 4);
            modul._supplier= modul._ds_supplier_EDA;
            break;
        case "Dummy":
            var dummyEDA=DataManager.getDummy_EDA(data, "supplier");
            var dummyEDI=DataManager.getDummy_EDI(data_B, "supplier");
            csvall=mergingFiles([dummyEDA, dummyEDI]);
            //modul._ds_supplier = matrix_dummay_All(csvall);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,["sumEDA","sumEDI"]);
            break;
        case "BK_BK_2011":        case "BK_BK_2012":
        case "BK_BK_2013":        case "BK_BK_2014":
             console.log("BK_BK:"+modul._choiceData_Cat);
            modul._filterFullCategory=filtercontentB;
            for (var i=0;i<8;i++){
                ds_supplier_x[i] =filterC(data, filtercontent[i], "supplier",filtercontentB, "fullCategory");
                ds_supplier_x[i]=DataManager.getDummy_BK(ds_supplier_x[i], "supplier");
                ds_supplier_x[i]=checkcountRows(8, ds_supplier_x[i] );
            }
            csvall=mergingFiles( ds_supplier_x);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumBundeskanzelt",
                "sumBundeskanzelt","sumBundeskanzelt","sumBundeskanzelt","sumBundeskanzelt",
                "sumBundeskanzelt","sumBundeskanzelt"]);
            break;
        case "EDA_EDA_2011":        case "EDA_EDA_2012":
        case "EDA_EDA_2013":        case "EDA_EDA_2014":
            modul._filterFullCategory=filtercontentB;
            for (var i=0;i<8;i++){
                ds_supplier_x[i] =filterC(data, filtercontent[i], "supplier",filtercontentB, "fullCategory");
                ds_supplier_x[i]=DataManager.getDummy_EDA(ds_supplier_x[i], "supplier");
                ds_supplier_x[i]=checkcountRows(8, ds_supplier_x[i] );
            }
            csvall=mergingFiles( ds_supplier_x);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumEDA","sumEDA",
                "sumEDA","sumEDA","sumEDA","sumEDA",
                "sumEDA","sumEDA"]);
        break;
        case "EDI_EDI_2011":        case "EDI_EDI_2012":
        case "EDI_EDI_2013":        case "EDI_EDI_2014":
            modul._filterFullCategory=filtercontentB;
            for (var i=0;i<8;i++){
                ds_supplier_x[i] =filterC(data, filtercontent[i], "supplier",filtercontentB, "fullCategory");
                ds_supplier_x[i]=DataManager.getDummy_EDI(ds_supplier_x[i], "supplier");
                ds_supplier_x[i]=checkcountRows(8, ds_supplier_x[i] );
            }
            csvall=mergingFiles( ds_supplier_x);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumEDI","sumEDI",
                "sumEDI","sumEDI","sumEDI","sumEDI",
                "sumEDI","sumEDI"]);
            break;
        case "EFD_EFD_2011":        case "EFD_EFD_2012":
        case "EFD_EFD_2013":        case "EFD_EFD_2014":
            console.log("----EFD");
            modul._filterFullCategory=filtercontentB;
            for (var i=0;i<8;i++){
                ds_supplier_x[i] =filterC(data, filtercontent[i], "supplier",filtercontentB, "fullCategory");
                ds_supplier_x[i]=DataManager.getDummy_EFD(ds_supplier_x[i], "supplier");
                ds_supplier_x[i]=checkcountRows(8, ds_supplier_x[i] );
            }
            csvall=mergingFiles( ds_supplier_x);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumEFD","sumEFD",
                "sumEFD","sumEFD","sumEFD","sumEFD",
                "sumEFD","sumEFD"]);
            console.log("EFD-----");
        break;
        case "EJPD_EJPD_2011":        case "EJPD_EJPD_2012":
        case "EJPD_EJPD_2013":        case "EJPD_EJPD_2014":
            console.log("----EJPD");
            modul._filterFullCategory=filtercontentB;
            for (var i=0;i<8;i++){
                ds_supplier_x[i] =filterC(data, filtercontent[i], "supplier",filtercontentB, "fullCategory");
                ds_supplier_x[i]=DataManager.getDummy_EJPD(ds_supplier_x[i], "supplier");
                ds_supplier_x[i]=checkcountRows(8, ds_supplier_x[i] );
            }
            csvall=mergingFiles( ds_supplier_x);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBFM","sumBFM",
                "sumBFM","sumBFM","sumBFM","sumBFM",
                "sumBFM","sumBFM"]);
            console.log("sumBFM-----");
        break;
        case "Dept_dynamic":
            dynam_chordmaker_2(["BK", "EDI","EDA","EFD","EJPD","UVEK","VBS", "WBK"], "", "",
            2015, [data, data_B, data_C, data_D, data_E, data_F, data_G, data_H]);
            break;
        case "chord_main":
            dynam_chordmaker(modul._currentdepList, modul._currentsupplierList, modul._currentcategoryList,
                2015, [data, data_B, data_C, data_D, data_E, data_F, data_G, data_H]);
            break;

        default:
    }
}
//dynamically making chords
//for chord main
function dynam_chordmaker(array_dept, supplier_choose, category_choose, year, array_data){

    var array_length=array_dept.length;
    var arraycolumns=[];
    var array_content=[];
    console.log("dynam:array.lengt:"+array_length);
    modul._ds_supplier_all=[];
    modul._countDep=array_length-1;


    //one departement, all supplier, all categories
    if (array_length < 4){
        modul._filterSupplier=supplier_choose.slice(0, array_length);
        filtercontent=supplier_choose.slice(0, array_length);
        modul._filterFullCategory=array_dept;//
        var dataDept;
        var countsupplier=supplier_choose.length;

        switch(array_dept[0])
        {
            case "BK":
                dataDept=array_data[0]; //aus dem Array gemäss Auswahl Departement das korrekt Arrayelement holen, A, B,C..
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumBundeskanzelt";
                break;
            case "EDA":
                dataDept=array_data[1];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumEDA";
                break;
            case "EDI":
                dataDept=array_data[2];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumEDI";
                break;
            case "EFD":
                dataDept=array_data[3];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumEFD";
                break;
            case "EJPD":
                dataDept=array_data[4];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumBFM";
                break;
            case "UVEK":
                dataDept=array_data[5];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumUVEK";
                break;
            case "VBS":
                dataDept=array_data[6];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumVBS";
                break;
            case "WBK":
                dataDept=array_data[7];
                for(var i=0;i<countsupplier;i++)
                    arraycolumns[i]="sumWBF";
                break;
        }
        modul._filterFullCategory=category_choose;
        modul._filterSupplier=supplier_choose;

        //filtering for each suppliery and all categorys filter C(Category and Suppliers)
        for (var i=0;i<countsupplier;i++){
            ds_supplier_x[i] =filterC(dataDept,  modul._filterSupplier[i], "idSupplier", modul._filterFullCategory, "idCategory");
            switch (array_dept[0])
            {
                case "BK":
                    ds_supplier_x[i]=DataManager.getDummy_BK(ds_supplier_x[i], "supplier");
                    break;
                case "EDA":
                    ds_supplier_x[i]=DataManager.getDummy_EDA(ds_supplier_x[i], "supplier");
                    break;
                case "EDI":
                    ds_supplier_x[i]=DataManager.getDummy_EDI(ds_supplier_x[i], "supplier");
                    break;
                case "EFD":
                    ds_supplier_x[i]=DataManager.getDummy_EFD(ds_supplier_x[i], "supplier");
                    break;
                case "EJPD":
                    ds_supplier_x[i]=DataManager.getDummy_EJPD(ds_supplier_x[i], "supplier");
                    break;
                case "UVEK":
                    ds_supplier_x[i]=DataManager.getDummy_UVEK(ds_supplier_x[i], "supplier");
                    break;
                case "VBS":
                    ds_supplier_x[i]=DataManager.getDummy_VBS(ds_supplier_x[i], "supplier");
                    break;
                case "WBK":
                    ds_supplier_x[i]=DataManager.getDummy_WBF(ds_supplier_x[i], "supplier");
                    break;
            }
            ds_supplier_x[i]=checkcountRows(countsupplier, ds_supplier_x[i] );
        }
        //neu für überschriften
        modul._filterFullCategory=choicecatarray;
        modul._filterSupplier=supplierarray;
        csvall=mergingFiles( ds_supplier_x);
    }
    else
        {
            console.log("current visual:"+modul._currentVisual);
        //check if for all departement supplier or categorys
        //1 filter for supplier, default categorys, using function filter(for suppliers or categorys)
        //filtercontent content the id of suppliers or categorys
        if (modul._currentVisual=='dept_sup'){
            console.log("current visual:"+modul._currentVisual);
            //columname already supplierid
            modul._filterSupplier=supplierarray;
            modul._filterFullCategory=array_dept;//
            array_data=getDatefromEachDepartement(array_content, array_dept, array_data); //Data vom richtigen Departemen
            for (var i=0;i<array_length;i++){
                array_data[i] =filter(array_data[i], supplier_choose.slice(0, array_length), column_name);//id_supplier
            }
        }
        else if (modul._currentVisual=='dept_cat'){ //1 filter for categorys
            console.log("current visual:"+modul._currentVisual);
            column_name="fullCategory";
            modul._filterSupplier=choicecatarray;
            modul._filterFullCategory=array_dept;//
            array_data=getDatefromEachDepartement(array_content, array_dept, array_data); //Data vom rich
            for (var i=0;i<array_length;i++){
                array_data[i] =filter(array_data[i], choicecatarray.slice(0, array_length), "fullCategory");
            }
        }
    //getdata
    for(var i=0;i< array_dept.length; i++){
        switch(array_dept[i]){
            case "BK":
                modul._ds_supplier_all[i]= DataManager.getDummy_BK(array_data[0], column_name);
                console.log("BK:"+ modul._ds_supplier_all[i]);
                break;
            case "EDA":
                modul._ds_supplier_all[i]= DataManager.getDummy_EDA(array_data[1], column_name);
                console.log("EDA:"+ modul._ds_supplier_all[i]);
                break;
            case "EDI":
                modul._ds_supplier_all[i]= DataManager.getDummy_EDI(array_data[2], column_name);
                console.log("EDI:"+ modul._ds_supplier_all[i]);
                break;
            case "EFD":
                modul._ds_supplier_all[i]= DataManager.getDummy_EFD(array_data[3], column_name);
                console.log("EFD:"+ modul._ds_supplier_all[i]);
                break;
            case "EJPD":
                modul._ds_supplier_all[i]= DataManager.getDummy_EJPD(array_data[4], column_name);
                console.log("EJPD:"+ modul._ds_supplier_all[i]);
                break;
            case "UVEK":
                modul._ds_supplier_all[i]= DataManager.getDummy_UVEK(array_data[5], column_name);
                console.log("UVEK:"+ modul._ds_supplier_all[i]);
                break;
            case "VBS":
                modul._ds_supplier_all[i]= DataManager.getDummy_VBS(array_data[6], column_name);
                console.log("VBS:"+ modul._ds_supplier_all[i]);
                break;
            case "WBK":
                modul._ds_supplier_all[i]= DataManager.getDummy_WBF(array_data[7], column_name);
                console.log("WBK:"+ modul._ds_supplier_all[i]);
                break;
            default:
                //push item in array
        }
    }
    console.log("dynam_chordmaker:getdata");
    //check
    checkCountRowsSupplierDynamic();//check if exist 8 rows per departement(matrix)
    //and merging

    csvall=mergingFiles(modul._ds_supplier_all);
    console.log("dynam_chordmaker:merging");
    //sorting
    //csvsort=sortingFiles(csvall, filtercontent); deaktiviert 27.12.2016
    //creating

    //Matrix Creator
    //Array of names of columsn

    for(var i=0;i<array_length;i++){
        switch(array_dept[i]){
            case "BK":
                arraycolumns[i]="sumBundeskanzelt";
                break;
            case "EDI":
                arraycolumns[i]="sumEDI";
                break;
            case "EDA":
                arraycolumns[i]="sumEDA";
                break;
            case "EFD":
                arraycolumns[i]="sumEFD";
                break;
            case "EJPD":
                arraycolumns[i]="sumBFM";
                break;
            case "UVEK":
                arraycolumns[i]="sumUVEK";
                break;
            case "VBS":
                arraycolumns[i]="sumVBS";
                break;
            case "WBK":
                arraycolumns[i]="sumWBF";
                break;
        }
        }
    }
    console.log("dynam_chordmaker:arraycolumns:length:"+arraycolumns.length);
    MatrixCreatorX.matrix_Creator(csvall,csvall, arraycolumns);
}

function getDatefromEachDepartement(array_content, array_dept, array_data){
    for(var i=0;i<array_dept.length;i++){//get the correct data for each department
        switch(array_dept[i]){
            case "BK":
                array_content[i]=array_data[0];
                break;
            case "EDA":
                array_content[i]=array_data[1];
                break;
            case "EDI":
                array_content[i]=array_data[2];
                break;
            case "EFD":
                array_content[i]=array_data[3];
                break;
            case "EJPD":
                array_content[i]=array_data[4];
                break;
            case "UVEK":
                array_content[i]=array_data[5];
                break;
            case "VBS":
                array_content[i]=array_data[6];
                break;
            case "WBK":
                array_content[i]=array_data[7];
                break;
            default:
                break;
        }
    }
    return array_content;
}

//for supplier 2016_chord_02.html
//dynamically making chords
function dynam_chordmaker_2(array_dept, supplier_choose, category_choose, year, array_data){

    var array_length=array_dept.length;
    console.log("dynam:array.lengt:"+array_length);
    modul._ds_supplier_all=[];
    modul._countDep=array_length-1;
    modul._filterSupplier=filtercontent.slice(0, 8);

    for (var i=0;i<supplier_choose.length;i++)
        console.log("output:dynam:"+modul._filterSupplier[i]);

    filtercontent=filtercontent.slice(0, 8);
      modul._filterFullCategory=array_dept;//
    for (var i=0;i<array_dept.length;i++)
        console.log("output: array_dept:"+array_dept[i]);

    //Filter
    for (var i=0;i<array_length;i++){
        array_data[i] =filter(array_data[i], filtercontent, "idsupplier");
        console.log("output:dynam:arraylengt:"+array_data[i].length);
    }

    console.log("dynam_chordmaker:Filter");

    //getdata
    for(var i=0;i< array_dept.length; i++){
        switch(array_dept[i]){
            case "BK":
                modul._ds_supplier_all[i]= DataManager.getDummy_BK(array_data[0], "supplier");
                console.log("BK:"+ modul._ds_supplier_all[i]);
                break;
            case "EDI":
                modul._ds_supplier_all[i]= DataManager.getDummy_EDI(array_data[1], "supplier");
                console.log("EDI:"+ modul._ds_supplier_all[i]);
                break;
            case "EDA":
                modul._ds_supplier_all[i]= DataManager.getDummy_EDA(array_data[2], "supplier");
                console.log("EDA:"+ modul._ds_supplier_all[i]);
                break;
            case "EFD":
                modul._ds_supplier_all[i]= DataManager.getDummy_EFD(array_data[3], "supplier");
                console.log("EFD:"+ modul._ds_supplier_all[i]);
                break;
            case "EJPD":
                modul._ds_supplier_all[i]= DataManager.getDummy_EJPD(array_data[4], "supplier");
                console.log("EJPD:"+ modul._ds_supplier_all[i]);
                break;
            case "UVEK":
                modul._ds_supplier_all[i]= DataManager.getDummy_UVEK(array_data[5], "supplier");
                console.log("UVEK:"+ modul._ds_supplier_all[i]);
                break;
            case "VBS":
                modul._ds_supplier_all[i]= DataManager.getDummy_VBS(array_data[6], "supplier");
                console.log("VBS:"+ modul._ds_supplier_all[i]);
                break;
            case "WBK":
                modul._ds_supplier_all[i]= DataManager.getDummy_WBF(array_data[7], "supplier");
                console.log("WBK:"+ modul._ds_supplier_all[i]);
                break;
            default:
            //push item in array
        }
    }
    console.log("dynam_chordmaker:getdata");

    //check
    checkCountRowsSupplierDynamic();//check if exist 8 rows per departement(matrix)

    //and merging
    //for(var i=0;i<array_length;i++){
    csvall=mergingFiles(modul._ds_supplier_all);

    console.log("dynam_chordmaker:merging");
    //sorting
    //csvsort=sortingFiles(csvall, filtercontent); deaktiviert 27.12.2016
    //creating

    //Matrix Creator
    //Array of names of columsn
    var arraycolumns=[];
    for(var i=0;i<array_length;i++){
        switch(array_dept[i]){
            case "BK":
                arraycolumns[i]="sumBundeskanzelt";
                break;
            case "EDI":
                arraycolumns[i]="sumEDI";
                break;
            case "EDA":
                arraycolumns[i]="sumEDA";
                break;
            case "EFD":
                arraycolumns[i]="sumEFD";
                break;
            case "EJPD":
                arraycolumns[i]="sumBFM";
                break;
            case "UVEK":
                arraycolumns[i]="sumUVEK";
                break;
            case "VBS":
                arraycolumns[i]="sumVBS";
                break;
            case "WBK":
                arraycolumns[i]="sumWBF";
                break;
        }
    }
    console.log("dynam_chordmaker:arraycolumns:length:"+arraycolumns.length);
    //modul._ds_supplier=
    MatrixCreatorX.matrix_Creator(csvall,csvall, arraycolumns);
}

function filter(data, param, filtername){
    console.log(modul._error_counter+" filter");
    modul._error_counter++;

    return data.filter(function(row) {
        for (var i=0;i< param.length;i++) {
            if (row[filtername]== param[i])
                return row;
        }
    });
}
function filterB(data, paramsup, filtersupplier,paramcat, filtercategory){
    return data.filter(function(row) {
        {
            for(var i=0;i<paramsup.length;i++){
                for(var j=0;j<paramsup.length;j++){
                    if ((row[filtersupplier]== paramsup[i] && row[filtercategory]== paramcat[j]))
                        return row;
                }
            }
        }
    });
}
function filterC(data, paramsup, filtersupplier,paramcat, filtercategory){
    return data.filter(function(row) {//one supplier and all categorys
        {
            for(var i=0;i<paramcat.length;i++){
                if ((row[filtersupplier]== paramsup && row[filtercategory]== paramcat[i]))
                    return row;
            }
        }
    });
}

function mergingFiles(csvFiles) {
    console.log(modul._error_counter  +" merging files");
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    modul._error_counter++;
    return output;
}
function sortingFiles(csvFiles, filtercontent){
    console.log(modul._error_counter  +" sortingFiles");
    var result=[];
    for (var i=0;i<filtercontent.length;i++){
        csvFiles.forEach(function(d){
            if (d.key==filtercontent[i]){
                result.push(d);
            }
        });
    }
    return result;
}
function checkexistRow(mrow, onerow){
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
//method for static
function checkCountRowsSupplier( ){
    console.log("method:checkCountRowsSupplier");
    var diff=0;
    var countdept= modul._countDep+1;

    var supplierarray=[modul._ds_supplier_BK,
        modul._ds_supplier_EDA,
        modul._ds_supplier_EDI,
        modul._ds_supplier_EFD,
        modul._ds_supplier_EJPD,
        modul._ds_supplier_UVEK,
        modul._ds_supplier_VBS,
        modul._ds_supplier_WBF];

    supplierarray.forEach(function(rows) {
        var keyzahl=100;
        var nodeName ="nodename";
        var newGroup = 100;

        if (rows.length   < countdept){
            diff=countdept-(rows.length);
            for (var i=0;i<diff;i++){
                keyzahl+=i;
                //rows.push({key:keyzahl, values:["null"]});
                //rows.push( {"values":{"name":nodeName,"group":newGroup}});
                rows.push({key:keyzahl, values:[{key:"null"}]});//objekt mit einem array wo ein objekt ist
            }
        }
    });
}
//method for dynamic
function checkCountRowsSupplierDynamic( ){
    console.log("method:checkCountRowsSupplierDynamic");
    var diff=0;
    var countdept= modul._countDep+1;

    modul._ds_supplier_all.forEach(function(rows) {
        var keyzahl=100;
        var nodeName ="nodename";
        var newGroup = 100;

        if (rows.length   < countdept){
            diff=countdept-(rows.length);
            for (var i=0;i<diff;i++){
                keyzahl+=i;
                rows.push({key:keyzahl, values:[{key:"null"}]});//objekt mit einem array wo ein objekt ist
            }
        }
    });
}
function checkcountRows(currenttotal, rows){//wenn die Matrix zuwenig Datensätze hat
    var diff=0;
    var keyzahl=100;

    if (rows.length < currenttotal){
        diff=currenttotal-(rows.length);
        for (var i=0;i<diff;i++){
            keyzahl+=i;
            rows.push({key:keyzahl, values:[{key:"null"}]});
        }
    }
    return rows;
}

function setSupplierCat(vname, element){
    modul._mSupplier=d3.json("Json/filterSupplier.json", function(error, data){
        console.log("setSupplier:"+data[vname].name);
        console.log("setSupplier:"+ msupplier[0]);
        return data[vname].value;
    });

}
