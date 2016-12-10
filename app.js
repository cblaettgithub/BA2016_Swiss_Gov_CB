/**
 * Created by chris on 25.10.2016.
 */
//start file//
"use strict";
    var modul =   require('./Javascripts/Modul');
    var SettingLayout = require('./Javascripts/SettingLayout');
    var SettingChords = require('./Javascripts/SettingChords');
    var SettingGroups = require('./Javascripts/SettingGroups');
    var SettingTitle = require('./Javascripts/SettingTitle');
    var CreatingLinks = require('./Javascripts/CreatingLinks');
    var DataManager = require('./Javascripts/DataManager');
    var Config_start = require('./Javascripts/Config_start');
    var Config_Process = require('./Javascripts/Config_Process');
    var MatrixCreatorX =require('./Javascripts/MatrixCreatorX');
    var q;
    var url = require('url') ;
    var parse = require('url-parse');

global.startwithLink=function(kind, choice){
    console.log("svg.remove()");
    d3.select("svg").remove();
    console.log("*****************************************************************************************");
    console.log("");
    modul._vchoice=choice;
    console.log("'"+ modul._vchoice+"'");
    Config_start.startingwithQuery( modul._vchoice);
};
global.starturlmodus=function(loc){
    console.log("starturlmodus1:"+"'"+loc+"'");
    if (loc.search==""){
        Config_start.startingwithQuery("BK_2011");
    }
    else{
        var queryObject = url.parse("'"+loc+"'",true).query;//get querystring
        create_choicevariable(queryObject);
    }
};
function create_choicevariable(queryObject){
    //'EDA_EDI_2011':
    var choice="";
    console.log("create_choicevariable:"+queryObject.cat);
    console.log("create_choicevariable:"+queryObject.supplier);
    console.log("create_choicevariable:"+queryObject.year);

    for (var i=0;i<queryObject.depts.length;i++){
        console.log(queryObject.depts[i]);
    }
    for (var i=0;i<queryObject.depts.length;i++)
        choice+=queryObject.depts[i]+"_";
    //choice=queryObject.depts[0]+"_"+queryObject.depts[1]+"_"+queryObject.year.substr(0,4);
    choice+=queryObject.year.substr(0,4);
    console.log("create_choicevariable:"+choice);
    Config_start.startingwithQuery(choice);
}
    // CreateLink
global.startcreatinglink=function(dept, supplier, category, year){
    console.log(modul._error_counter+" start creatinglink");
    CreatingLinks.setCurrentUrl("hostname");
    CreatingLinks.setParam(dept,supplier, category, year);
    CreatingLinks.createLink();
    return modul._http_query;
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
        modul._countDep=7;
    }
    if (filename_F!=0){
        modul._currentcsv_F="csv/"+filename_F;
        modul._countDep=7;
    }
    if (filename_G!=0){     //lösung immer 4 files mitgeben*/
        modul._currentcsv_G="csv/"+filename_G;
        modul._countDep=7;
    }
    if (filename_H!=0){
        modul._currentcsv_H="csv/"+filename_H;
        modul._countDep=7;
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
        Config_Process.readcsv(m_supplier, m_supplier_B, m_supplier_C, m_supplier_D,
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
    Config_Process.readcsv(mergingFiles([m_supplier_2011, m_supplier_2012, m_supplier_2013,m_supplier_2014]),
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