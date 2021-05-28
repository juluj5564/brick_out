$(document).ready(function pageLoad() {
    //canvas get
    var canvas = document.getElementById("myCanvas");
    //drawing tool for #myCanvas
    var ctx = canvas.getContext("2d");
    var clickcheck = true;

    $("#ad").hide();
    var a = document.getElementById("ad");
	
    $("body").keypress(function(e) {
        if(e.keyCode == 97) {
            a.play(); //press a
        }
        else if(e.keyCode == 115) {
            a.pause();
            a.currentTime = 0;  //press s
        }
    })

    function playGame() {
        canvas.width = 600;
        canvas.height = 700;
        //intial position for ball
        var x = canvas.width / 2;
        var y = canvas.height - 30;

        var xSpeed=2;
        var ySpeed=-2;
        var dx = xSpeed;
        var dy = ySpeed;
        
        var ballRadius = parseInt(localStorage.getItem('ballRadius'));
        var titleHeight = 20;

        //paddleBar
        var paddleWidth = 80;
        var paddleHeight = 10;
        var paddleX = (canvas.width - paddleWidth) / 2;

        //brick infos
        var brickRowCount = 5;
        var brickColumnCount = 5;
        var brickWidth = 80;
        var brickHeight = 30;
        var brickPadding = 10;
        var brickOffsetTop = 50;
        var brickOffsetLeft = 75;

        //score & lives
        var score = 0;
        var lives = 3;
        var totalScore=0;

        //making object bricks
        var thickness = 1;
        var bricks = [];
         for(var c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for(var r = 0; r < brickRowCount; r++) {
                if((c%2==1)&&(r%2==0)||(c%2==0)&&(r%2==1)){
                    bricks[c][r] = {x: 0, y: 0, status:thickness-1};
                    totalScore=totalScore+thickness-1;
                }else{
                    bricks[c][r] = {x: 0, y: 0, status:thickness};
                    totalScore=totalScore+thickness;
                }
            }
        }

       //brickImage
        var brickImage = [];
        for(var i=0;i<5;i++){
         brickImage[i]= new Image();
         brickImage[i].src="stage"+(i+1)+".png";
        }
        //paddleImage
        var paddleImage = new Image();
        paddleImage.src = "paddle.png";

        var ballImage = new Image();
        ballImage.src=""

        var check_flag = null;

        document.addEventListener("mousemove", mouseMoveHandler, false);

        draw();

        function mouseMoveHandler(e) {
            var relativeX = e.clientX - canvas.offsetLeft;
            if(relativeX > paddleWidth / 2 - 10 && relativeX + paddleWidth / 2 -10 < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        }

        var sticky=1;
        var countClick=0;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawPaddle();
            if(sticky==1){
                stickyBall();
                $(document).click( function(){
                    if(clickcheck) {
                        a.play();
                        clickcheck = false;
                    }
                    
                    if(countClick==0){
                        countClick=1;
                        stickyBall();
                        collisionDetection();
                        moveBall();
                        sticky=0;
                        x=paddleX+40;
                        y=canvas.height - paddleHeight-ballRadius;
                    }
                });
            }else{
                drawBall();
                collisionDetection();
                moveBall();
            }
            
            $("#score_2_num").empty();
            $("#score_2_num").append(score);
            $("#lives_num").empty();
            $("#lives_num").append(lives);

            $("body").keypress(function(e) {
                if(e.keyCode == 98) {
                    score = totalScore - 1;
                }
            })
            //var ball=setInterval(draw,10);
            requestAnimationFrame(draw);   
        }

        var ballColor=localStorage.getItem('ballColor');
        function stickyBall() {
            ctx.beginPath();
            ctx.arc(paddleX+40, canvas.height - paddleHeight-ballRadius, ballRadius, 0, Math.PI * 8);
            ctx.fillStyle = ballColor;
            ctx.fill();
            ctx.closePath();
        }

        function drawPaddle() {
            ctx.beginPath();
            ctx.drawImage(paddleImage, paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 8);
            ctx.fillStyle = ballColor;
            ctx.fill();
            ctx.closePath();
        }

        function drawBricks() {
            for(var c = 0; c < brickColumnCount; c++) {
                for(var r = 0; r < brickRowCount; r++) {
                    if(bricks[c][r].status > 0) {
                        var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                        var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();                        
                        if(bricks[c][r].status==5){
                            ctx.drawImage(brickImage[4],brickX, brickY, brickWidth, brickHeight);
                        }else if(bricks[c][r].status==4){
                            ctx.drawImage(brickImage[3],brickX, brickY, brickWidth, brickHeight);
                        }else if(bricks[c][r].status==3){
                            ctx.drawImage(brickImage[2],brickX, brickY, brickWidth, brickHeight);
                        }else if(bricks[c][r].status==2){
                            ctx.drawImage(brickImage[1],brickX, brickY, brickWidth, brickHeight);
                        }else if(bricks[c][r].status==1){
                           ctx.drawImage(brickImage[0],brickX, brickY, brickWidth, brickHeight);
                        }
                        
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        }

        function moveBall() {
            if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
                dx = -dx;
                check_flag = null;
            }
            if(y + dy < ballRadius) {
                dy = -dy;
                check_flag = null;
            }
            else if(y + dy > canvas.height - ballRadius - paddleHeight) {
                if(x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                }
                else {
                    //추가로 넣은 sticky와 countClick초기화
                    sticky=1;
                    countClick=0;
                    lives--;
                    if(!lives&&score<totalScore) {
                        alert("GAME OVER\n* 졸업 학점: 0.5");
                        window.location.replace("start.html");
                        //window.location.replace("brickout.html");
                    }
                    else {
                        x = canvas.width / 2;
                        y = canvas.height - 30;
                        dx = xSpeed;
                        dy = ySpeed;
                        paddleX = (canvas.width - paddleWidth) / 2;
                    }
                }
                check_flag = null;
            }
            x += dx;
            y += dy;
        }

        function collisionDetection() {
            for(var c=0; c<brickColumnCount; c++) {
                for(var r=0; r<brickRowCount; r++) {
                    var b = bricks[c][r];
                    if(b.status > 0) {
                        if((x > b.x && x < b.x + brickWidth && y + ballRadius > b.y && y + ballRadius < b.y + brickHeight)
                        || (x > b.x && x < b.x + brickWidth && y - ballRadius > b.y && y - ballRadius < b.y + brickHeight)) {
                            if(check_flag == b) {
                                continue;
                            }
                            dy = -dy;
                            b.status--;
                            score++;
                            if(score == totalScore) {
                                alert("과제 만점!\n* 현재 학점: 1.5");
                                window.location.replace("story1.html");
                            }
                            check_flag = b;
                        }
                        if((x + ballRadius > b.x && x + ballRadius < b.x + brickWidth && y > b.y && y < b.y + brickHeight)
                        || (x - ballRadius > b.x && x - ballRadius < b.x + brickWidth && y > b.y && y < b.y + brickHeight)) {
                            if(check_flag == b) {
                                continue;
                            }
                            dx = -dx;
                            b.status--;
                            score++;
                            if(score == totalScore) {
                                alert("과제 만점!\n* 현재 학점: 1.5");
                                window.location.replace("story1.html");
                            }
                            check_flag = b;
                        }
                    }
                }
            }
        }

    }

    playGame();
})