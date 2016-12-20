/**
 * Created by chris on 13.12.2016.
 */
var express    = require('express');
var appmy        = express();
modul =   require('./Javascripts/Modul');
var app= require('./app');
var url="http://localhost:63343";
var urlname='/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html';
var urlname_short='/BA2016_Swiss_Gov/chords_ba2016/';
var d3=require("d3");

var port = process.env.PORT || 63343;
var router = express.Router();

router.get(urlname+'/', function(req, res) {
    res.json({ message: 'root! welcome to our api!' });
});

appmy.get(urlname+'/supplier', function (req, res) {
    console.log( "supplier ");
    res.json({ message: 'supplier! welcome to our api!' });
});

appmy.get(urlname+'/cat', function (req, res) {
    console.log( "cat ");
    res.json({ message: 'cat! welcome to our api!' });
});

appmy.get(urlname+'/dept', function (req, res) {
        console.log( "depts ");
        res.json({ message: 'depts! welcome to our api!' });
});
appmy.get(url+urlname+'/dept/:id', function (req, res) {
    console.log( "depts ");
    res.json({ message: 'depts id! welcome to our api!' });
});

appmy.get(urlname+'/year', function (req, res) {
    console.log( "year ");
    res.json({ message: 'year! welcome to our api!' });
});

appmy.get(urlname+'/dept/:id/supplier/:id', function (req, res) {
    console.log(req);
    console.log(res);
    console.log( "depts and supplier ");
    res.json({ message: 'depts and supplier! welcome to our api!',
        result2: req.path
    });
});

appmy.get(urlname_short, function (req, res) {
    console.log(req);
    console.log(res);
    console.log( "mainpage");
    res.json({ message: 'mainpage! welcome to our api!',
        result2: req.path
    });
});

appmy.get(urlname+'/dept/:id/supplier/:id/cat/:id/year/:id', function (req, res) {

    console.log(req);
    console.log(res);
    console.log(req.path);
    console.log( "depts and supplier year");

    /*d3.csv("BK - 2011.csv", function(data)
    {
        console.log(data[0].length);
    });*/
    //res.redirect("http://localhost:63342/BA2016_Swiss_Gov/chords_ba2016/Supplier_2016_chord_02.html");
    //modul._error_counter=0;
    //serverinput("BK_BK_2011");
    //starturimodus( req.path);
    /*res.json({ message: 'depts and supplier! welcome to our api!',
        result2: req.path
    });*/
});

appmy.use('/api', router);

// START THE SERVER
// =============================================================================
appmy.listen(port);
console.log('Magic happens on port ' + port);