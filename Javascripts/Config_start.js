/**
 * Created by chris on 09.12.2016.
 */
module.exports={
    startingApplication:startingApplication
};

function startingApplication(content){
    //console.log(modul._error_counter+" starting with Query");
    //modul._error_counter++;
    if (content=="BK_EDI_All")
        modul._vmodus="BK_EDI_cumulation";
    else
        modul._vmodus="default";

    switch(content) {//EDA-EDI 2011- 2014
        case 'BK_BK_2011':
            startprocessglobal("BK_BK_2011","BK - 2011.csv","BK - 2011.csv", 0,0,0,0,0,0);
            break;
        case 'BK_BK_2012':
            startprocessglobal("BK_BK_2012","BK - 2012.csv","BK - 2012.csv", 0,0,0,0,0,0);
            break;
        case 'BK_BK_2013':
            startprocessglobal("BK_BK_2013","BK - 2013.csv","BK - 2013.csv", 0,0,0,0,0,0);
            break;
        case 'BK_BK_2014':
            startprocessglobal("BK_BK_2014","BK - 2014.csv","BK - 2014.csv", 0,0,0,0,0,0);
            break;

        case 'EDA_EDA_2011':
            startprocessglobal("EDA_EDA_2011","EDA - 2011.csv","EDA - 2011.csv", 0,0,0,0,0,0);
            break;
        case 'EDA_EDA_2012':
            startprocessglobal("EDA_EDA_2012","EDA - 2012.csv","EDA - 2012.csv", 0,0,0,0,0,0);
            break;
        case 'EDA_EDA_2013':
            startprocessglobal("EDA_EDA_2013","EDA - 2013.csv","EDA - 2013.csv", 0,0,0,0,0,0);
            break;
        case 'EDA_EDA_2014':
            startprocessglobal("EDA_EDA_2014","EDA - 2014.csv","EDA - 2014.csv", 0,0,0,0,0,0);
            break;

        case 'EDI_EDI_2011':
            startprocessglobal("EDI_EDI_2011","EDI - 2011.csv","EDI - 2011.csv", 0,0,0,0,0,0);
            break;
        case 'EDI_EDI_2012':
            startprocessglobal("EDI_EDI_2012","EDI - 2012.csv","EDI - 2012.csv", 0,0,0,0,0,0);
            break;
        case 'EDI_EDI_2013':
            startprocessglobal("EDI_EDI_2013","EDI - 2013.csv","EDI - 2013.csv", 0,0,0,0,0,0);
            break;
        case 'EDI_EDI_2014':
            startprocessglobal("EDI_EDI_2014","EDI - 2014.csv","EDI - 2014.csv", 0,0,0,0,0,0);
            break;

        case 'EFD_EFD_2011':
            startprocessglobal("EFD_EFD_2011","EFD - 2011.csv","EFD - 2011.csv", 0,0,0,0,0,0);
            break;
        case 'EFD_EFD_2012':
            startprocessglobal("EFD_EFD_2012","EFD - 2012.csv","EFD - 2012.csv", 0,0,0,0,0,0);
            break;
        case 'EFD_EFD_2013':
            startprocessglobal("EFD_EFD_2013","EFD - 2013.csv","EFD - 2013.csv", 0,0,0,0,0,0);
            break;
        case 'EFD_EFD_2014':
            startprocessglobal("EFD_EFD_2014","EFD - 2014.csv","EFD - 2014.csv", 0,0,0,0,0,0);
            break;

        case 'EJPD_EJPD_2011':
            startprocessglobal("EJPD_EJPD_2011","EJPD - 2011.csv","EJPD - 2011.csv",0,0,0,0,0,0);
            break;
        case 'EJPD_EJPD_2012':
            startprocessglobal("EJPD_EJPD_2012","EJPD - 2012.csv","EJPD - 2012.csv", 0,0,0,0,0,0);
            break;
        case 'EJPD_EJPD_2013':
            startprocessglobal("EJPD_EJPD_2013","EJPD - 2013.csv","EJPD - 2013.csv", 0,0,0,0,0,0);
            break;
        case 'EJPD_EJPD_2014':
            startprocessglobal("EJPD_EJPD_2014","EJPD - 2014.csv","EJPD - 2014.csv", 0,0,0,0,0,0);
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
            //*********************
            //dynamische auswahl //dept dynamic
        case "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2015":
            startprocessglobal
            ("Dept_dynamic","BK - 2014.csv",   "EDA - 2014.csv","EDI - 2014.csv", "EFD - 2014.csv",
                "EJPD - 2014.csv", "UVEK - 2014.csv", "VBS - 2014.csv","WBF - 2014.csv"
            );
            break;
      ///////////chord main
        case "chord_main"://case year noch dazu
            switch (modul._currentYear){
                case "2011":
                    startprocessglobal
                    ("chord_main","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
                        "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
                    );
                    break;
                case "2012":
                    startprocessglobal
                    ("chord_main","BK - 2012.csv",   "EDA - 2012.csv","EDI - 2012.csv", "EFD - 2012.csv",
                        "EJPD - 2012.csv", "UVEK - 2012.csv", "VBS - 2012.csv","WBF - 2012.csv"
                    );
                    break;
                case "2013":
                    startprocessglobal
                    ("chord_main","BK - 2013.csv",   "EDA - 2013.csv","EDI - 2013.csv", "EFD - 2013.csv",
                        "EJPD - 2013.csv", "UVEK - 2013.csv", "VBS - 2013.csv","WBF - 2013.csv"
                    );
                    break;
                case "2014":
                    startprocessglobal
                    ("chord_main","BK - 2014.csv",   "EDA - 2014.csv","EDI - 2014.csv", "EFD - 2014.csv",
                        "EJPD - 2014.csv", "UVEK - 2014.csv", "VBS - 2014.csv","WBF - 2014.csv"
                    );
                    break;
            }
        break;

        //dynamische auswahl
        //*********************
            // 7, 6, 5 elements
        case  "BK_EDA_EDI_EFD_EJPD_UVEK_VBS_2011"://"BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011_7"
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_VBS_WBF_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
                "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
            );
            break;
        case  "BK_EDA_EDI_EFD_EJPD_UVEK_2011":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_UVEK_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
                "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
            );
            break;
        case  "BK_EDA_EDI_EFD_EJPD_2011":
            startprocessglobal
            ("BK_EDA_EDI_EFD_EJPD_2011","BK - 2011.csv",   "EDA - 2011.csv","EDI - 2011.csv", "EFD - 2011.csv",
                "EJPD - 2011.csv", "UVEK - 2011.csv", "VBS - 2011.csv","WBF - 2011.csv"
            );
            break;
        default:
    }
}