/**
 * Created by chris on 13.12.2016.
 */
var express    = require('express');
var app        = express();

var port = process.env.PORT || 63342;
var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'root! welcome to our api!' });
});

app.get('/depts', function (req, res) {
        console.log( "depts ");
        res.json({ message: 'depts! welcome to our api!' });
});
app.get('/depts/:id', function (req, res) {
    console.log( "depts ");
    res.json({ message: 'depts id! welcome to our api!' });
});


app.get('/supplier', function (req, res) {
    console.log( "supplier ");
    res.json({ message: 'supplier! welcome to our api!' });
});

app.get('/cat', function (req, res) {
    console.log( "cat ");
    res.json({ message: 'cat! welcome to our api!' });
});

app.get('/year', function (req, res) {
    console.log( "year ");
    res.json({ message: 'year! welcome to our api!' });
});

app.get('/depts/:id/supplier/:id', function (req, res) {
    console.log(req);
    console.log(res);
    console.log( "depts and supplier ");
    res.json({ message: 'depts and supplier! welcome to our api!',
       result2: req.path
    });
});
app.get('/BA2016_Swiss_Gov/chords_ba2016/depts/:id/supplier/:id', function (req, res) {
    console.log(req);
    console.log(res);
    console.log( "depts and supplier ");
    res.json({ message: 'depts and supplier! welcome to our api!',
        result2: req.path
    });
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);