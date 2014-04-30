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

  },

  // draw the items as desired
  drawItem: function(network, item){

  },


  drawFlippers : function (data){
    console.log('flippers function');

    var $mainDiv = $('<div id="thumbsWrapper"></div>');
    $mainDiv.css('width', window.innerWidth);
    Flippers.$container.append($mainDiv);
    var $thumbsContainer = $('<div id="thumbsContainer"></div>');
    $mainDiv.append($thumbsContainer);

    // card dimensions
    var cardInnerWidth = 100;
    var cardMargin = 2;
    var cardBorder = 8;
    var cardWidth = cardInnerWidth+2*cardMargin+2*cardBorder;
    var thumbCount = Math.floor(window.innerWidth/cardWidth)-3;

    for (var i = 0; i<data.length ; i++){

      //construct card container
      var $cardContainer = $('<div class="cardcontainer"></div>');
      $cardContainer.css('width', cardInnerWidth);
      $cardContainer.css('border-width', cardBorder);
      $cardContainer.css('margin', cardMargin);
      if (i > thumbCount){
        $cardContainer.css('display', 'none');
        $cardContainer.addClass('hiddenleft');
      } else {
        $cardContainer.css('left', cardWidth * (thumbCount-i));
      }

      //construct card
      var $card=$('<div class="card"></div>');
      var $front = $('<div class="face front"></div>');
      var photo = data[i].image || data[i].thumb || data[i].profilePic;
      $front.append(photo? $("<img />").attr({src: photo}) : '');
      var $back = $('<div class="face back"></div>');
      $back.append($("<h4>" + data[i].contribName + "</h4>"));
      // $back.append($("<div></div>").html(data[i].textHtml)
      //     .css("overflow","scroll")
      // );

      //build card
      $card.append($front);
      $card.append($back);
      $cardContainer.append($card);
      $thumbsContainer.prepend($cardContainer);

    }

    // put navigation button (temporary)
    var $navig = $("<nav>");
    $('body').append($navig);
    var $navPrev = $('<button type="button" id="nav-prev">prev</span>');
    var $navNext = $('<button type="button" id="nav-next">next</span>');
    $navig.append($navPrev);
    $navig.append($navNext);
    $navPrev.on('click', function(){
      slideLeft(cardWidth, thumbCount);
    });
    $navNext.on('click', function(){
      slideRight();
    });

    // execute scroll on mouse move
    makeScrollable($mainDiv,$thumbsContainer,15, cardWidth, thumbCount);

  }

};


// this is testing need to refactor a lot
           //Get our elements for faster access and set overlay width
  var makeScrollable = function ($wrapper, $container, contPadding, cardWidth, thumbCount){

      var divWidth = $wrapper.width();

      $wrapper.scrollLeft(0);


      var mouseEnabled = true;
      //When user move mouse over menu
      $wrapper.unbind('mousemove').bind('mousemove',function(e){
        // console.log('pageX: ',e.pageX,'  scrollLeft:', $wrapper.scrollLeft(),'  %of width: ',($wrapper.scrollLeft()/$wrapper.width())); 
          //As images are loaded ul width increases,
          //so we recalculate it each time
          // var ulWidth = lastLi[0].offsetLeft + lastLi.outerWidth() + contPadding;
   

          if (e.clientX > window.innerWidth*0.75){
            if (mouseEnabled){
              $wrapper.unbind('mousemove');
              setTimeout(function(){
                mouseEnabled = true;
                makeScrollable($wrapper, $container, contPadding, cardWidth, thumbCount);
              },200);
              mouseEnabled = false;
              slideRight(cardWidth, thumbCount);
            }
          }

          if (e.clientX < window.innerWidth*0.25){
            if (mouseEnabled){
              $wrapper.unbind('mousemove');
              setTimeout(function(){
                mouseEnabled = true;
                makeScrollable($wrapper, $container, contPadding, cardWidth, thumbCount);
              },200);
              mouseEnabled = false;
              slideLeft(cardWidth, thumbCount);
            }
          }

          // $wrapper.scrollLeft(left);
          // slideUpFirst(left);
      });
  };

  var slideRight = function(cardWidth){

    if ($('.hiddenleft').size() > 0 ){
      //move visible cards right
      $( ".cardcontainer" ).filter(":visible").animate({
        left: "+=120"
      }, {
        duration: 200, 
        easing: "swing"
      });
      //hide 3 cards out
      $( ".cardcontainer" ).not('.hiddenright').filter(":visible").last().addClass('hiddenright').slideUp(200);
      //slide 3 hidden cards down
      $('.hiddenleft').last().css('left',0).slideDown(200).removeClass('hiddenleft');
    }
  };

  var slideLeft = function(cardWidth, thumbCount){
    if ($('.hiddenright').size() > 0 ){
      //hide 3 cards out
      $( ".cardcontainer" ).not('.hiddenleft').filter(":visible").first().addClass('hiddenleft').slideUp(200);
      //move visible cards left
      $( ".cardcontainer" ).filter(":visible").animate({
        left: "-=120"
      }, {
        duration: 200, 
        easing: "swing"
      });
      //slide 3 hidden cards down
      console.log('should slide down');
      $('.hiddenright').first().css('left',(thumbCount)*120).removeClass('hiddenright').slideDown(200);
    }
  };


