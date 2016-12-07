/**
 * Created by chris on 25.10.2016.
 */
//start file//
"use strict";
    var modul =   require('./Javascripts/Modul');
//var SettingData = require('./Javascripts/SettingData');
    var SettingLayout = require('./Javascripts/SettingLayout');
    var SettingChords = require('./Javascripts/SettingChords');
    var SettingInput  = require('./Javascripts/SettingInput');
    var SettingGroups = require('./Javascripts/SettingGroups');
    var SettingTitle = require('./Javascripts/SettingTitle');
    var CreatingLinks = require('./Javascripts/CreatingLinks');
    var DataManager = require('./Javascripts/DataManager');
    var q;
    var url = require('url') ;
    var parse = require('url-parse');
    //var myquerystring = require('querystring');

global.startwithLink=function(loc){
    console.log("svg.remove()");
    d3.select("svg").remove();
    console.log("*****************************************************************************************");
    console.log("");
    modul._error_counter=0;
    modul._error_counter++;
    console.log("'"+loc+"'");
    startingwithQuery("EDA_EDI_2011");
};
global.starturlmodus=function(loc){
    console.log("starturlmodus1:"+"'"+loc+"'");
    var queryObject = url.parse("'"+loc+"'",true).query;//get querystring
    create_choicevariable(queryObject);
};
function create_choicevariable(queryObject){
    //'EDA_EDI_2011':
    var choice;
    console.log("create_choicevariable:"+queryObject.cat);
    console.log("create_choicevariable:"+queryObject.supplier);
    console.log("create_choicevariable:"+queryObject.year);

    for (var i=0;i<queryObject.depts.length;i++){
        console.log(queryObject.depts[i]);
    }
    console.log("end:");
    choice=queryObject.depts[0]+"_"+queryObject.depts[1]+"_"+queryObject.year.substr(0,4);

    console.log(choice);
    //startingwithQuery(choice);
}
    // CreateLink
global.startcreatinglink=function(dept, supplier, category, year){
    console.log(modul._error_counter+" start creatinglink");
    CreatingLinks.setCurrentUrl("hostname");
    CreatingLinks.setParam(dept,supplier, category, year);
    CreatingLinks.createLink();

    //return modul._http_query;
};

//starting with choiced csv-fils
global.startprocessglobal = function(choice,content, content_B,content_C,content_D) {
    console.log(modul._error_counter+" startprocessglobal");
    modul._currentcsv="";
    modul._v_choice=choice;
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);
    process(content, content_B,content_C,content_D);
};

