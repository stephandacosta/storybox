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
    Bubble.drawBubbles(data.slice(0,30));
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

  drawBubbles : function (data){
    console.log('darwbubbles function');

    //parameters
    var width = 960;  // need to make reponsive
    var height = 500;  // need to make reponsive
    var thumbr = 40; // this is the radius on width of thumbnails
    var centerRadius = Math.min(width/2-thumbr, height/2-thumbr);

    var gravity = 0.3;
    var distance = 50;
    var charge = -1000;


    //main container
    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

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


    // to create links between center and everynode
    var centralLinks = [];
    for (var i = 1 ; i < data.length ; i++){
      centralLinks.push({source: data[0], target: data[i], distance: centerRadius});
    }

    var contentLinks = [];
    for (var i = 1 ; i < data.length ; i++){
      for (var j = 1 ; j < data.length ; j++){
        contentLinks.push({source: data[i], target: data[j]});
      }
    }

    var allLinks = centralLinks.concat(contentLinks);
    // for (var k = 0 ; k< allLinks.length ; k++){
      // console.log('[source:',allLinks[0].source,'- target:', allLinks[0].target,']');
      console.log('object',allLinks[0].target);
      console.log('object.keys',Object.keys(allLinks[0].target));
      console.log('object.hasOwnProperty(index)',allLinks[0].target.hasOwnProperty('index'));
      console.log('object.index',allLinks[0].target.index);
      // console.log(typeof arr[0].target['_used']);
     // }

      // start should be called again whenever the nodes and links change again
      force.nodes(data)
          .links(centralLinks)
          .linkDistance(function(link, index){
              if (link.source.index === 0) {
                return centerRadius * (1+Math.random()) ;
              } else {
                return thumbr * 4;
              }
          })
          .linkStrength(function(link, index){
              if (link.source.index === 0) {
                return Math.max(Math.random(),0.5);
              } else {
                return 0.2;
              }
          })
          .start();


        var link = svg.selectAll(".link")
          .data(centralLinks)
          .enter().append("line")
          .attr("class", "link");

        // $(".link").css("stroke", "black");

         var node = svg.selectAll(".node")
             .data(data)
           .enter().append("g")
             .attr("class", "node")
             .call(force.drag);



         color = "#33CCFF";
         node.append("circle")
             .attr("class", "outercircle")
             .style("fill", function(d) {
               if (d.network === "Youtube") {
                 return "red";
               } else if (d.network === "Twitter") {
                 return "cyan";
               } else if (d.network === "Instagram") {
                 return "blue";
               } else if (d.network === "VGVideo") {
                 return "magenta";
               } else if (d.network === "Photo") {
                 return "green";
               }
             })
             .attr("r", 45)
             .attr("cx", 0)
             .attr("cy", 0);

         node.append("circle")
             .attr("class", "innercircle")
             .style("fill", "black")
             .attr("r", thumbr)
             .attr("cx", 0)
             .attr("cy", 0);


         node.append("clipPath")
             .attr("id", function(d) { return "innerCircle" + d.index; })
             .attr("class", "clip")
             .append("circle")
             .attr("class", "clipcircle")
             .attr("r", thumbr)
             .attr("cx", 0)
             .attr("cy", 0);

         node.append("image")
             .attr("class","image")
             .attr("xlink:href", function(d) { return d.thumb; })
             .attr("clip-path", function(d) { return "url(#innerCircle" + d.index + ")";})
             .attr("x", -50)
             .attr("y", -50)
             .attr("width", 100)
             .attr("height", 100);


         node.on("mouseenter", function() {
          console.log("mouseover");

           console.log(this);

           d3.select(this).select(".outercircle").transition()
             .attr("r", thumbr*3)
             .style("z-index", 10)
            .duration(500)
           .delay(0);

           d3.select(this).select(".innercircle").transition()
           .attr("r", thumbr*3)
           .style("z-index", 10)
           .duration(500)
           .delay(0);

           d3.select(this).select(".clip").transition()
             .attr("r", thumbr*3)
            .style("z-index", 10)
           .duration(500)
           .delay(0);

           d3.select(this).select(".clipcircle").transition()
           .attr("r", thumbr*3)
          .style("z-index", 10)
           .duration(500)
           .delay(0);

           d3.select(this).select(".image").transition()
          .style("z-index", 10)
           .attr("width", 300)
          .attr("height", 300)
          .attr("x",-150)
          .attr("y",-150)
           .duration(500)
           .delay(0);


           // d3.select(this).append("text")
           //   .attr("dx", -20)
           //   .attr("dy", 30)
           //   .text(function(d) { return d.contribName; } );
         });

          node.on("mouseleave", function() {
          console.log("mouseleave");
           d3.select(this).select(".outercircle").transition()
            .style("z-index", 5)
             .attr("r", thumbr)
           .duration(1000)
           .delay(10);

           d3.select(this).select(".innercircle").transition()
           .style("z-index", 5)
           .attr("r", thumbr)
           .duration(1000)
           .delay(10);

           d3.select(this).select(".clip").transition()
           .style("z-index", 5)
             .attr("r", thumbr)
           .duration(1000)
           .delay(10);

           d3.select(this).select(".clipcircle").transition()
           .style("z-index", 5)
           .attr("r", thumbr)
           .duration(1000)
           .delay(10);

           d3.select(this).select(".image").transition()
           .style("z-index", 5)
           .attr("width", 100)
          .attr("height", 100)
          .attr("x",-50)
          .attr("y",-50)
           .duration(1000)
           .delay(10);


           // d3.select(this).append("text")
           //   .attr("dx", -20)
           //   .attr("dy", 30)
           //   .text(function(d) { return d.contribName; } );
         });



           $("#playerBox_container").css("-webkit-transform", "scale(0.4,0.4)");
           $("#playerBox_container").css("top", height/2);
          $("#playerBox_container").css("left", width/2);
           $("#playerBox_container").css("position", "absolute");
          //  $("#playerBox_container").css("height", 200);
 



         node.on("click", function(d){
                   player.play(d);
               });

        setInterval(function(){
          console.log("moving");
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
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });


          node.attr("cx", function(d) { 
            if (d.index === 0 ){
              return d.x = (width/2);
            } else {
              return d.x = Math.max(thumbr+5, Math.min(width-thumbr-5, d.x));
            }
          });


          node.attr("cy", function(d) { 
            if (d.index === 0 ){
              return d.y = (height/2);
            } else {
              return d.y = Math.max(thumbr+5, Math.min(height-thumbr-5, d.y));
            }
          });





          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });



       }




   };