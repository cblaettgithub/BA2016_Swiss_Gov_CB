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
    var q;

global.startwithLink=function(choice, content, choice_C){
    console.log("*****************************************************************************************");
    console.log("");
    console.log(modul._error_counter+" start with Link:"+choice+" "+content+" "+choice_C);
    modul._error_counter++;
    startingwithQuery(content);
}

    // CreateLink
global.startcreatinglink=function(){
    console.log(modul._error_counter+" start creatinglink");
    modul._error_counter++;
    return modul._vhttp+"?choice="+modul._v_choice;
}

//starting with choiced csv-fils
global.startprocessglobal = function(content, content_B,content_C, choice) {
    console.log(modul._error_counter+" startprocessglobal");
    modul._error_counter++;
    modul._currentcsv="";
    modul._v_choice=choice;
    //d3.select("#result").property("value", csv);
    //var res = document.forms[0]["result"].value;
    console.log("process:start"+content, content_B,content_C);
    settingParam(0, 0, 720, 720, 6, 15, 0, 0);
    process(content, content_B,content_C);
}

//changing width, height, outer radius per html
global.startprocessDesign=function(content, name, width, height, radius_i, radius_o){
    console.log(modul._error_counter+" startprocessDesign");
    modul._error_counter++;
    modul._currentcsv="";
    console.log("process:design"+content);
    console.log(width +" "+ height +" " +radius_o);
    settingParam(0, 0, width, height, 6, 15, 0, radius_o);
    process(content);
}

function process(filename, filename_B, filename_C) {
    modul._svg=d3.select("svg").remove();
    modul._svg = d3.select("svg");
    console.log(modul._error_counter+" process:main");
    modul._error_counter++;
    //default
    modul._currentcsv="csv/"+filename;
    modul._currentcsv_B="csv/"+filename_B;
    if (filename_C!=0)
        modul._currentcsv_C="csv/"+filename_C;
    console.log("csv/"+filename);
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
            .defer(d3.json,modul._currentjson)
            .defer(d3.csv, modul._currentcolor)
            .defer(d3.csv, "csv/"+"Dummy_EDA_EDI_All.csv")
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

function SettingsB(error, m_supplier,  m_supplier_B, m_supplier_C,matrix, color,m_dummy)
{
    console.log(modul._error_counter+" SettingsB");
    modul._error_counter++;
    modul._supplier=m_supplier;//Länderbogennamenn setzen
    SettingInput.readcsv(m_supplier, m_supplier_B, m_supplier_C,matrix);//Fill DS-Supplier + DS-Dept, Matrix
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
    Querystring
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
            startprocessglobal("EDA - 2011.csv","EDI - 2011.csv", 0,"EDA_EDI_2011");
            break;
        case 'EDA_EDI_2012':
            startprocessglobal("EDA - 2012.csv","EDI - 2012.csv", 0,"EDA_EDI_2012");
            break;
        case 'EDA_EDI_2013':
            startprocessglobal("EDA - 2013.csv","EDI - 2013.csv",0, "EDA_EDI_2013");
            break;
        case 'EDA_EDI_2014':
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "EDA_EDI_2014");
            break;

            //BK EDI 2011 - 2014
        case 'BK_EDI_2011':
            startprocessglobal("BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "BK_EDI_2011");
            break;
        case 'BK_EDI_2012':
            startprocessglobal("BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "BK_EDI_2012");
            break;
        case 'BK_EDI_2013':
            startprocessglobal("BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "BK_EDI_2013");
            break;
        case 'BK_EDI_2014':
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDI_2014");
            break;
        case 'BK_EDI_All':
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDI_2014");
            break;

            //BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011":
            startprocessglobal("BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "BK_EDA_EDI_2011");
            break;
        case  "BK_EDA_EDI_2012":
            startprocessglobal("BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "BK_EDA_EDI_2012");
            break;
        case  "BK_EDA_EDI_2013":
            startprocessglobal("BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "BK_EDA_EDI_2013");
            break;
        case  "BK_EDA_EDI_2014":
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDA_EDI_2014");
            break;

        //BK EDA EDI 2011 - 2014 Tri
        case  "BK_EDA_EDI_2011_Tri":
            startprocessglobal("BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "BK_EDA_EDI_2011_Tri");
            break;
        case  "BK_EDA_EDI_2012_Tri":
            startprocessglobal("BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "BK_EDA_EDI_2012_Tri");
            break;
        case  "BK_EDA_EDI_2013_Tri":
            startprocessglobal("BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "BK_EDA_EDI_2013_Tri");
            break;
        case  "BK_EDA_EDI_2014_Tri":
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDA_EDI_2014_Tri");
            break;

            //Cat BK EDA EDI 2011 - 2014
        case  "BK_EDA_EDI_2011_Cat":
            startprocessglobal("BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "BK_EDA_EDI_2011_Cat");
            break;
        case  "BK_EDA_EDI_2012_Cat":
            startprocessglobal("BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "BK_EDA_EDI_2012_Cat");
            break;
        case  "BK_EDA_EDI_2013_Cat":
            startprocessglobal("BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "BK_EDA_EDI_2013_Cat");
            break;
        case  "BK_EDA_EDI_2014_Cat":
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDA_EDI_2014_Cat");
            break;

        //Cat BK EDA EDI 2011 - 2014 2
        case  "BK_EDA_EDI_2011_Cat_2":
            startprocessglobal("BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "BK_EDA_EDI_2011_Cat_2");
            break;
        case  "BK_EDA_EDI_2012_Cat_2":
            startprocessglobal("BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "BK_EDA_EDI_2012_Cat_2");
            break;
        case  "BK_EDA_EDI_2013_Cat_2":
            startprocessglobal("BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "BK_EDA_EDI_2013_Cat_2");
            break;;
        case  "BK_EDA_EDI_2014_Cat_2":
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDA_EDI_2014_Cat_2");
            break;

        //Cat BK EDA EDI 2011 - 2014 3
        case  "BK_EDA_EDI_2011_Cat_3":
            startprocessglobal("BK - 2011.csv","EDA - 2011.csv","EDI - 2011.csv", "BK_EDA_EDI_2011_Cat_3");
            break;
        case  "BK_EDA_EDI_2012_Cat_3":
            startprocessglobal("BK - 2012.csv","EDA - 2012.csv","EDI - 2012.csv", "BK_EDA_EDI_2012_Cat_3");
            break;
        case  "BK_EDA_EDI_2013_Cat_3":
            startprocessglobal("BK - 2013.csv","EDA - 2013.csv","EDI - 2013.csv", "BK_EDA_EDI_2013_Cat_3");
            break;
        case  "BK_EDA_EDI_2014_Cat_3":
            startprocessglobal("BK - 2014.csv","EDA - 2014.csv","EDI - 2014.csv", "BK_EDA_EDI_2014_Cat_3");
            break;

            //dummy
        case  "Dummy":
            startprocessglobal("Dummy_EDA.csv","Dummy_EDI.csv",0, "Dummy");
            break;
        default:
    }
}
function mergingFiles(csvFiles) {
    console.log(modul._error_counter+" merging files");
    modul._error_counter++;
    var results = [];
    var output;
    for (var i = 0; i < csvFiles.length; i++) {
        results.push(csvFiles[i]);
    }
    output = d3.merge(results);
    return output;
}

