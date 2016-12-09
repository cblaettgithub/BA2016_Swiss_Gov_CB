/**
 * Created by chris on 09.12.2016.
 */
module.exports={
    startingwithQuery:startingwithQuery
};

function startingwithQuery(content){
    console.log(modul._error_counter+" starting with Query");
    modul._error_counter++;
    if (content=="BK_EDI_All")
        modul._vmodus="BK_EDI_cumulation";
    else
        modul._vmodus="default";

    switch(content) {//EDA-EDI 2011- 2014
        case 'BK_2011':
            startprocessglobal("BK_2011","BK - 2011.csv","EDI - 2011.csv", 0,0);
            break;
        case 'BK_2012':
            startprocessglobal("BK_2012","BK - 2012.csv","EDI - 2011.csv", 0,0);
            break;
        case 'BK_2013':
            startprocessglobal("BK_2013","BK - 2013.csv","EDI - 2011.csv", 0,0);
            break;
        case 'BK_2014':
            startprocessglobal("BK_2014","BK - 2014.csv","EDI - 2011.csv", 0,0);
            break;

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
        //BK EDA EDI EFD EJPD UVEK VBS WBF 2011
        case  "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
                "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
            );
            break;
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2012":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2012","BK - 2012.csv",   "EDA - 2012.csv","EDI - 2012.csv", "EFD - 2012.csv",
                "EJPD - 2012.csv", "UVEK - 2012.csv", "VBS - 2012.csv","WBF - 2012.csv"
            );
            break;
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2013":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2013","BK - 2013.csv",   "EDA - 2013.csv","EDI - 2013.csv", "EFD - 2013.csv",
                "EJPD - 2013.csv", "UVEK - 2013.csv", "VBS - 2013.csv","WBF - 2013.csv"
            );
            break;
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2014":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2014","BK - 2014.csv",   "EDA - 2014.csv","EDI - 2014.csv", "EFD - 2014.csv",
                "EJPD - 2014.csv", "UVEK - 2014.csv", "VBS - 2014.csv","WBF - 2014.csv"
            );
            break;
        default:
    }
}