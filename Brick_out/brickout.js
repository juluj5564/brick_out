window.onload = pageLoad;
function pageLoad() {
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	function playGame() {
		canvas.width = 600;
		canvas.height = 360;
		// ball의 시작 위치가 x, y
		var x = canvas.width / 2;
		var y = canvas.height - 30;
		// ball의 움직임 속도 dx, dy
		var dx = 3;
		var dy = -3;
		var ballRadius = 10;
		// 맨 위에 적혀있을 lives, level 명 등의 height 값.
		var titleHeight = 20;

		// paddle 바의 height, width
		var paddleHeight = 10;
		var paddleWidth = 80;
		var paddleX = (canvas.width - paddleWidth) / 2;

		var brickRowCount = 5;
		var brickColumnCount = 3;
		var brickWidth = 80;
		var brickHeight = 30;
		var brickPadding = 10;
		var brickOffsetTop = 50;
		var brickOffsetLeft = 50;

		var score = 0;
		var lives = 3;

		var bricks = [];
		for(var c = 0; c < brickColumnCount; c++) {
			bricks[c] = [];
			for(var r = 0; r < brickRowCount; r++) {
				bricks[c][r] = {x:0, y:0, status:3};
			}
		}

		// 같은 벽돌에 여러번 충돌되어 사라지는 버그(?) 체크하는 변수.
		var check_flag = null;

		document.addEventListener("mousemove", mouseMoveHandler, false);

		create_canvas();
		draw();

		function mouseMoveHandler(e) {
			var relativeX = e.clientX - canvas.offsetLeft;
			if(relativeX > paddleWidth / 2 - 10 && relativeX + paddleWidth / 2 - 10 < canvas.width) {
				paddleX = relativeX - paddleWidth / 2;
			}
		}

		function create_canvas() {
			ctx.beginPath();
			ctx.rect(20, 40, 50, 50);
			ctx.fillStyle = "#FF0000";
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.arc(240, 160, 20, 0, Math.PI*2, false);
			ctx.fillStyle = "green";
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.rect(160, 10, 100, 40);
			ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
			ctx.stroke();
			ctx.closePath();
		}

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBricks();
			drawBall();
			drawPaddle();
			drawScore();
			drawLives();
			collisionDetection();

			if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
				dx = -dx;
				check_flag = null;
			}
			if(y + dy < ballRadius + titleHeight) {
				dy = -dy;
				check_flag = null;
			}
			else if(y + dy > canvas.height - ballRadius - paddleHeight) {
				if(x > paddleX && x < paddleX + paddleWidth) {
					dy = -dy;
				}
				else {
					lives--;
					if(!lives) {
						alert("GAME OVER");
						document.location.reload();
					}
					else {
						x = canvas.width / 2;
						y = canvas.height - 30;
						dx = 3;
						dy = -3;
						paddleX = (canvas.width - paddleWidth) / 2;
					}
				}
				check_flag = null;
			}

			x += dx;
			y += dy;
			requestAnimationFrame(draw);
		}

		function collisionDetection() {
			for(var c = 0; c < brickColumnCount; c++) {
				for(var r = 0; r < brickRowCount; r++) {
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
							if(score == brickRowCount * brickColumnCount * 3) {
								alert("YOU WIN, CONGRATS!");
								document.location.reload();
							}
							check_flag = b;
						}
						if ((x + ballRadius > b.x && x + ballRadius < b.x + brickWidth && y > b.y && y < b.y + brickHeight)
							|| (x - ballRadius > b.x && x - ballRadius < b.x + brickWidth && y > b.y && y < b.y + brickHeight)) {
							if(check_flag == b) {
								continue;
							}
							dx = -dx;
							b.status--;
							score++;
							if(score == brickRowCount * brickColumnCount * 3) {
								alert("YOU WIN, CONGRATS!");
								document.location.reload();
							}
							check_flag = b;
						}
					}
				}
			}
		}

		// Ball 그리는 함수.
		// 컨셉에 맞는 사진으로 대체하여 수행해야함.
		function drawBall() {
			ctx.beginPath();
			ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#0095DD";
			ctx.fill();
			ctx.closePath();
		}

		// 아래 공을 튀길 패들(바) 그리는 함수.
		function drawPaddle() {
			ctx.beginPath();
			ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
			ctx.fillStyle = "#0095DD";
			ctx.fill();
			ctx.closePath();
		}

		// 벽돌 그리는 함수.
		function drawBricks() {
			for(var c = 0; c < brickColumnCount; c++) {
				for(var r = 0; r < brickRowCount; r++) {
					if(bricks[c][r].status > 0) {
						var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
						var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
						bricks[c][r].x = brickX;
						bricks[c][r].y = brickY;
						ctx.beginPath();
						ctx.rect(brickX, brickY, brickWidth, brickHeight);
						ctx.fillStyle = "#0095DD";
						ctx.fill();
						// Text에는 각 벽돌 별 깨야 할 숫자가 담겨있음.
						// 각 숫자는 bricks[c][r].status에 담겨있음.
						ctx.fillStyle = "red";
						ctx.fillText(bricks[c][r].status, bricks[c][r].x + brickWidth / 2 - 10, bricks[c][r].y + brickHeight / 2 + 2);
						ctx.closePath();
					}
				}
			}
		}

		// 한번 벽돌에 부딪힐 때마다 1점 증가하는 score 변수 그리는 함수.
		function drawScore() {
			ctx.font = "16px Arial";
			ctx.fillStyle = "#0095DD";
			ctx.fillText("Score: " + score, 8, titleHeight);
		}

		// 남은 lives를 그리는 함수.
		function drawLives() {
			ctx.font = "16px Arial";
			ctx.fillStyle = "#0095DD";
			ctx.fillText("Lives : " + lives, canvas.width - 65, titleHeight);
		}
	}
	playGame();
}