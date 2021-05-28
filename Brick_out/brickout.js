window.onload = pageLoad;
function pageLoad() {
	var canvas = document.getElementById("myCanvas");
	var ctx = canvas.getContext("2d");
	var rankingNormal = [];
	var rankingUser = 0;   // 현재 일반전 랭킹에 몇 명 등록되어 있는지
	var rankingItem = [];
	var rankingItemUser = 0; // 현재 아이템전 랭킹에 몇 명
	
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
	
	var backgroundImage_blur = new Image();			// 배경에 사용되는 이미지
	backgroundImage_blur.src="background_this_blur.jpg";

	function readyGame() {		// 게임 시작 전 메인 (초기에만 실행)
		canvas.width = 600;
		canvas.height = 500;
		backgroundImage_blur.addEventListener('load', function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage( backgroundImage_blur , 0, 0, 600, 500);
		},false);
	}

	function playNormalGame(str, bool) {		// str : 유저 이름,  normal game 실행
		var userName = str;
		var isItemMode = bool;
		canvas.width = 600;
		canvas.height = 500;
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

		var brickRowCount = 7;
		var brickColumnCount = 2;
		var brickWidth = 60;
		var brickHeight = 20;
		var brickPadding = 10;
		var brickOffsetTop = 50;
		var brickOffsetLeft = 50;

		var score = 0;
		var lives = 1;
		var time_sec = 60;
		var callTimer = null;
		var callBricks = null;

		var leftBricks = 0;
		var leftColumns = 0;

		var clickcheck = true;

		var backgroundImage = new Image();
		backgroundImage.src = "background_this.jpg";
		var brickImage = new Image();
		brickImage.src = "brick_image.jpg";
		var itemBrickImage = new Image();
		itemBrickImage.src = "brick_item.jpg";
		var ballImage = new Image();
		ballImage.src = "pocketBall.png";
		var timeMod = false;

		var gameFinish = false;
		var itemevent = new CustomEvent('item');

		var bricks = [];
		for(var c = 0; c < brickColumnCount; c++) {
			bricks[c] = [];
			for(var r = 0; r < brickRowCount; r++) {
				bricks[c][r] = {x:0, y:0, status:1};
				leftBricks++;
			}
			leftColumns++;
		}

		var item = [];

		if (isItemMode) {
			/////////////////////김만재 추가
			console.log("is run?");
			var item_num=3;
			for(var c = 0; c < brickColumnCount; c++) {
				item[c] = [];
				for(var r = 0; r < brickRowCount; r++) {
					item[c][r] = 0;
				}
			}

			for(var c = 0; c < item_num; c++) {
				var item_x=Math.floor(Math.random()*brickColumnCount);
				var item_y=Math.floor(Math.random()*brickRowCount);
				if(item[item_x][item_y]==0){
					item[item_x][item_y]=1;
				}else{
					c--;
				}
			}
			function makeitem(){
			var item_index = Math.floor(Math.random() * 2);
			switch(item_index){
				case 0:
					alert("Ball Size UP!");
					ballRadius += 5;
					break;
				case 1:
					alert("Ball Speed UP!");
					dx=5; //문제점 이렇게 하면, lives가 떨어지면, 원래 값인 3을 돌아감. 아래 코드 방식때문에 그런건데 이걸 내비둘건지 토의.  -> 타임어택에서는 lives 없애고 타이머만 달았기 때문에 괜찮음!
					dy=-5;
					break;
				}
			}

			// item이라는 커스텀 이벤트 생성
			document.addEventListener('item',makeitem,false);
		}

		// 같은 벽돌에 여러번 충돌되어 사라지는 버그(?) 체크하는 변수.
		var check_flag = null;

		document.addEventListener("mousemove", mouseMoveHandler, false);

		$("#timer").css("display", "block");
		$("#score").css("display", "block");
		// openScore();
		create_canvas();
		startTimer();
		
		//addBricks();
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
			ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
			drawBricks();
			drawBall();
			drawPaddle();
			drawScore();
			drawTimer();
			collisionDetection();
			if (gameFinish) {
				showScore();
				return;
			}
			//checkLeftColumns();

			if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
				dx = -dx;
				check_flag = null;
			}
			if(y + dy < ballRadius + titleHeight) {
				dy = -dy;
				check_flag = null;
			}
			else if(y + dy > canvas.height - ballRadius - paddleHeight) {
				if(x + dx > paddleX && x + dx < paddleX + paddleWidth) {
					dy = -dy;
				}
				else {
					lives--;
					if(!lives) {
						clearInterval(callTimer);
						clearInterval(callBricks);
						saveScore();
						alert("GAME OVER");
						a.pause();
            			a.currentTime = 0;
						gameFinish = true;
						showScore();
						document.removeEventListener('item', makeitem);
						return;
						//document.location.reload();
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
							b.status = 0;
							if (isItemMode) {
								if(b.status==0 && item[c][r]==1){
									document.dispatchEvent(itemevent);
								}
							}
							score++;
							leftBricks--;
							if(score == brickRowCount * brickColumnCount * 3) {
								clearInterval(callTimer);
								clearInterval(callBricks);
								saveScore();
								alert("YOU WIN, CONGRATS!");
								gameFinish = true;
								return;
								//document.location.reload();
							}
							check_flag = b;
						}
						if ((x + ballRadius > b.x && x + ballRadius < b.x + brickWidth && y > b.y && y < b.y + brickHeight)
							|| (x - ballRadius > b.x && x - ballRadius < b.x + brickWidth && y > b.y && y < b.y + brickHeight)) {
							if(check_flag == b) {
								continue;
							}
							dx = -dx;
							b.status = 0;
							if (isItemMode) {
								if(b.status==0 && item[c][r]==1){
									document.dispatchEvent(itemevent);
								}
							}
							score++;
							leftBricks--;
							if(score == brickRowCount * brickColumnCount * 3) {
								clearInterval(callTimer);
								clearInterval(callBricks);
								saveScore();
								alert("YOU WIN, CONGRATS!");
								gameFinish = true;
								return;
								//document.location.reload();
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
			//console.log(ballRadius);
			ctx.drawImage(ballImage, x, y, ballRadius * 2,  ballRadius * 2);
			//위 코드는 사각형으로 도형이 만들어지는 것 같아서 이를 원으로 하려면 어떻게 해야 하는지 ㅠㅠ
			//ctx.beginPath();
			//ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
			//ctx.fillStyle = ctx.createPattern(ballImage, "no-repeat");
			//ctx.fillStyle = "#0095DD";
			//ctx.fill();
			//ctx.closePath();
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
			if (time_sec % 10 == 0) {
				if (!timeMod) {
					bricks[brickColumnCount] = [];
					for (var r = 0; r < brickRowCount; r++) {
						bricks[brickColumnCount][r] = {x:0, y:0, status:1};
					}
					item[brickColumnCount] = [];
					for (var r = 0; r < brickRowCount; r++) {
						item[brickColumnCount][r] = 0;
					}
					// 블럭을 한줄 씩 추가할 때마다 한줄에 2개의 아이템을 랜덤으로 추가.
					for (var r = 0; r < 2; r++) {
						var item_k = Math.floor(Math.random()*brickRowCount);
						if(item[brickColumnCount][item_k] == 0) {
							item[brickColumnCount][item_k] = 1;
						}
					}
					brickColumnCount++;
					leftBricks += brickRowCount;
					timeMod = true;
				}
			}
			else if (time_sec % 10 == 1 && timeMod) {
				timeMod = false;
			}
			for(var c = 0; c < brickColumnCount; c++) {
				for(var r = 0; r < brickRowCount; r++) {
					if (!isItemMode) {
						if(bricks[c][r].status > 0) {
							var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
							var brickY = ( (brickColumnCount - 1 - c) * (brickHeight + brickPadding)) + brickOffsetTop;
							bricks[c][r].x = brickX;
							bricks[c][r].y = brickY;
							ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
						}

					}
					else {
						if(bricks[c][r].status > 0 && item[c][r]==0) {
							var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
							var brickY = ( (brickColumnCount - 1 - c) * (brickHeight + brickPadding)) + brickOffsetTop;
							bricks[c][r].x = brickX;
							bricks[c][r].y = brickY;
							ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
						}
						else if(bricks[c][r].status > 0 && item[c][r]==1){
							var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
							var brickY = ( (brickColumnCount - 1 - c) * (brickHeight + brickPadding)) + brickOffsetTop;
							bricks[c][r].x = brickX;
							bricks[c][r].y = brickY;
							ctx.drawImage(itemBrickImage, brickX, brickY, brickWidth, brickHeight);
						}
					}
				}
			}
		}

		// 한번 벽돌에 부딪힐 때마다 1점 증가하는 score 변수 그리는 함수.
		function drawScore() {
			$("#score_num").empty();
			$("#score_num").append(score);

		}

		function startTimer() {		// 타이머 시작하고 1초마다 갱신하는 함수
			callTimer = setInterval(function() {
				if (time_sec == 0)  {
					clearInterval(callTimer);
					clearInterval(callBricks);
					saveScore();
					alert("GAME OVER");
					gameFinish = true;
					showScore();
				}
				else time_sec--;
			}, 1000);
		}

		function drawTimer() {		// 타이머 그리는 함수
			$("#timer_time").empty();
			$("#timer_time").append(time_sec);
			/*
			ctx.font = "16px Arial";
			ctx.fontFamily = "'Press Start 2P', cursive";
			ctx.fillStyle = "#0095DD";
			ctx.fillText("Timer : " + time_sec, canvas.width - 80, titleHeight);
			*/
		}

		/*
			만약 바닥에 닿을 정도로 공이 빨리 내려온다면 필수!
		function checkLeftColumns() {
			leftColumns = 0;
			for (var c = 0; c < brickColumnCount; c++) {
				var leftRowCount = 0;
				for (var r = 0; r < brickRowCount ; r++) {
					if (bricks[c][r].status != 0) leftRowCount++;
				}
				if (leftRowCount > 0)
					leftColumns++;
			}
			if (leftColumns > 9) {
				clearInterval(callTimer);
				clearInterval(callBricks);
				alert("GAME OVER");
				document.location.reload();
			}
		}
		*/

		function saveScore() {		// 현재 플레이어의 점수 저장 (5위 안에 들 시에만)
			//document.getElementById("rankingNormal").innerHTML = "";
			//console.log(rankingUser);
			if (!isItemMode) {
				rankingNormal[rankingUser] = [userName, score];
				rankingUser++;
				for (var i = 0; i < rankingUser - 1; i++) {
					for (var j = i + 1; j < rankingUser; j++) {
						if (rankingNormal[i][1] < rankingNormal[j][1]) {		// 내림차순 정렬
							var tempName = rankingNormal[i][0];
							var tempScore = rankingNormal[i][1];
							rankingNormal[i] = [rankingNormal[j][0], rankingNormal[j][1]];
							rankingNormal[j] = [tempName, tempScore];
						}
					}
				}
				if (rankingUser > 5) rankingUser = 5;			// 5위 안에 들면 출력하는거로 설정!
				var str = "";
				for (var i = 0; i < rankingUser; i++) {
					str += rankingNormal[i][0] + " " + String(rankingNormal[i][1]) + "\n";
				}
				// localStorage or sessionStorage
				localStorage.setItem("NormalRanking", str);
			}
			else {
				rankingItem[rankingItemUser] = [userName, score];
				rankingItemUser++;
				for (var i = 0; i < rankingItemUser - 1; i++) {
					for (var j = i + 1; j < rankingItemUser; j++) {
						if (rankingItem[i][1] < rankingItem[j][1]) {		// 내림차순 정렬
							var tempName = rankingItem[i][0];
							var tempScore = rankingItem[i][1];
							rankingItem[i] = [rankingItem[j][0], rankingItem[j][1]];
							rankingItem[j] = [tempName, tempScore];
						}
					}
				}
				if (rankingItemUser > 5) rankingItemUser = 5;			// 5위 안에 들면 출력하는거로 설정!
				var str = "";
				for (var i = 0; i < rankingItemUser; i++) {
					str += rankingItem[i][0] + " " + String(rankingItem[i][1]) + "\n";
				}
				// localStorage or sessionStorage
				localStorage.setItem("ItemRanking", str);
			}
			
			/*
			for (var i = 0; i < rankingUser; i++) {
				console.log("save...?");
				$("#rankingNormal").append("<user>" + rankingNormal[i][0] + " " + rankingNormal[i][1] + "</user>");
				//document.getElementById("rankingNormal").innerHTML += ("<user>" + rankingNormal[i][0] + " " + rankingNormal[i][1] + "</user>");
			}
			console.log(document.getElementById("rankingNormal").innerHTML);
			*/
		}

		
		function openScore() {		// 저장된 점수 open (타 플레이어와 비교 위해)
			if (!isItemMode) {
				var str = localStorage.getItem("NormalRanking");
				//localStorage.clear();
				if (str != null) {
					var strArr = str.split("\n");
					for (var i = 0; i < strArr.length; i++) {
						var userData = strArr[i];
						var userDataArr = userData.split(" ");
						if (userData.length == 2) {
							rankingNormal[rankingUser][0] = userDataArr[0];
							rankingNormal[rankingUser][1] = parseInt(userDataArr[1]);
							rankingUser++;
						}
					}
				}
			}
			else {
				var str = localStorage.getItem("ItemRanking");
				//localStorage.clear();
				if (str != null) {
					var strArr = str.split("\n");
					for (var i = 0; i < strArr.length; i++) {
						var userData = strArr[i];
						var userDataArr = userData.split(" ");
						if (userData.length == 2) {
							rankingItem[rankingItemUser][0] = userDataArr[0];
							rankingItem[rankingItemUser][1] = parseInt(userDataArr[1]);
							rankingItemUser++;
						}
					}
				}
			}
		}
		
		function showScore() {			// 게임 한 판이 끝나고, 현재 사용자의 이름와 점수 출력
			$("#timer").css("display", "none");
			$("#score").css("display", "none");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(backgroundImage_blur, 0, 0, canvas.width, canvas.height);
			console.log("gameFinish");
			document.getElementById("nowUser").innerHTML = userName;
			document.getElementById("nowScore").innerHTML = score;
			$("#finishGame").css("display", "block");
			$("#returnMain").on("click", function() {
				$("#finishGame").css("display", "none");
				$("#setting").show();
			});

		}
	}

	function showNormalRanking() {		// normal mode의 점수 상위 5명 출력
		$("#normalUserRanking").empty();
		var parent = document.getElementById("normalUserRanking");
		for (var i = 0; i < 5; i++) {
			var child = document.createElement("p");
			child.setAttribute("class", "p" + (i + 1));
			if (i < rankingNormal.length) {
				child.innerHTML = String(i + 1) + ". player name: " + rankingNormal[i][0] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;score : " + rankingNormal[i][1];
				
			}
			else {
				child.innerHTML = String(i + 1) + ". player name: " + "------" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;score : " + "-----";
			}
			parent.appendChild(child);
			console.log(i);
		}
	}

	function showItemRanking() {		// item mode의 점수 상위 5명 출력
		$("#itemUserRanking").empty();
		var parent = document.getElementById("itemUserRanking");
		for (var i = 0; i < 5; i++) {
			var child = document.createElement("p");
			child.setAttribute("class", "p" + (i + 1));
			if (i < rankingItem.length) {
				child.innerHTML = String(i + 1) + ". player name: " + rankingItem[i][0] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;score : " + rankingItem[i][1];
				
			}
			else {
				child.innerHTML = String(i + 1) + ". player name: " + "------" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;score : " + "-----";
			}
			parent.appendChild(child);
			console.log(i);
		}
	}

	var chooseItemMode = false;
	readyGame();
	$("#startButton1").on("click", function() {			// normal mode 버튼 선택 시
		chooseItemMode = false;
		$("#goMain").show();
		$("#setting").hide();
		document.getElementById("userInfoText").value = "";
		$("#userInfo").css("display", "block");
		$("#Back3").show();
	});

	$("#startButton2").on("click", function() {			// item mode 버튼 선택 시
		chooseItemMode = true;
		$("#goMain").show();
		$("#setting").hide();
		document.getElementById("userInfoText").value = "";
		$("#userInfo").css("display", "block");
		$("#Back3").show();

		/*
		$("#goMain").show();
		$("#setting").hide();
		playItemGame();
		playNormalGame(userName, true);
		*/
	});

	$("#userInfoEnter").on("click", function() {		// 각 모드 시작 전 해당 플레이어의 정보 받기
		var form = document.userInfoForm;
		var userName = form["userName"].value;
		if (checkUserName(userName)) {
			$("#userInfo").hide();
			$("#goMain").hide();
			a.play();
			if (!chooseItemMode)
				playNormalGame(userName, false);
			else
				playNormalGame(userName, true);
		}
		function checkUserName(str) {
			var exp = /^[A-Za-z0-9+]*$/;		// 영문자와 숫자만 입력 가능
			var exp2 = /[\s]/g;		// 공백 검사
			if (exp2.test(str)) {
				alert("whitespaces are not allowed"); return false;
			}
			else if (str.length < 3) {
				alert("at least 3 characters"); return false;
			}
			else if (!exp.test(str)) {
				alert("eng & num only"); return false;
			}
			else return true;
		}

	});

	$("#rankingButton").on("click", function() {			// 랭킹 확인 버튼 클릭 시
		$("#normalRankingBtn").show();
		$("#itemRankingBtn").show();
		$("#setting").hide();
		$("#goMain").show();
		$("#userRanking").css("display", "block");
		$("#normalUserRanking").hide();
		$("#itemUserRanking").hide();
	});

	$("#normalRankingBtn").on("click", function() {			// 랭킹 확인 내의 normal mode 랭킹 확인 버튼 클릭 시
		$(this).hide();
		$("#itemRankingBtn").hide();
		$("#Back").hide();
		$("#Back2").show();
		$("#normalUserRanking").show();
		showNormalRanking();
	});

	$("#itemRankingBtn").on("click", function() {			// 랭킹 확인 내의 item mode 랭킹 확인 버튼 클릭 시
		$(this).hide();
		$("#normalRankingBtn").hide();
		$("#Back").hide();
		$("#itemUserRanking").show();
		$("#Back2").show();
		showItemRanking();
	});

	$("#goMain").on("click", function() {			// 집 모양의 아이콘 클릭 시 메인화면으로 이동
		window.location.replace("start.html");
	});
	$("#Back").on("click", function() {			// 집 모양의 아이콘 클릭 시 메인화면으로 이동
		$("#normalRankingBtn").hide();
		$("#itemRankingBtn").hide();
		$("#setting").show();
		$("#goMain").show();
		$("#userRanking").css("display", "none");
		$("#normalUserRanking").show();
		$("#itemUserRanking").show();
	});
	$("#Back2").on("click", function() {			// 집 모양의 아이콘 클릭 시 메인화면으로 이동
		$(this).hide();
		$("#normalRankingBtn").show();
		$("#itemRankingBtn").show();
		$("#goMain").show();
		$("#userRanking").css("display", "block");
		$("#normalUserRanking").hide();
		$("#itemUserRanking").hide();
		$("#Back").show();
	});
	$("#Back3").on("click", function() {			// 집 모양의 아이콘 클릭 시 메인화면으로 이동
		$("#setting").show();
		$("#userInfo").hide();
	});
}