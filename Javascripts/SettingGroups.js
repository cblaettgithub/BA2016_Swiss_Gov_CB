/**
 * Created by chris on 21.10.2016.
 */
modul =   require('./Modul');
var d3 = require("d3");

module.exports ={
    neighborhood:neighborhood,
    groupPath:groupPath,
    groupText:groupText,
    grouptextFilter:grouptextFilter,
    mouseover:mouseover,
    mouseout:mouseout
};
function neighborhood() {//Länderbogen
    console.log("neighbor");
    modul._group = modul._svg.selectAll("g.group")
        .data(modul._layout.groups)
        .enter().append("svg:g")
        .attr("class", "group")
        .on("mouseover", mouseover)     //darüber fahren
        .on("mouseout", mouseout) ;    //darüber fahren

}
function groupPath() {//in länderbogen einsetzen
    modul._groupPath =  modul._group.append("path")
        .attr("id", function (d, i) {
            return "group" + i;
        })
        .attr("d", modul._arc)
        .style("fill", function (d, i) {//Farbe um Bogen
            return modul._color[i].color;
        });
}
function groupText() {//den länderbogen beschriften
    modul._groupText = modul._group.append("svg:text")
        .attr("x", modul._group_x)//6
        .attr("class", "supplier")
        .attr("dy", modul._group_dy);//bro15

    /*if (modul._EDA_csv_ = "csv/" + "Dummy_EDA.csv") {*/
        modul._groupText.append("svg:textPath")
            .attr("xlink:href", function (d, i) {
                return "#group" + d.index;
            })
            .text(function (d, i) {
                console.log(modul._supplier[i].key);
                return modul._supplier[i].key;
            });

            //return modul._ds_supplier[i].key;//Spaltenüberschriften
         // modul._ds_supplier[i].values[0].key ="EDA"
            // modul._ds_supplier[i].values[0].values = 20000(summe)

    function groupTicks(d) {
        var k = (d.endAngle - d.startAngle) / d.value;
        //tooltip
        modul._currentCost.push(d.value);
        return d3.range(0, d.value, 1000000).map(function (v, i) {
            return {
                angle: v * k + d.startAngle,
                label: i % modul._countDep != 0 ? null : v / 1000000 + "m"
            };//3// ///
        });
    }
   if (modul._countDep!=8) {
       var g = modul._svg.selectAll("g.group")
       var ticks = g.selectAll("g")
           .data(groupTicks)
           .enter().append("g")
           .attr("transform", function (d) {
               return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                   + "translate(" + modul._outerRadius + ",0)";
           });

       ticks.append("line")
           .attr("x1", 1)
           .attr("y1", 0)
           .attr("x2", 5)
           .attr("y2", 0)
           .style("stroke", "#000");

       ticks.append("text")
           .attr("x", 6)
           .attr("dy", ".35em")
           .attr("transform", function (d) {
               return d.angle > Math.PI ?
                   "rotate(180)translate(-16)" : null;
           })
           .style("text-anchor", function (d) {
               return d.angle > Math.PI ? "end" : null;
           })
           .text(function (d) {
               return d.label;
           });
   }
}
function grouptextFilter() {
    modul._groupText.filter(function (d, i) {
            return modul._groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength();
        })
        .remove();
}
/*function mouseover(d, i) {
    modul._chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
    })
    .style("opacity", 0.5)
    .transition();

}*/

function mouseover(d, i) {
    d3.select("#tooltip")
        .style("visibility", "visible")
        .html(modul._supplier[i].key + "<br>  "+
           modul._supplier[i].values[0]+ "<br>  "+
           modul._currentCost[i]
        )
        .style("top", function () { return (d3.event.pageY - 80)+"px"})
        .style("left", function () { return (d3.event.pageX - 130)+"px";})

    modul._chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
    });
}

function mouseout(d, i) {
    d3.select("#tooltip").style("visibility", "hidden")
    modul._chord.classed("fade", function(p) {
            return p.source.index != i
                && p.target.index != i;
        })
        .style("opacity", 0.5)
        .transition();
}



