var Accordion = {
  $container: $("body"),
  Height: 400,
  Width : 1500,
  imgWidth: 300,
  imgHeight: 200,
  minImgWidth: 40,
  imgCounter : 0,

  init: function($container){
    Accordion.$container = $container;
    sentimentHub.on('Data', Accordion.onData);
    sentimentHub.on('Done', Accordion.onDataDone);
    sentimentHub.fetch();
  },


  // Triggered when data for a particular network is available
  onData: function(network, data){

    var imgCount = Accordion.Width / Accordion.minImgWidth;

    $.each(data, function(key, item){
      // if (Accordion.imgCounter < imgCount){
            Accordion.imgCounter++;
            // Accordion.drawItem(network, item);            
            Accordion.drawItem(network, item);
            // let the library know we have used this item
            sentimentHub.markDataItemAsUsed(item);

            Accordion.playIfShared(item);

      // }
    });
  },

  makeExpandable : function($ul){
    
    xScale = d3.fisheye.scale(d3.scale.linear).domain([0, Accordion.Width]).range([0, Accordion.Width]);

      // var count = $accordionUl.children().size();
    $ul.mousemove(function( e ) {
      // console.log('pageX', e.pageX , 'limit', $ul.children().last().position().left);
      // if (e.pageX < $ul.children().last().position().left + Accordion.imgWidth/3){ //condition does not work because list items go on second row
        xScale.distortion(10).focus(e.pageX-$ul.position().left);
        $ul.children().each(function(index){
          var X1 = index*Accordion.minImgWidth;
          var X2 = (index+1)*Accordion.minImgWidth;
          // console.log(X1,X2);
          var newX1 = Math.floor(xScale(X1));
          var newX2 = Math.floor(xScale(X2));
          // console.log(X1,X2,newX1,newX2);
          $(this).width( Math.min(Accordion.imgWidth,Math.max(0,newX2 - newX1)));
        });
      // }
    });

  },


  // Triggered when we are done fetching data
  onDataDone: function(){
    var ulWidth = $("#accordion").width();
    $("#accordion").children("li").each(function(index){
      $(this).css('left', index*Accordion.minImgWidth);
      $(this).css('width', Accordion.minImgWidth);
    });
    Accordion.makeExpandable($( "#accordion" ));
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
    // create list item
    var $listItem = $('<li>')
    .css('left', Accordion.imgCounter*Accordion.minImgWidth)
    .css('width', Accordion.minImgWidth)
    .click(function(){
      player.play(item);
    });
    Accordion.imgCounter++;

    //create canvas
    var $canvas = $('<canvas height="' + Accordion.imgHeight + '" width="' + Accordion.imgWidth + '" style="border:1px solid black" id="canvas'+ item.id +'"/>');
    // draw image into canvas
    var img = new Image();
    img.src = item.image || item.thumb || item.profilePic;
    img.onload = function(){
      $canvas.get(0).getContext("2d").drawImage(img, 0, 0, Accordion.imgWidth, Accordion.imgHeight);
    };

    // create text box
    var $textDiv = $('<div>').addClass('info');
    $textDiv.html(item.textHtml);

    
    // put elements together
    $listItem.append($canvas);
    $listItem.append($textDiv);



    $("#accordion").append($listItem);

  }
}
