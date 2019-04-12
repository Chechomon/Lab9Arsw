var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var drawId=null;

    var addPointToCanvas = function (point) {

            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.stroke();

    };

    var addPolygonToCanvas = function (points) {
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(points[0].x, points[0].y, 3, 0, 2 * Math.PI);
            ctx.moveTo(points[0].x,points[0].y);
            for(var i=1;i<points.length;i++){
                ctx.lineTo(points[i].x,points[i].y);
                ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI);
            }
            ctx.fillStyle = '#f00';
            ctx.fill();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


     var connectAndSubscribe = function (id) {

            drawId=id;
            console.info('Connecting to WS...');
            var socket = new SockJS('/stompendpoint');
            stompClient = Stomp.over(socket);


            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/newpoint.'+drawId, function (eventbody) {
                     var point=JSON.parse(eventbody.body);
                     addPointToCanvas(point);

                });
                stompClient.subscribe('/topic/newpolygon.'+drawId, function (eventbody) {
                     var points=JSON.parse(eventbody.body);
                     addPolygonToCanvas(points);

                 });
            });

      };

     var publishPoint= function(pt){
                 if(drawId!=null){

                 addPointToCanvas(pt);
                 sendPoint(pt);
                 }else{alert("Please select a draw id")}

                 //publicar el evento
             };


    var sendPoint = function (pt) {

            stompClient.send("/app/newpoint."+drawId, {}, JSON.stringify(pt));

    };
    
    

    return {

        init: function (id) {
             var can = document.getElementById("canvas");
            connectAndSubscribe(id);
            can.addEventListener("mousedown", function(e){
                    pt=getMousePosition(e);
                    publishPoint(pt);
            });
            $("#subscribeBtn").prop("disabled",true);

        },





        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();