//changing width, height, outer radius per html
global.startprocessDesign=function(content, name, width, height, radius_i, radius_o){
    console.log(modul._error_counter+" startprocessDesign");
    modul._error_counter++;
    modul._currentcsv="";
    console.log("process:design"+content);
    console.log(width +" "+ height +" " +radius_o);
    settingParam(0, 0, width, height, 6, 15, 0, radius_o);
    process(content);
};
function hasFile(filename, filename_B, filename_C, filename_D,filename_E, filename_F, filename_G, filename_H){
    if (filename_C!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_C="csv/"+filename_C;
        modul._countDep=2;
    }
    if (filename_D!=0){
        modul._currentcsv_D="csv/"+filename_D;
        modul._countDep=3;
    }
    if (filename_E!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_E="csv/"+filename_E;
        modul._countDep=8;
    }
    if (filename_F!=0){
        modul._currentcsv_F="csv/"+filename_F;
        modul._countDep=8;
    }
    if (filename_G!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_G="csv/"+filename_G;
        modul._countDep=8;
    }
    if (filename_H!=0){
        modul._currentcsv_H="csv/"+filename_H;
        modul._countDep=8;
    }
}
function process(filename, filename_B, filename_C, filename_D) {
    modul._svg=d3.select("svg").remove();
    modul._svg = d3.select("svg");
    console.log(modul._error_counter+" process:main");
    modul._error_counter++;
    //default
    modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;

    hasFile(filename, filename_B, filename_C, filename_D, 0, 0, 0, 0);
    console.log(" process "+filename+" "+ filename_B+" "+ filename_C+" "+ filename_D);
    SettingLayout.createArc();
    SettingLayout.layout();
    SettingLayout.path();
    SettingLayout.setSVG();
    //SettingLayout.movesvg();
    SettingLayout.appendCircle();
    console.log("process:defer:"+modul._currentcsv);
    var test=0; //0 normal, 1 kummulation
    console.log("choice modus:"+modul._vmodus);
    if (modul._vmodus=="default"){//each year
        q= d3.queue()
        q
            .defer(d3.csv, modul._currentcsv)
            .defer(d3.csv, modul._currentcsv_B)
            .defer(d3.csv, modul._currentcsv_C)
            .defer(d3.csv, modul._currentcsv_D)
            .defer(d3.csv, modul._currentcsv_E)
            .defer(d3.csv, modul._currentcsv_F)
            .defer(d3.csv, modul._currentcsv_G)
            .defer(d3.csv, modul._currentcsv_H)
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .await(SettingsB)
    }
    else{ //2011 - 2014//kummulation
        var csv="csv/";
        var supplierA=[csv+"BK - 2011.csv",csv+"BK - 2012.csv",csv+"BK - 2013.csv",csv+"BK - 2014.csv"];
        var supplierB=[csv+"EDI - 2011.csv",csv+"EDI - 2012.csv",csv+"EDI - 2013.csv",csv+"EDI - 2014.csv"];
        //var supplierC=[csv+"EDA - 2011.csv",csv+"EDA - 2012.csv",csv+"EDA - 2013.csv",csv+"EDA - 2014.csv"];
        q= d3.queue()
        q
            .defer(d3.csv, supplierA[0])
            .defer(d3.csv, supplierA[1])
            .defer(d3.csv, supplierA[2])
            .defer(d3.csv, supplierA[3])
            .defer(d3.csv, supplierB[0])
            .defer(d3.csv, supplierB[1])
            .defer(d3.csv, supplierB[2])
            .defer(d3.csv, supplierB[3])
            /*.defer(d3.csv, supplierC[0])
            .defer(d3.csv, supplierC[1])
            .defer(d3.csv, supplierC[2])
            .defer(d3.csv, supplierC[3])*/
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .await(settingsC)
    }
}
function SettingsB(error, m_supplier,  m_supplier_B, m_supplier_C,m_supplier_D,
                   m_supplier_E,  m_supplier_F, m_supplier_G,m_supplier_H,
                   matrix, color){
    if (error){
        console.log(error);
    }
    else {
        console.log(modul._error_counter + " SettingsB");
        modul._error_counter++;
        modul._supplier = m_supplier;//Länderbogennamenn setzen
        SettingInput.readcsv(m_supplier, m_supplier_B, m_supplier_C, m_supplier_D,
            m_supplier_E, m_supplier_F, m_supplier_G, m_supplier_H, matrix);//Fill DS-Supplier + DS-Dept, Matrix
        modul._layout.matrix(modul._matrix);
        modul._color = color;
        //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);
        Setting_theMethods();
    }
}

