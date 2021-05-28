$(document).ready(function pageLoad() {
    //canvas get
    var canvas = document.getElementById("myCanvas");
    //drawing tool for #myCanvas
    var ctx = canvas.getContext("2d");
    canvas.width = 70;
    canvas.height = 70;
    var ballRadius = 15;
    var ballColor = "red";

    $("#story").click(function() {
        $("#option").css("display", "none");
        $("#createball").css("display", "block");
        $("#goMain").css("display", "block");
        draw();
    })
    $("#timeattack").click(function () {
        window.location.replace("brickout.html");
    })
    $("#goMain").on("click", function() {
        $("#option").css("display", "block");
        $("#createball").css("display", "none");
        $("#goMain").css("display", "none");
    })
    $("#ballsmall").on("click", function() {
        if(ballRadius > 10) {
            ballRadius -= 1;
        }
    })
    $("#ballbig").on("click", function() {
        if(ballRadius < 20) {
            ballRadius += 1;
        }
    })
    $("#box1").on("click", function() {
        ballColor = "red";
    })
    $("#box2").on("click", function() {
        ballColor = "orange";
    })
    $("#box3").on("click", function() {
        ballColor = "yellow";
    })
    $("#box4").on("click", function() {
        ballColor = "green";
    })
    $("#box5").on("click", function() {
        ballColor = "blue";
    })
    $("#box6").on("click", function() {
        ballColor = "#000080";
    })
    $("#box7").on("click", function() {
        ballColor = "purple";
    })
    $("#storystart").on("click", function() {
        localStorage.setItem('ballRadius', ballRadius);
        localStorage.setItem('ballColor', ballColor);
        window.location.replace("story0.html");
    })

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall();
        requestAnimationFrame(draw);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, ballRadius, 0, Math.PI * 8);
        ctx.fillStyle = ballColor;
        ctx.fill();
        ctx.closePath();
    }
})