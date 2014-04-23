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
        console.log('bubble on data done');
        console.log(data);
        Bubble.drawBubbles(data);
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

    drawBubbles : function (data){
        console.log('darwbubbles function');

        var width = 960,
            height = 500

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        var force = d3.layout.force()
            .gravity(.05)
            .distance(100)
            .charge(-100)
            .size([width, height]);


        force.nodes(data)
            //.links(json.links)
            .start();

          // var link = svg.selectAll(".link")
          //     .data(json.links)
          //   .enter().append("line")
          //     .attr("class", "link");

          var node = svg.selectAll(".node")
              .data(data)
            .enter().append("g")
              .attr("class", "node")
              .call(force.drag);

          node.append("image")
              .attr("xlink:href", function(d) { return d.thumb; })
              .attr("x", -8)
              .attr("y", -8)
              .attr("width", 80)
              .attr("height", 80);

          node.append("text")
              .attr("dx", 12)
              .attr("dy", ".35em")
              .text(function(d) { return d.contribName; });

          node.on("click", function(d){
                    player.play(d);
                });

           force.on("tick", function() {
          //   link.attr("x1", function(d) { return d.source.x; })
          //       .attr("y1", function(d) { return d.source.y; })
          //       .attr("x2", function(d) { return d.target.x; })
          //       .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
          });
        }




    };

