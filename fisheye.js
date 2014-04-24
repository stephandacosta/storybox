var Fisheye = {
   $container: $("body"),

   init: function($container){
       console.log('creating fisheye');
       Fisheye.$container = $container;
       sentimentHub.on('Data', Fisheye.onData);
       sentimentHub.on('Done', Fisheye.onDataDone);
       sentimentHub.fetch();
   },

   // Triggered when data for a particular network is available
   onData: function(network, data){

   },

   // Triggered when we are done fetching data
   onDataDone: function(data){
       console.log('fisheye on data done');
       console.log(data);
       Fsheye.drawMosaic(data.slice(0,20));
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
       if ($networkDiv.length < 1) 
           $networkDiv = $("<div></div>").addClass("network").addClass(network)
               .append($("<h2></h2>").html(network))
               .appendTo(Example.$container);

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

   drawMosaic : function (data){

       var width = 960,
           height = 500,
          thumbr = 80,
          // centerRadius = Math.min(width/2-thumbr, height/2-thumbr);

       var svg = d3.select("body").append("svg")
           .attr("width", width)
           .attr("height", height);


        for (var i = 0 ; i < data.length ; i++){
            var rectangle = svgContainer.append("rect")
                .attr("x", i*width/data.length)
                .attr("y", 0)
                .attr("width", width/data.length)
                .attr("height", height/2);

            rectangle.append("clipPath")
               .attr("id", function(d) { return "rect" + d.index; })
               .append("rectangle")
                .attr("x", i*width/data.length);
                .attr("y", 0)
                .attr("width", width/data.length)
                .attr("height", height/2);

            rectangle.append("image")
                .attr("xlink:href", function(d) { return d.thumb; })
                .attr("clip-path", function(d) { return "url(#rect" + d.index + ")";})
                .attr("x", -50)
                .attr("y", -50)
                .attr("width", 100)
                .attr("height", 100);
        }



         // node.on("mouseover", function() {
         //   d3.select(this).transition()
         //     .style("fill", "white")
         //     .attr("r", 40)
         //     .attr("cx", 0)
         //     .attr("cy", 0)
         //   .duration(1000)
         //   .delay(100);

           // d3.select(this).append("text")
           //   .attr("dx", -20)
           //   .attr("dy", 30)
           //   .text(function(d) { return d.contribName; } );
         //});

         // node.on("click", function(d){
         //           player.play(d);
         //       });


   }




};