function settingsC(error, m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014,
                m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014,
                matrix, color){
    console.log(modul._error_counter+" SettingsC");
    modul._error_counter++;
    modul._supplier=m_supplier_2011;//Länderbogennamenn setzen
    //Merging 2011 - 2014

    //test only 2012/2013
    SettingInput.readcsv(mergingFiles([m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014]),
    mergingFiles([m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014]),
        mergingFiles([m_supplier_B_2011, m_supplier_B_2012, m_supplier_B_2013, m_supplier_B_2014])
    ,matrix);
    modul._layout.matrix(modul._matrix);
    modul._color=color;
    //console.log("2:SettingsB: Anzah:_supplier:"+modul._supplier.length);
    Setting_theMethods();
}
function Setting_theMethods()
{
    SettingGroups.neighborhood();
    SettingGroups.groupPath();
    SettingGroups.groupText();
    SettingGroups.grouptextFilter();
    SettingChords.selectchords();
    SettingTitle.createTitle();
}
//Setting Params
function settingParam(trans_width, trans_height, width, height,
                      group_x, group_dy,radius_i, radius_o) {
    modul._transform_width = trans_width;
    modul._transform_height = trans_height;
    modul._width = width;
    modul._height = height;
    //Radius
    if (radius_o==0){
        modul._outerRadius = Math.min(modul._width, modul._height) / 2 - 10;
        modul._innerRadius = modul._outerRadius - 24;
    }
    else{
        modul._outerRadius = Math.min(modul._width, modul._height) / 2 - 10;
        modul._innerRadius = radius_o - 24;
    }
    //percentrage
    modul._formatPercent = d3.format(".1%");
    //seeting inpu
    modul._group_x = group_x;
    modul._group_dy = group_dy;
}
function get_requestParam(csvfile,  dep){

}
function startingwithQuery(content){
    console.log(modul._error_counter+" starting with Query");
    modul._error_counter++;
    if (content=="BK_EDI_All")
        modul._vmodus="BK_EDI_cumulation";
    else
        modul._vmodus="default";

    switch(content) {//EDA-EDI 2011- 2014
        case 'EDA_EDI_2011':
            startprocessglobal("EDA_EDI_2011","EDA - 2011.csv","EDI - 2011.csv", 0,0);
            break;
        case 'EDA_EDI_2012':
            startprocessglobal("EDA_EDI_2012","EDA - 2012.csv","EDI - 2012.csv", 0,0);
            break;
        case 'EDA_EDI_2013':
            startprocessglobal("EDA_EDI_2013","EDA - 2013.csv","EDI - 2013.csv",0, 0);
            break;
        case 'EDA_EDI_2014':
            startprocessglobal("EDA_EDI_2014","EDA - 2014.csv","EDA - 2014.csv",0,0);
            break;

            //BK EDI 2011 - 2014
        case 'BK_EDI_2011':
            startprocessglobal("BK_EDI_2011","BK - 2011.csv","EDA - 2011.csv",0,0);
            break;
        case 'BK_EDI_2012':
            startprocessglobal("BK_EDI_2012","BK - 2012.csv","EDA - 2012.csv",0,0);
            break;
        case 'BK_EDI_2013':
            startprocessglobal("BK_EDI_2013","BK - 2013.csv","EDA - 2013.csv",0,0);
            break;
        case 'BK_EDI_2014':
            startprocessglobal("BK_EDI_2014","BK - 2014.csv","EDA - 2014.csv",0,0);
            break;
        case 'BK_EDI_All':
            startprocessglobal("BK_EDI_2014","BK - 2014.csv","EDA - 2014.csv",0,0);
            break;

            //BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011":
            startprocessglobal("BK_EDA_EDI_2011","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", 0);
            break;
        case  "BK_EDA_EDI_2012":
            startprocessglobal("BK_EDA_EDI_2012","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013":
            startprocessglobal("BK_EDA_EDI_2013","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014":
            startprocessglobal("BK_EDA_EDI_2014","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //BK EDA EDI 2011 - 2014 Tri
        case  "BK_EDA_EDI_2011_Tri":
            startprocessglobal("BK_EDA_EDI_2011_Tri","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Tri":
            startprocessglobal("BK_EDA_EDI_2012_Tri","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Tri":
            startprocessglobal("BK_EDA_EDI_2013_Tri","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Tri":
            startprocessglobal("BK_EDA_EDI_2014_Tri","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

            //Cat BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011_Cat":
            startprocessglobal("BK_EDA_EDI_2011_Cat","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat":
            startprocessglobal("BK_EDA_EDI_2012_Cat","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat":
            startprocessglobal("BK_EDA_EDI_2013_Cat","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat":
            startprocessglobal("BK_EDA_EDI_2014_Cat","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //Cat BK EDA EDI 2011 - 2014 2
        case  "BK_EDA_EDI_2011_Cat_2":
            startprocessglobal("BK_EDA_EDI_2011_Cat_2","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat_2":
            startprocessglobal("BK_EDA_EDI_2012_Cat_2","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat_2":
            startprocessglobal("BK_EDA_EDI_2013_Cat_2","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat_2":
            startprocessglobal("BK_EDA_EDI_2014_Cat_2","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

        //Cat BK EDA EDI 2011 - 2014 3
        case  "BK_EDA_EDI_2011_Cat_3":
            startprocessglobal("BK_EDA_EDI_2011_Cat_3","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv",0);
            break;
        case  "BK_EDA_EDI_2012_Cat_3":
            startprocessglobal("BK_EDA_EDI_2012_Cat_3","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv",0);
            break;
        case  "BK_EDA_EDI_2013_Cat_3":
            startprocessglobal("BK_EDA_EDI_2013_Cat_3","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv",0);
            break;
        case  "BK_EDA_EDI_2014_Cat_3":
            startprocessglobal("BK_EDA_EDI_2014_Cat_3","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv",0);
            break;

            //dummy
        case  "Dummy":
            startprocessglobal("Dummy","Dummy_EDA.csv","Dummy_EDI.csv",0,0);
            break;

        //Cat BK EDA EDI EJPD 2011 - 2014
        case  "BK_EDA_EDI_EJPD_2011_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2011_Cat","BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "EJPD - 2011.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2012_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2012_Cat","BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "EJPD - 2012.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2013_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2013_Cat","BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "EJPD - 2013.csv");
            break;
        case  "BK_EDA_EDI_EJPD_2014_Cat":
            startprocessglobal("BK_EDA_EDI_EJPD_2014_Cat","BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "EJPD - 2014.csv");
            break;
        default:

        //BK EDA EDI EFD EJPD UVEK VBS WBF 2011
        case  "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
             "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
            );
            break;
    }
}
function mergingFiles(csvFiles) {
    console.log(modul._error_counter + " merging files");
    modul._error_counter++;
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    return output;
}