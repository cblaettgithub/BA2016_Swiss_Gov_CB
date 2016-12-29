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
    var CreatingUri = require('./Javascripts/CreatingUri');
    var DataManager = require('./Javascripts/DataManager');
    var Config_start = require('./Javascripts/Config_start');
    var Config_Process = require('./Javascripts/Config_Process');
    var MatrixCreatorX =require('./Javascripts/MatrixCreatorX');
    var q;
    //var express    = require('express');
    //var appmy        = express();
    var url = require('url') ;
    var parse = require('url-parse');
    var d3 = require("d3"),    jsdom = require("jsdom");
    /*var urlname='/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html';

//serverkonfiguration
var server = appmy.listen(63343, function () {
    var host ="BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html";
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});

appmy.get(urlname+'/dept/:id/supplier/:id/cat/:id/year/:id', function (req, res) {
    console.log(req);
    console.log(res);
    console.log(req.path);
    console.log( "depts and supplier year");
    serverinput("BK_BK_2011");
});*/

    global.setchoiceData_Supp=function(name){
        modul._choiceData=name;
        switch ( modul._choiceData){
            case "supp_A":
                modul._currentcolor="csv/color_2.csv";
                break;
            case "supp_B":
                modul._currentcolor="csv/color_3.csv";
                break;
            case "supp_C":
                modul._currentcolor="csv/color_4.csv";
                break;
            default:
                modul._currentcolor="csv/color_2.csv";
        }
        console.log("choice:"+  modul._choiceData);
    };
    global.setchoiceData_Cat=function(name){
    modul._choiceData_Cat=name;
    console.log("choice:"+  modul._choiceData_Cat);
    };

global.startwithLink=function(kind, choice){
    console.log("svg.remove()");
    d3.select("svg").remove();
    console.log("*****************************************************************************************");
    console.log("");
    modul._vchoice=choice;
    console.log("'"+ modul._vchoice+"'");
    Config_start.startingApplication( modul._vchoice);
};

global.serverinput=function(value){
    console.log("serverinput:"+value);
    Config_start.startingApplication(value);
};

// CreateLink Querystring (0)
global.startcreatinglink=function(dept, supplier, category, year){
    if (modul._choiceData="")
        modul._choiceData="supp_A";
    console.log("startcreatinglink:supplier."+supplier);
    console.log(modul._error_counter+" start creatinglink+Supplierchoice"+modul._choiceData);
    CreatingLinks.setCurrentUrl("hostname");
    CreatingLinks.setParam(dept,supplier, category, year);
    CreatingLinks.createLink();
    return modul._http_query;
};
// CreateLink Querystring (0)
global.startcreatinglinkMain=function(dept, supplier, category, year){
    if (modul._choiceData="")
        modul._choiceData="supp_A";
    console.log("startcreatinglink:supplier."+supplier);
    console.log(modul._error_counter+" start creatinglink+Supplierchoice"+modul._choiceData);
    CreatingLinks.setCurrentUrl("hostname");
    CreatingLinks.setParamMain(dept,supplier, category, year);
    CreatingLinks.createLinkMain();
    return modul._http_query;
};
//querystring after the click (1)
global.starturlmodus=function(loc){
    console.log("starturlmodus1:"+"'"+loc+"'");
    if (loc.search==""){
        Config_start.startingApplication("BK_2011");
    }
    else{
        var queryObject = url.parse("'"+loc+"'",true).query;//get querystring
        CreatingLinks.create_choicevariable(queryObject);
        Config_start.startingApplication( modul._v_choice);
    }
};

//querystring after the click mainpage

global.starturlmodusMain=function(loc){
    console.log("starturlmodus1:"+"'"+loc+"'");
    if (loc.search==""){
        Config_start.startingApplication("BK_2011");
    }
    else{
        modul._vchoice="dynam";
        var queryObject = url.parse("'"+loc+"'",true).query;//get querystring
        CreatingLinks.create_supp_category_modulvariable(queryObject);
        Config_start.startingApplication("Dyn_2016");
    }
};

// CreateLink Uri ok (2)
global.startcreatinglinkUri=function(dept, supplier, category, year){
    console.log(modul._error_counter+" start creatinglinkUri");
    modul._svg=d3.selection("svg");
    CreatingUri.setCurrentUrl("hostname");
    CreatingUri.setParamsUri(dept,supplier, category, year);
    CreatingUri.createUri();
    return modul._http_uri;
};

//uri after the click (3)
global.starturimodus=function(loc){
    console.log("starturi:"+"'"+loc+"'");
    if (loc.search==""){
        Config_start.startingApplication("BK_2011");
    }
    else{
        var queryObject = url.parse("'"+loc+"'",true).query;//get uri
        console.log("starturimodus:query:"+"'"+queryObject+"'");
        CreatingUri.create_choicevariableUri(queryObject);
        Config_start.startingApplication( modul._v_choice);
    }
};

//starting with choiced csv-fils
global.startprocessglobal = function(choice,content, content_B,content_C,content_D) {
    modul._v_choice=choice;
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);

    //default
    modul._currentcsv="csv/"+content;
    modul._currentcsv_B="csv/"+content_B;

    csvFileSet(content, content_B,content_C,content_D, 0, 0, 0, 0);
    process();
    //process(modul._currentcsv, content_B,content_C,content_D);
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
function csvFileSet(filename, filename_B, filename_C, filename_D, filename_E, filename_F, filename_G, filename_H){
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
function process() {
    modul._svg=d3.select("svg").remove();
    modul._svg = d3.select("svg");

    //default
    /*modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;

    csvFileSet(filename, filename_B, filename_C, filename_D, 0, 0, 0, 0);
    console.log(" process "+filename+" "+ filename_B+" "+ filename_C+" "+ filename_D);*/

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
        q= d3.queue();
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
            .defer(d3.json, modul._currentSupplier)
            .defer(d3.json, modul._currentCat)
            .await(SettingsB)
    }
    else{ //2011 - 2014//kummulation
        var csv="csv/";
        var supplierA=[csv+"BK - 2011.csv",csv+"BK - 2012.csv",csv+"BK - 2013.csv",csv+"BK - 2014.csv"];
        var supplierB=[csv+"EDI - 2011.csv",csv+"EDI - 2012.csv",csv+"EDI - 2013.csv",csv+"EDI - 2014.csv"];
        //var supplierC=[csv+"EDA - 2011.csv",csv+"EDA - 2012.csv",csv+"EDA - 2013.csv",csv+"EDA - 2014.csv"];
        q= d3.queue();
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
                   matrix, color, choicesupplier, choiceCat){
    if (error){
        console.log(error);
    }
    else {
        console.log("Settings:"+m_supplier[0]);
        console.log(modul._error_counter + " SettingsB");
        modul._error_counter++;
        modul._supplier = m_supplier;//Länderbogennamenn setzen
        Config_Process.readcsv(m_supplier, m_supplier_B, m_supplier_C, m_supplier_D,
            m_supplier_E, m_supplier_F, m_supplier_G, m_supplier_H, matrix,choicesupplier, choiceCat);//Fill DS-Supplier + DS-Dept, Matrix
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
