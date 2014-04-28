var Flyers = {
  $container: $("body"),

  init: function($container){
    console.log('creating flying images');
    Flyers.$container = $container;
    sentimentHub.on('Data', Flyers.onData);
    sentimentHub.on('Done', Flyers.onDataDone);
    sentimentHub.fetch();
  },

  // Triggered when data for a particular network is available
  onData: function(network, data){

  },

  // Triggered when we are done fetching data
  onDataDone: function(data){
    Flyers.drawFlyers(data);
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


  drawFlyers : function (data){
    console.log('flyers function');

    var $mainDiv = $('<div class="windy-demo"></div>');
    Flyers.$container.append($mainDiv);

    var $imgList = $('<ul id="wi-el" class="wi-container"></ul>');
    $mainDiv.append($imgList);

    for (var i = 0 ; i < data.length ; i++){
      var $imgItem = $('<li></li>').css("height","100%");
      var photo = data[i].image || data[i].thumb || data[i].profilePic;
      var $img = $("<img />").attr({src: photo});
      $imgItem.append($img);
      $imgItem.append($("<h4>" + data[i].contribName + "</h4>"));
      $imgItem.append($("<div></div>").html(data[i].textHtml)
      // .css("white-space","nowrap")
      // .css("width", "100%")  
          .css("height", "70px") // this needs to be dynamic
          .css("overflow","scroll")
      // .css("overflow", "hidden")
      // .css("text-overflow", "ellipsis"));
      );
      $imgItem.css('z-index', 200-i);
      if (i>=1){
        // $imgItem.css('display', 'inline');
        $imgItem.css('-webkit-transform', 'translateX(' + (200+(i-1)*50) + 'px) rotateY(-60deg)');
        $imgItem.css('display', 'inline');
      }
      $imgList.append($imgItem);
    }
    $navig = $("<nav>");
    $mainDiv.append($navig);
    $navig.append('<span id="nav-prev">prev</span>');
    $navig.append('<span id="nav-next">next</span>');


// <li><img src="images/demo1/1.jpg" alt="image1"/><h4>Coco Loko</h4><p>Total bicycle rights in blog four loko raw denim ex, helvetica sapiente odio placeat.</p></li>

        var $el = $( '#wi-el' ),
          windy = $el.windy(),
          allownavnext = false,
          allownavprev = false;

        $( '#nav-prev' ).on( 'mousedown', function( event ) {

          allownavprev = true;
          navprev();
        
        } ).on( 'mouseup mouseleave', function( event ) {

          allownavprev = false;
        
        } );

        $( '#nav-next' ).on( 'mousedown', function( event ) {

          allownavnext = true;
          navnext();
        
        } ).on( 'mouseup mouseleave', function( event ) {

          allownavnext = false;
        
        } );

        function navnext() {
          if( allownavnext ) {
            windy.next();
            setTimeout( function() {  
              navnext();
            }, 150 );
          }
        }
        
        function navprev() {
          if( allownavprev ) {
            windy.prev();
            setTimeout( function() {  
              navprev();
            }, 150 );
          }
        }
        /* example to add items
        setTimeout(function(){
          
          $el.prepend('<li><img src="images/demo1/3.jpg" alt="image1"/><h4>Coco Loko</h4><p>Total bicycle rights in blog four loko raw denim ex, helvetica sapiente odio placeat.</p></li>');

          // or:
          // $el.append('<li><img src="images/demo1/3.jpg" alt="image1"/><h4>Coco Loko</h4><p>Total bicycle rights in blog four loko raw denim ex, helvetica sapiente odio placeat.</p></li>');
          
          windy.update();

        },2000)
        */


  }

};