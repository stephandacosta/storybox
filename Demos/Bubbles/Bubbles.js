var Bubble = {
  $container: $("body"),

  init: function($container){
    console.log('creating bubble');
    Bubble.$container = $container;
    sentimentHub.on('Data', Bubble.onData);
    sentimentHub.on('Done', Bubble.onDataDone);
    sentimentHub.fetch();
  },

  // Triggered when data for a particular network is available
  onData: function(network, data){

  },

  // Triggered when we are done fetching data
  onDataDone: function(data){
    Bubble.drawBubbles(data.slice(0,28));
  },

  playIfShared: function(item){
    var contentId = $.cookie("vgvidid");
    if (contentId && item.id == contentId){
      ga_events.sboxShareReferral(item.network, item.id);
      if (item.type != 'video'){
        player.hidePlayerMessage();
        player.play(item);
        ga_events.shareReferral('content:'+item.network, item.id);
        $.cookie("vgvidid", '', {
          expires: 0,
          domain: cookieDomain,
          path: '/'
        });
      }
    }
  },

  // draw the items as desired
  drawItem: function(network, item){
    // For this example I am creating a separate network div for each network data and
    // append the items to the network div...
    console.log('network', network);
    var $networkDiv = $("."+network, Example.$container);
    if ($networkDiv.length < 1) {
      $networkDiv = $("<div></div>").addClass("network").addClass(network)
      .append($("<h2></h2>").html(network))
      .appendTo(Example.$container);
    }

    console.log("Item:", item);

    // create a div and attach the raw item data so we can use it to open the player popup on click
    var photo = item.image || item.thumb || item.profilePic;
    $networkDiv.append(
      $("<div></div>").addClass("item") 
      .append(photo? $("<img />").attr({src: photo}) : '')
      .append($("<div></div>").addClass("info").html(item.text))
      .click(function(){
        player.play(item);
      })
      .data({item: item})
    );
  },

  // createHeaders : function(){
  //   var $inputwidth = $('<input type="text"></input>');
  //   var $inputheight = $('<input type="text"></input>');
  //   var $inputbackgroundcolor = $('<input type="text"></input>');
  //   var $inputthumbRadius = $('<input type="text"></input>');
  //   var $inputcenterRadius = $('<input type="text"></input>');
  //   var $inputstroke = $('<input type="text"></input>');

  //   var $minCentralLinksStrength = $('<input type="text"></input>');
  //   var $maxCentralLinksStrength = $('<input type="text"></input>');
  //   var $htmlBoxWidth = $('<input type="text"></input>');
  //   var $htmlBoxHeight = $('<input type="text"></input>');
  //   var $htmlBoxX = $('<input type="text"></input>');
  //   var $htmlBoxY = $('<input type="text"></input>');
  //   var $htmlBoxFontSize = $('<input type="text"></input>');


  // },

  drawBubbles : function (data){
    console.log('darwbubbles function');

    // console.log(data[1]);

    //parameters
    var width = 700;  // need to make reponsive
    var height = 500;  // need to make reponsive
    var backgroundcolor = "lavender";
    var thumbRadius = 40; // this is the radius on width of thumbnails
    var centerRadius = Math.min(width/2-thumbRadius, height/2-thumbRadius);
    var stroke = 5;

    var minCentralLinksStrength = 0;
    var maxCentralLinksStrength = 0;
    var htmlBoxWidth = 2*centerRadius*0.5;
    var htmlBoxHeight = 2*centerRadius*0.5;
    var htmlBoxX = -centerRadius*(0.5);
    var htmlBoxY = -centerRadius*(0.5);
    var htmlBoxFontSize = 16;


    var gravity = 0.32;
    var distance = 50;
    var charge = -1000;

    var centralLinksDistance = function(){
      return 2 * centerRadius * Math.random();
    };
    var distributedLinksDistance = function(){
      return thumbRadiusadius * 2;
    };
    var centralLinksStrength = function(){
      return Math.random() * (maxCentralLinksStrength - minCentralLinksStrength) + minCentralLinksStrength;
    };
    var distributedLinksStrength = function(){
      return 0.2;
    };

    //main container
    var svg = d3.select('#bubbleDiv').append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background-color","lavender");

    // var center = svg.append("circle")
    // .attr('cx', width/2)
    // .attr('cy', height/2)
    // .attr('r', centerRadius)
    // .attr('fill', 'black');

    // inject a first central element into data that all nodes will link to
    data.unshift({x: width/2, y:height/2, fixed:true});

    // force layout parametrization
    var force = d3.layout.force()
    .gravity(gravity)
    .distance(distance)
    .charge(charge)
    .size([width, height]);


  // Links arrays
    // links from center
    var centralLinks = [];
    for (var i = 1 ; i < data.length ; i++){
      centralLinks.push({source: data[0], target: data[i], distance: centerRadius});
    }
    // distributed links
    var contentLinks = [];
    for (var i = 1 ; i < data.length ; i++){
      for (var j = 1 ; j < data.length ; j++){
        contentLinks.push({source: data[i], target: data[j]});
      }
    }
    //concatentation of center and distributed links
    var allLinks = centralLinks.concat(contentLinks);

  /* *** test on getting links indexes (delete)
      console.log('object',allLinks[0].target);
      console.log('object.keys',Object.keys(allLinks[0].target));
      console.log('object.hasOwnProperty(index)',allLinks[0].target.hasOwnProperty('index'));
      console.log('object.index',allLinks[0].target.index);
  // end delete */

      // start should be called again whenever the nodes and links change again
    force.nodes(data)
    .charge(function(node){
      if (node.index === 0) {
        return 0;
      } else {
        return charge;
      }
    })
    // .linkDistance(function(link, index){
    //   if (link.source.index === 0) {
    //     return centralLinksDistance() ;
    //   } else {
    //     return distributedLinksDistance();
    //   }
    // })
    // .linkStrength(function(link, index){
    //     if (link.source.index === 0) {
    //       return centralLinksStrength();
    //     } else {
    //       return distributedLinksStrength();
    //     }
    // })
    .start();

    /* uncomment to create links in DOM
    var link = svg.selectAll(".link")
    .data(centralLinks)
    .enter().append("line")
    .attr("class", "link");
    $(".link").css("stroke", "black");
    */

    // create nodes in DOM
    var node = svg.selectAll(".node")
    .data(data)
    .enter().append("g")
    .attr("class", "node")
    .call(force.drag);

    var networkColors = {
      Youtube: "red",
      Twitter: "cyan",
      Instagram: "blue",
      VGVideo: "magenta",
      Photo: "green"
    };

    node.append("circle")
    .attr("class", "innercircle")
    .style("stroke", function(d) { return d.index===0? "transparent" : networkColors[d.network];})
    .style("stroke-width", stroke)
    .style("fill", function(d) {return d.index===0? "transparent" : "black";})
    .attr("r", thumbRadius)
    .attr("cx", 0)
    .attr("cy", 0);


    node.append("clipPath")
    .attr("id", function(d) { return "innerCircle" + d.index; })
    .attr("class", "clip")
    .append("circle")
    .attr("class", "clipcircle")
    .attr("r", thumbRadius-stroke/2)
    .attr("cx", 0)
    .attr("cy", 0);

    node.append("image")
    .attr("class","image")
    .attr("xlink:href", function(d) { return d.thumb; })
    .attr("clip-path", function(d) { return "url(#innerCircle" + d.index + ")";})
    .attr("x", -thumbRadius)
    .attr("y", -thumbRadius)
    .attr("width", thumbRadius*2)
    .attr("height", thumbRadius*2);

 

    node.on("mouseenter", function() {
      // work on central circle
      d3.select("circle").transition()
      .attr("r", centerRadius)
      .style("fill", "white")
      .style("z-index", 10)
      .duration(400)
      .delay(0);

      force
      .links(centralLinks)
      .charge(function(node){
        if (node.index === 0) {
          return 10*charge;
        } else {
          return charge;
        }
      })
      .linkDistance(function(link, index){
        if (link.source.index === 0) {
          return centerRadius * 1.1 ;
        } else {
          return distributedLinksDistance();
        }
      })
      .linkStrength(function(link, index){
          if (link.source.index === 0) {
            return 1;
          } else {
            return distributedLinksStrength();
          }
      })
      .start();
      
      // get text from moused enter
      d3.select(this).attr("text", function(d){return d.textHtml;});
      var msg = "<span class='t'>" + d3.select(this).attr("text") + "</span>";

      d3.select(".node").append("foreignObject")
      .attr("class", "centralHtml")
      .attr("width", htmlBoxWidth)
      .attr("height", htmlBoxHeight)
      .attr("x", htmlBoxX)
      .attr("y",htmlBoxY)
      .append("xhtml:body")
      .style("font", "1px 'Helvetica Neue'")
      .html(msg)
      .transition()
      .style("font-size", "16px")
      .duration(500)
      .delay(0);


      d3.select(this).select(".innercircle").transition()
      .attr("r", thumbRadius*3)
      .style("z-index", 10)
      .duration(500)
      .delay(0);

      d3.select(this).select(".clip").transition()
      .attr("r", thumbRadius*3)
      .style("z-index", 10)
      .duration(500)
      .delay(0);

      d3.select(this).select(".clipcircle").transition()
      .attr("r", thumbRadius*3)
      .style("z-index", 10)
      .duration(500)
      .delay(0);

      d3.select(this).select(".image").transition()
      .style("z-index", 10)
      .attr("width", thumbRadius*2*3)
      .attr("height", thumbRadius*2*3)
      .attr("x",-thumbRadius*3)
      .attr("y",-thumbRadius*3)
      .duration(500)
      .delay(0);

      // d3.select(this).append("text")
      //   .attr("dx", -20)
      //   .attr("dy", 30)
      //   .text(function(d) { return d.contribName; } );
    });

    node.on("mouseleave", function() {

      d3.select("circle").transition()
      .attr("r", thumbRadius)
      .style("fill", "transparent")
      .style("z-index", 5)
      .duration(500)
      .delay(0);

      force
      .links([])
      .charge(function(node){
        if (node.index === 0) {
          return 0;
        } else {
          return charge;
        }
      })
      .linkDistance(function(link, index){
        if (link.source.index === 0) {
          return centralLinksDistance() ;
        } else {
          return distributedLinksDistance();
        }
      })
      .linkStrength(function(link, index){
          if (link.source.index === 0) {
            return centralLinksStrength();
          } else {
            return distributedLinksStrength();
          }
      })
      .start();

      d3.selectAll(".centralHtml")
      .transition()
      .duration(400)
      .attr("width", 0)
      .attr("height", 0)
      .style("font", "0px 'Helvetica Neue'")
      .remove();


      d3.select(this).select(".innercircle").transition()
      .style("z-index", 5)
      .attr("r", thumbRadius)
      .duration(500)
      .delay(10);

      d3.select(this).select(".clip").transition()
      .style("z-index", 5)
       .attr("r", thumbRadius)
      .duration(500)
      .delay(10);

      d3.select(this).select(".clipcircle").transition()
      .style("z-index", 5)
      .attr("r", thumbRadius)
      .duration(500)
      .delay(10);

      d3.select(this).select(".image").transition()
      .style("z-index", 5)
      .attr("width", 100)
      .attr("height", 100)
      .attr("x",-50)
      .attr("y",-50)
      .duration(500)
      .delay(10);

    });


    // player configuration
    // $("#playerBox_container").css("-webkit-transform", "scale(0.4,0.4)");
    // $("#playerBox_container").css("top", height/2);
    // $("#playerBox_container").css("left", width/2);
    // $("#playerBox_container").css("position", "absolute");
    //  $("#playerBox_container").css("height", 200);



    // click event --> plays video
    node.on("click", function(d){
      player.play(d);
    });

    // time interval to enable continuous movement
    setInterval(function(){
      // force.alpha(0.1);
      node.attr("x", function(d){return d.x+Math.random()*5;})
      .attr("y", function(d){
        if (d.y >= height/2){
          return d.y-10;
        } else {
          return d.y+10;
        }
      });
    }, 200);


    force.on("tick", function() {

      /* uncomment to show links - links repositionning
      link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
      */

      // circles repositionning
      node.attr("cx", function(d) { 
        if (d.index === 0 ){
          return d.x = (width/2);
        } else {
          return d.x = Math.max(thumbRadius+5, Math.min(width-thumbRadius-5, d.x));
        }
      });
      node.attr("cy", function(d) { 
        if (d.index === 0 ){
          return d.y = (height/2);
        } else {
          return d.y = Math.max(thumbRadius+5, Math.min(height-thumbRadius-5, d.y));
        }
      });
      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    });

  }

};