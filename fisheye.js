console.log('fisheye incorporated');

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
       Fisheye.drawMosaic(data.slice(0,50));
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

console.log("mosaic");

       var width = 1200;
       var height = 200;
       var thumbr = 80;
       var imgWidth =  (width-300) / data.length;
       var imgHeight =  height;


       var $mainDiv = $('<div class="mainDiv"></div>');
       $mainDiv.css("width",width);
       $mainDiv.css("height",height);
       $mainDiv.css("padding", 0);
       // $mainDiv.css("background-color", "black");
        $("body").append($mainDiv);


        for (var i = 0; i < data.length ; i++){
          // image container
           var $imgDiv = $('<div class="imgDiv"></div>');
           $imgDiv.css("float","left");
           $imgDiv.css("width",imgWidth);
           $imgDiv.css("height",height);
           $imgDiv.css("padding", 0);
           $imgDiv.css("overflow", "hidden");


           // image in container
           var $img = $('<img src="'+ data[i].thumb + '">');
           $img.css("position","absolute");
           $img.css("clip","rect(0px,100px,200px,50px)");
           $imgDiv.append($img);
           $imgDiv.mouseenter(function() {
             // $(this).prev().prev().prev().css("width",50);
             // $(this).prev().prev().prev().css("height",200);
             // $(this).prev().prev().css("width",100);
             // $(this).prev().prev().css("height",200);
             // $(this).prev().css("width",150);
             // $(this).prev().css("height",200);
             $(this).css("width",200);
             $(this).css("height",200);
             $(this).find('img').css("clip","auto");
             $(this).find('img').css("width",200);
             $(this).find('img').css("height",200);
           });
           $imgDiv.mouseleave(function() {
             $(this).css("width",imgWidth);
             $(this).find('img').css("clip","rect(0px,100px,200px,50px)");
           });
           $mainDiv.append($imgDiv);
        }
 
          // test to delete
          // $('body').append('<div class="mydiv">').append($('<img src="'+ data[0].thumb + '">'));
          //  console.log($('.mydiv'));

        //  // node.on("click", function(d){
        //  //           player.play(d);
        //  //       });


   }




};