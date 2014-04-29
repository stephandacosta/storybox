var Flippers = {
  $container: $("body"),

  init: function($container){
    console.log('creating flipping images');
    Flippers.$container = $container;
    sentimentHub.on('Data', Flippers.onData);
    sentimentHub.on('Done', Flippers.onDataDone);
    sentimentHub.fetch();
  },

  // Triggered when data for a particular network is available
  onData: function(network, data){

  },

  // Triggered when we are done fetching data
  onDataDone: function(data){
    Flippers.drawFlippers(data.slice(0,40));
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


  drawFlippers : function (data){
    console.log('flippers function');

    // height=600;
    // width=1200;
    margin=2;
    border = 8;

    var $mainDiv = $('<div id="thumbsWrapper"></div>');
    // $mainDiv.css('width', width);
    // $mainDiv.css('height', height);
    Flippers.$container.append($mainDiv);

    var $thumbsContainer = $('<div id="thumbsContainer"></div>');
    $thumbsContainer.css("width", '5005px');
    $mainDiv.append($thumbsContainer);

    for (var i = 0; i<data.length ; i++){
      var $cardContainer = $('<div class="cardcontainer"></div>');
      // $cardContainer.css('width', (width)/5 - 2*border - 2*margin);
      // $cardContainer.css('height', (height)/4 - 2*border - 2*margin);
      $cardContainer.css('border-width', border);
      $cardContainer.css('margin', margin);
      var $card=$('<div class="card"></div>');
      var $front = $('<div class="face front"></div>');
      var $back = $('<div class="face back"></div>');

      // $cardContainer.on('hover', function(){
      //    var top=$(this).find('.back').offset().top;
      //    var left=$(this).find('.back').offset().left;
      //    console.log('top:',top,', left:', left);
      //    $(this).find('.back').css('top', top);
      //    $(this).find('.back').css('left', left);
      //    $(this).find('.back').css('position', 'absolute');
      //    $(this).find('.back').css('z-index', 1000);
      // });

      $card.append($front);
      $card.append($back);
      $cardContainer.append($card);
      $thumbsContainer.append($cardContainer);

      var photo = data[i].image || data[i].thumb || data[i].profilePic;
      $front.append(photo? $("<img />").attr({src: photo}) : '');

      $back.append($("<h4>" + data[i].contribName + "</h4>"));
      // $back.append($("<div></div>").html(data[i].textHtml)
      //     .css("overflow","scroll")
      // );

    }

      var $navig = $("<nav>");
      $('body').append($navig);
      var $navPrev = $('<button type="button" id="nav-prev">prev</span>');
      var $navNext = $('<button type="button" id="nav-next">next</span>');
      $navig.append($navPrev);
      $navig.append($navNext);

      $navNext.on('click', Flippers.moveRight);


// this is testing need to refactor a lot
           //Get our elements for faster access and set overlay width
      function makeScrollable($wrapper, $container, contPadding){
          //Get menu width
          var divWidth = $wrapper.width();
       
          //Remove scrollbars
          // $wrapper.css({
          //     overflow: 'hidden'
          // });
       
          //Find last image container
          var lastLi = $container.find('div:last-child'); // CHECK IF NEED TOCHANGE TO DIV FOR THE CARDCONTAINER
          $wrapper.scrollLeft(0);
          //When user move mouse over menu
          $wrapper.unbind('mousemove').bind('mousemove',function(e){
            console.log('pageX: ',e.pageX,'  scrollLeft:', $wrapper.scrollLeft(),'  %of width: ',($wrapper.scrollLeft()/$wrapper.width())); 
              //As images are loaded ul width increases,
              //so we recalculate it each time
              var ulWidth = lastLi[0].offsetLeft + lastLi.outerWidth() + contPadding;
       

              if (e.pageX > divWidth/4){
                var left = (e.pageX - $wrapper.offset().left) * (divWidth - ulWidth) / divWidth - divWidth/4;
              } else {
                var left = 0;
              }

              $wrapper.scrollLeft(left);
          });
      }
// this is testing need to refactor a lot

     makeScrollable($mainDiv,$thumbsContainer,15);

  },

  moveRight: function(){
    console.log('moving right');
    $(".cardcontainer").css('-webkit-transform', 'translateX('+((width)/5 + 2*border + 2*margin) +'px)');
    $(".cardcontainer").css('-webkit-transition', '2s');
  }

};