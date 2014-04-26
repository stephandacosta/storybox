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

    var colors = d3.scale.category10();
    
    SimpleBubble = function(d, id, c) {
      this.data = d;
      this.id = id;
      this.canvas = c;
      this.el = null;
      this.x = 0;
      this.y = 0;
      this.radius = 0;
      this.boxSize = 0;
      this.isDragging = false;
      this.isSelected = false;
      this.tooltip = null;

      this.init();
    };

    SimpleBubble.prototype.init = function() {
      /* Elements that make up the bubbles display*/
      this.el = $("<div class='bubble' id='bubble-" + this.id + "'></div>");
      this.elFill = $("<div class='bubbleFill'></div>");
      this.el.append(this.elFill);

      /* Attach mouse interaction to root element */
      /* Note use of $.proxy to maintain context */
      // this.el.on('mouseover', $.proxy(this.showToolTip, this));
      // this.el.on('mouseout', $.proxy(this.hideToolTip, this));


      /* Set CSS of Elements  */
      this.radius = this.data;
      this.boxSize = this.data * 2;

      this.elFill.css({
        width: this.boxSize,
        height: this.boxSize,
        left: -this.boxSize / 2,
        top: -this.boxSize / 2,
        "background-color": colors(this.data)});
    };

    SimpleBubble.prototype.showToolTip = function() {
      // var toolWidth = 40;
      // var toolHeight = 25;
      // this.tooltip =  $("<div class='tooltip'></div>");
      // this.tooltip.html("<div class='tooltipFill'><p>" + this.data + "</p></div>");
      // this.tooltip.css({
      //   left: this.x + this.radius /2,
      //   top: this.y + this.radius / 2
      //   });
      // this.canvas.append(this.tooltip);
    };

    SimpleBubble.prototype.hideToolTip = function() {
      // $(".tooltip").remove();
    };

    SimpleBubble.prototype.move = function() {
      this.el.css({top: this.y, left:this.x});
    };

    SimpleVis = function(container,d) {
      this.width = 800;
      this.height = 400;
      this.canvas = container;
      this.data = d;
      this.force = -100;
      this.bubbles = [];
      this.nlinks = []
      this.centers = [
      {x: 200, y:200},
      {x: 400, y:200},
      {x: 600, y:200}
      ];

      this.bin = d3.scale.ordinal().range([0,1,2]);

      this.bubbleCharge = function(d) {
        return -Math.pow(d.radius,1) * 50;
      };

      this.init();
    };

    SimpleVis.prototype.init = function() {
      /* Store reference to original this */
      var me = this;

      /* Initialize root visualization element */
      this.canvas.css({
        width: this.width,
        height: this.height,
        "background-color": "#eee",
        position: "relative"});

      /* Create Bubbles */
      for(var i=0; i< this.data.length; i++) {
        var b = new SimpleBubble(this.data[i], i, this.canvas);
        /* Define Starting locations */
        if (b.index===0){
          b.x = this.width/2;
          b.y = this.height/2;
        } else {
          b.x = b.boxSize + (20 * (i+1));
          b.y = b.boxSize + (10 * (i+1));
        }
        this.bubbles.push(b);
        /* Add root bubble element to visualization */
        this.canvas.append(b.el);
      }

      for (var i = 1; i<this.data.length; i++) {
        // for (var j = 0 ; j < this.data.length ; j++){
          this.nlinks.push({source:0, target:i, distance: 200});
        // }
      }


      /* Setup force layout */
      this.force = d3.layout.force()
        .nodes(this.bubbles)
        .links(this.nlinks)
        .linkStrength(0.2)
        .gravity(0.3)
        .charge(this.bubbleCharge)
        .friction(0.87)
        .size([this.width, this.height])
        .on("tick", function(e) {
          me.bubbles.forEach( function(b) {
            // me.setBubbleLocation(b, e.alpha, me.centers);
            b.move();
          });
        });

      this.force.start();

      d3.select("body").on("mouseup", this.force.start);

      // dragging
      var thatforce = this.force;
      var dragmove = function() {

        $(this).css({top: d3.event.y, left:d3.event.x});
        // thatforce.tick();
      };
      var drag = d3.behavior.drag().on("drag", dragmove);
      d3.select("body").selectAll(".bubble").call(drag);


    };


    SimpleVis.prototype.setBubbleLocation = function(bubble, alpha, centers) {
      var center = centers[this.bin(bubble.id)];
      bubble.y = bubble.y + (center.y - bubble.y) * (0.115) * alpha;
      bubble.x = bubble.x + (center.x - bubble.x) * (0.115) * alpha;
    };


      var vis = new SimpleVis($("body"), [12,33,20,40,60,10,25,44,13,23,14,25,8]);

      $("#move").on("click", function(e) {
        vis.bin.range(vis.bin.range().reverse());
        vis.force.resume();
        return false;
      });



  }

};