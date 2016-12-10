/**
 * Created by chris on 09.12.2016.
 */

modul =   require('./Modul');
DataManager = require('./DataManager');
MatrixCreatorX =require('./MatrixCreatorX');

module.exports={
    readcsv:readcsv
};

function readcsv(data, data_B,data_C,data_D,data_E, data_F,data_G,data_H ,matrix){
    console.log(modul._error_counter + " readcsv");
    modul._error_counter++;
    var supplier;
    var csvall;
    var csvsort;
    var filtercontent;
    var filtercontentB;
    var ds_supplier_x=[];

    filtercontent=["Schweiz. Depeschenagentur AG",         "Trivadis AG",
        "Fabasoft CH Software AG",  "Ecoplan AG",     "Schweizerische Bundesbahnen SBB",
        "GFS.Bern Forsch.Politik Kommunikation+Gesellsch.",
        "Stoupa & Partners AG Beratungsgesellschaft Betriebswi",
        "SRG SSR idÃ©e suisse Media Services"] ;
    modul._filterSupplier=filtercontent;
    filtercontentB=["Beratungs-DL fÃ¼r Management und Organisation sowie Coaching",
        "Sprach- und Ãœbersetzungsdienstleistungen",
        "Informatik-DL exkl. Personalverleih im Bereich IKT",
        "SW-Pflege und HW Wartung",
        "Allg. Beratungs-DL im Fachbereich eines Amtes und Honorare",
        "Informationsarbeit",
        "Keiner Kategorie zuordenbar, inkl Wartung und Reparatur",
        "DL im Zusammenhang mit Personentransporten, Hotels, usw."];

    switch (modul._v_choice){
        case "EDA_EDI_2011"://EDA 2011, EDI 2011
        case "EDA_EDI_2012"://EDA 2012, EDI 2011
        case "EDA_EDI_2013"://EDA 2013, EDI 2011
        case "EDA_EDI_2014"://EDA 2014, EDI 2011
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
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
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB"];
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
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte"];
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
            filtercontent=["Hardware","SW-Pflege und HW Wartung",
                "Informatik-DL exkl. Personalverleih im Bereich IKT"];
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
            modul._ds_supplier_BK= DataManager.getDummy_BK(data, "fullCategory");
            modul._ds_supplier_EDA= DataManager.getDummy_EDA(data_B, "fullCategory");
            modul._ds_supplier_EDI= DataManager.getDummy_EDI(data_C, "fullCategory");
            csvall=mergingFiles([ modul._ds_supplier_BK, modul._ds_supplier_EDA, modul._ds_supplier_EDI]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvsort, ["sumBundeskanzelt","sumEDA","sumEDI"]);
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
            filtercontent=["Informationsarbeit","Informatik-DL exkl. Personalverleih im Bereich IKT",
                "Hardware","Postdienste"]; //jedes data ein departement, mindesten 4 pro dept
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
            break;
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2012":
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2013":
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2014":
            modul._countDep=7;
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
                "Universal-Job AG","Dell SA","DHL Express (Schweiz) AG","Allianz Suisse Versicherungs-Gesellschaft"
            ];
            modul._filterSupplier=filtercontent;
            var dept=["BK", "EDI","EDA","EFD","EJPD","UVEK","VBS", "WBK"];
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
                modul._ds_supplier_EJPD, modul._ds_supplier_UVEK, modul._ds_supplier_VBS, modul._ds_supplier_WBF,
            ]);
            csvsort=sortingFiles(csvall, filtercontent);
            modul._ds_supplier=MatrixCreatorX.matrix_Creator(csvall,csvall, ["sumBundeskanzelt","sumEDA","sumEDI", "sumEFD",
                "sumBFM", "sumUVEK", "sumVBS", "sumWBF"]);
            break;
            //7 elements
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011_7":
            modul._countDep=6;
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
                "Universal-Job AG","Dell SA","DHL Express (Schweiz) AG"
            ];
            modul._filterSupplier=filtercontent;
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
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011_6":
            modul._countDep=5;
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
                "Universal-Job AG","Dell SA"
            ];
            modul._filterSupplier=filtercontent;
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
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011_5":
            modul._countDep=4;
            filtercontent=["AirPlus International AG","Schweizerische Bundesbahnen SBB",
                "Die Schweizerische Post Service Center Finanzen Mitte","SRG SSR idée suisse Media Services",
                "Universal-Job AG"
            ];
            modul._filterSupplier=filtercontent;
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
        default:
    }
}

function filter(data, param, filtername){
    console.log(modul._error_counter+" filter");
    modul._error_counter++;
    /* if (param.length==2){
     return data.filter(function(row) {
     if (row[filtername] == param[0]
     ||  row[filtername] == param[1]
     )
     {  return row;  }
     });
     }*/

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
