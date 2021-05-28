$(document).ready(function pageLoad() {
	//var pstroy=$('.stroy');
	var pstory=$(".story");
	var now=0;
	var last=document.getElementsByTagName('img').length;

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

	$("#pre").click(function(){
		if(now==0){
			alert("처음 페이지입니다.");
		}else if(now==1){
			$("#a").show();
			$("#b").hide();
		}else if(now==2){
			$("#b").show();
			$("#c").hide();
		}
		now--;
	});

	$("#skip").click(function(){
		alert("졸프 시작합니다.");
		window.location.replace("stage5.html");
	});

	$("#next").click(function(){
		if(now==last-4){
			alert("졸프 시작합니다.");
			window.location.replace("stage5.html");
		}
		if(now==0){
			$("#a").hide();
			$("#b").show();
		}else if(now==1){
			$("#b").hide();
			$("#c").show();
		}
		now++;
	});
});