var leftNum =[1, 2, 3, 4];							//stores that unique id of text filed that can be added to explicit curves form
var origin = {x: 0, y: 0};						//stores coordinates of origin according to canvas's pixel coordinate system
var axes = {x: 0, y: 0};						//axes.x is x-cooordinate of y axes
var explicitCurves = [];
var tangents = [];
var implicitCurve = "";
var implicitColor = "#ea07f1";
var MaxExCurves = 5;

var xLineGap, yLineGap;
var canvas = document.getElementById("PlotSpace");
var width = canvas.width;
var height = canvas.height;
var maxXLines = 20, maxYLines = Math.floor(width * maxXLines / height);
var bound = {x: {L: -15.5, R: 15.5}, y: {L: -10.5, U: 10.5}};
var ScaleX = 20, ScaleY = 10;
var small = 0.0000001;
var roundX, roundY;								//factor to round coordinates to deal with imprecision due to representation in floar
var precision;
var closeness;
var graph = canvas.getContext("2d");
var colors = ["#ff0000", "#09ff00", "#0029ff", "#00fff9", "#000000", "#ff9f00", "#9912db","#ea07f1"];

function isIn(p){								// to check if a given point lies inside graph area
	return (p.x <= bound.x.R && p.x >= bound.x.L && p.y >= bound.y.L && p.y <= bound.y.U);
}
function addField(form){
	if(leftNum.length != 0){
		$('#table').append('<tr id="row'+leftNum[0]+'"><td class= "color-box" style="background-color: '+colors[leftNum[0]]+'"></td><td><input type="text" + id ="input'+leftNum[0]+'" onChange="removeTans('+leftNum[0]+')"></td><td><input type="button" onclick="removeField('+leftNum[0]+')" value="(*)"></td></tr>');
		leftNum.shift();
	}
}
function removeField(row){
	$('#row'+row+'').remove();
	leftNum.push(row);
	removeTans(i);
}
function removeTans(i){							//to remove tangents along with a curve
	tangents[i] = [];
	inputEx();
}
function draw(p1, p2){							//draw  line between p1 and p2 accordingly as p1 or p2 lies out
	if(isNaN(p2.y)){
		p1.x = p2.x;
		p1.y = p2.y
		return;
	}
	if(typeof p1 != "undefined" && !isNaN(p1.y)){
		 if(!isIn(p1)){
			if(isIn(p2)){										//the parameters in lineTo() must be with the canvas
				graph.moveTo(p1.x * ScaleX, -p1.y * ScaleY);	//while parameters in moveTo() can be outside
				graph.lineTo(p2.x * ScaleX, -p2.y * ScaleY);
			}		
		}
		else{
			graph.moveTo(p2.x * ScaleX, -p2.y * ScaleY);
			graph.lineTo(p1.x * ScaleX, -p1.y * ScaleY);
	 	}
	}
	return;
}
function inputEx(){
    for(var i = 0; i < MaxExCurves; i++){
    	if(document.getElementById("input"+i) != null){
    		explicitCurves[i].c = document.getElementById("input"+i).value;
    	}
		else
			explicitCurves[i].c = "";
	}
	foo();
}
function inputImp(){
     implicitCurve = document.getElementById("imp1").value;
     tangents[MaxExCurves] = [];
     foo();
}
function calLineGap(UB, LB, maxLines){						//calculates required difference between to successive lines so that graph has right number of lines 
	var arr = [1, 2, 5];									//gaps can be multiples of 1 or 2 or 5
	var factor;
	var runningMin = Infinity, gap;
	for(var i = 0; i < 3; i++){
		factor = Math.ceil(Math.log10((UB - LB)/(arr[i] * maxLines)));
		gap = arr[i] * Math.pow(10, factor);
		if(gap < runningMin)								//taking the combination which gives lines more closer to the maxLines
			runningMin = gap;
	}
	return runningMin;
}
function drawGrid(){
	var pos, posPx;
	var gapX = 3, gapY = 2;					//distance between axes and text
	if(origin.x > width)					//deciding position of axes
		axes.x = width;
	else if(origin.x < 0)
		axes.x = 0;
	else
		axes.x = origin.x;
	if(origin.y < 0)
		axes.y = 0;
	else if(origin.y > height)
		axes.y = height;
	else
		axes.y = origin.y;
	graph.beginPath();						//drawing main axes
	graph.lineWidth = 1;
	graph.moveTo(0, axes.y);
	graph.lineTo(width, axes.y);
	graph.moveTo(axes.x, 0);
	graph.lineTo(axes.x, height);
	graph.strokeStyle = '#000000';
	graph.stroke();
	graph.font ="12px Aerial";
	if(Math.round(axes.y + gapY) < height) 			//deciding on which side of axes should text be displayed
		graph.textBaseline = "top";
	else{
		gapY *= -1;
		graph.textBaseline = "bottom";
	}
	graph.textAlign = "center";
	for(pos = Math.ceil(bound.x.L/yLineGap) * yLineGap; pos < bound.x.R && pos < -yLineGap/10; pos += yLineGap){
		posPx = (pos - bound.x.L) * ScaleX;
		graph.beginPath();
		if(Math.round(pos/yLineGap)%5 == 0){											//every fifth line
			graph.lineWidth = 2;
			graph.strokeStyle = "rgba(211, 211, 211, 1)";
			graph.moveTo(posPx, 0);
			graph.lineTo(posPx, height);
			graph.fillText(Math.round(pos*roundX)/roundX, posPx, axes.y + gapY);		//to ensure that non terminating decimal is not dispayed
		}
		else{
			graph.lineWidth = 1;
			graph.moveTo(posPx, 0);
			graph.lineTo(posPx, height);
			graph.strokeStyle = "rgba(211, 211, 211, .5)";
		}
		graph.stroke();
	}
	for(pos = Math.floor(bound.x.R/yLineGap) * yLineGap; pos > bound.x.L && pos > yLineGap/10; pos -= yLineGap){
		posPx = (pos - bound.x.L) * ScaleX;
		graph.beginPath();
		if(Math.round(pos/yLineGap)%5 == 0){
			graph.lineWidth = 2;
			graph.strokeStyle = "rgba(211, 211, 211, 1)";
			graph.moveTo(posPx, 0);
			graph.lineTo(posPx, height);
			graph.fillText(Math.round(pos*roundX)/roundX, posPx, axes.y + gapY);
		}
		else{
			graph.lineWidth = 1;
			graph.moveTo(posPx, 0);
			graph.lineTo(posPx, height);
			graph.strokeStyle = "rgba(211, 211, 211, .5)";
		}
		graph.stroke();
	}
	if(Math.round(axes.x - gapX) <= 0){
		gapX *= -1;
		graph.textAlign = "left";
	}
	else
		graph.textAlign = "right";
	graph.textBaseline = "middle";
	for(pos = Math.floor(bound.y.U/xLineGap) * xLineGap; pos > bound.y.L && pos > xLineGap/10; pos -= xLineGap){
		graph.beginPath();
		posPx = (-pos + bound.y.U) * ScaleY;
		if(Math.round(pos/xLineGap)%5 == 0){
			graph.lineWidth = 2;
			graph.moveTo(0, posPx);
			graph.lineTo(width, posPx);
			graph.strokeStyle = "rgba(211, 211, 211, 1)";
			graph.fillText(Math.round(pos * roundY)/roundY, axes.x - gapX, posPx);
		}
		else{
			graph.strokeStyle = "rgba(211, 211, 211, .5)";
			graph.moveTo(0, posPx);
			graph.lineTo(width, posPx);
			graph.lineWidth = 1;
		}
		graph.stroke();
	}
	for(pos = Math.ceil(bound.y.L/xLineGap) * xLineGap; pos < bound.y.U && pos < -xLineGap/10; pos += xLineGap){
		graph.beginPath();
		posPx = (-pos + bound.y.U) * ScaleY;
		if(Math.round(pos/xLineGap)%5 == 0){
			graph.lineWidth = 2;
			graph.moveTo(0, posPx);
			graph.lineTo(width, posPx);
			graph.strokeStyle = "rgba(211, 211, 211, 1)";
			graph.fillText(Math.round(pos * roundY)/roundY, axes.x - gapX, posPx);
		}
		else{
			graph.strokeStyle = "rgba(211, 211, 211, .5)";
			graph.moveTo(0, posPx);
			graph.lineTo(width, posPx);
			graph.lineWidth = 1;
		}
		graph.stroke();
	}
	if(axes.x == origin.x && axes.y == origin.y){				//writing 0 at origin if it lies within canvas
		graph.textAlign = "right";
		graph.textBaseline = "top";
		graph.fillText(0, axes.x - gapX, axes.y + gapY);
	}
}

function drawCurve(input = "", drawColor){						//draws explicit curves
	var p1 = {x: NaN, y: NaN}, p2 = {x: NaN, y: NaN};
	set(input, false);
	graph.strokeStyle = drawColor;
	graph.lineWidth = 2;
	graph.beginPath();
	for(p2.x = bound.x.L; p2.x <= bound.x.R; p2.x += precision){//loops around the x axis inside graph find (x, y) pairs on graph then joinig them
		p2.y = evaluate(p2.x);
		draw(p1, p2);
		p1.x = p2.x;
		p1.y = p2.y;
	}
	graph.stroke();
}
function drawImplicit(input = ""){
	var i, j;
	var tmp = [], arr;
	set(input, true);
	var oldPoints = [], newPoints = [];
	graph.beginPath();
	graph.strokeStyle = implicitColor;
	graph.lineWidth = 2;
	for(var x = bound.x.L; x <= bound.x.R; x += precision){
		tmp = findY(x);
		newPoints = [];
		for(i = 0; i < tmp.length; i++)
			newPoints.push({x: x, y: tmp[i]});
		if(newPoints.length != 0 && oldPoints.length != 0){
			for(i = 0; i < newPoints.length; i++){
				draw(oldPoints[i], newPoints[i]);			//joining neighbouring points
			}
			for(j = i ; j < oldPoints.length; j++){			//if multiple old points are closer to a new point
				if(Math.abs(oldPoints[j].y - newPoints[i - 1].y) < closeness)
					draw(oldPoints[j], newPoints[i - 1]);
				else
					break;
			}
		}
		else if(newPoints.length != 0 || oldPoints.length != 0){
			if(newPoints.length != 0)
				arr = newPoints;
			else
				arr = oldPoints;
			for(i = 1; i < arr.length; i++)
				if(Math.abs(arr[i].y - arr[i - 1].y) < closeness)//if curve starts in more than one direction
					draw(arr[i-1], arr[i]);
		}
		oldPoints = newPoints;
	}
	graph.stroke();
}
function foo(){
	graph.translate(-origin.x, -origin.y);
	graph.clearRect(0, 0, width, height);
	var midX = (bound.x.L + bound.x.R)/2;
	var midY = (bound.y.L + bound.y.U)/2;
	ScaleX = (width/(bound.x.R - bound.x.L));				//ScaleX is pixel to x units ratio
	ScaleY = (height/(bound.y.U - bound.y.L));
	closeness = 100/(bound.y.U - bound.y.L);				//distance within which a point should be considered identical
	precision = (bound.x.R - bound.x.L)/400;
	setValues();
	xLineGap = calLineGap(bound.y.U, bound.y.L, maxXLines);
	yLineGap = calLineGap(bound.x.R, bound.x.L, maxYLines);
	if(Math.ceil(yLineGap) != yLineGap)
		roundX = Math.pow(10, -Math.floor(Math.log10(yLineGap)));
	else
		roundX = 1;
	if(Math.ceil(yLineGap) != yLineGap)
		roundY = Math.pow(10, -Math.floor(Math.log10(xLineGap)));
	else
		roundY = 1;
	origin.x = -ScaleX * bound.x.L;
	origin.y = ScaleY * bound.y.U;
	drawGrid();
	graph.translate(origin.x, origin.y);
	replot();
}
function replot(){
	try{
		if (implicitCurve != "")
			drawImplicit(implicitCurve);
			for(var j = 0; j < tangents[MaxExCurves].length; j++){
					drawTan(implicitCurve, (tangents[MaxExCurves][j]).x, (tangents[MaxExCurves][j]).y, true);
				}	
		}
	catch(err){
	 	console.log("Error");
	 	implicitCurve = "";
		alert(err);
	}
	for(var i = 0; i < MaxExCurves; i++){
		try{
			if(explicitCurves[i].c != ""){
				drawCurve(explicitCurves[i].c, explicitCurves[i].color);
				for(var j = 0; j < tangents[i].length; j++){
					drawTan(explicitCurves[i].c, (tangents[i][j]).x, (tangents[i][j]).y, false);
				}
			}
		}
		catch(err){
		 	console.log("Error");
		 	explicitCurves[i].c = "";
			alert(err);
		}
	}
}
function zoom(factor, posX = width/2, posY = height/2){
	var f = 1/1000;
	factor *= f;										//changing deltaScroll with positive as zoom in and negative as zoom out
	if(factor > 0.4)									//limiting maximum zoom with a single call
		factor = 0.4;									
	else if(factor < -0.4)
		factor = -0.4;
	if(factor > 0)										//+25% zoom means that new view is 75% of previous view
		factor = 1 - factor;	
	else 												//-25% zoom means that old view is 75% of new view
		factor = 1 / (1 + factor);						//done so that zoom in followed by zoom out gives the same view
	var X = posX/ScaleX + bound.x.L;
	var Y = -posY/ScaleY + bound.y.U;
	bound.x.R = X + (bound.x.R - X) * factor;			//calculating new bounds so as to zoom at posX and posY
	bound.x.L = X + (bound.x.L - X) * factor;
	bound.y.L = Y + (bound.y.L - Y) * factor;
	bound.y.U = Y + (bound.y.U - Y) * factor;
	foo();
}
function move(delX = 0, delY = 0){						//function for panning
	bound.x.L -= delX;
	bound.x.R -= delX;
	bound.y.L -= delY;
	bound.y.U -= delY;
	foo();
}
var currmouseX, currmouseY;
canvas.addEventListener("mousedown", mouseDown);
function mouseDown (event){												//for mousedown only in canvas
 	currmouseX = event.pageX;
 	currmouseY = event.pageY;
 	canvas.addEventListener("mousemove", mouseMove);
}
document.onmouseup = function(){										//on mouseup anywhere in document
	canvas.removeEventListener("mousemove", mouseMove);
}
function mouseMove(event){
	delX = (event.pageX - currmouseX)/ScaleX;
	delY = (-event.pageY + currmouseY)/ScaleY;
	currmouseX = event.pageX;
	currmouseY = event.pageY;
	move(delX, delY);
}
canvas.addEventListener("mousewheel", wheelmove);
function wheelmove(event){
	currmouseX = event.clientX - canvas.getBoundingClientRect().left;	//calculating coordinating of mouse pointer wrt to canvas
	currmouseY = event.clientY - canvas.getBoundingClientRect().top;
	zoom(event.wheelDelta, currmouseX, currmouseY);
}
function downloadCanvas(){
	var download = document.getElementById("download");
	var image = document.getElementById("PlotSpace").toDataURL("Image/png").replace("image/png", "image/octet-stream");
	download.setAttribute("href", image);
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft+= obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}
/*this function for conversion rgb to hex is taken from an answer on stackoverflow*/ 
function rgbToHex(r, g, b) {								//for converting rbg representation of color to hex
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
} 
var x, y, colorAtClick;
$('#PlotSpace').mousemove(function(e) {
	var pos = findPos(this);
	var p = graph.getImageData(e.pageX - pos.x, e.pageY - pos.y, 1, 1).data; 
	x = bound.x.L + (e.pageX - pos.x)/ScaleX;
	y = bound.y.U - (e.pageY - pos.y)/ScaleY;
	var coord = "x=" + Math.round(x*roundX)/roundX + ", y=" + Math.round(y*roundY)/roundY;
	
	colorAtClick = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
	$('#status').html(coord + "<br>" + colorAtClick);
});
function setTan(x, y, color){
	for(var i = 0; i < MaxExCurves; i++){
		if(color === explicitCurves[i].color){				//finding curve at point of click
			console.log("Color Matched");
			tangents[i].push({x: x, y: y});
			drawTan(explicitCurves[i].c, x, y, false);
		}
	}
	if(i == MaxExCurves && color == implicitColor){			//if click was at Implicit Curve
		tangents[MaxExCurves].push({x: x, y: y});
		drawTan(implicitCurve, x, y, true);
	}
}
function drawTan(ex, x, y, isimplicit){
	var slope, i, Y1, Y2;
	graph.strokeStyle = "#ff9f00";
	if(isimplicit){
		set(ex, true);
		var Y = findY(x);
		for(i = 0; i < Y.length; i++)
			if(Math.abs(Y[i] - y) < precision)				//chcecking if the (x, y) lies on implicit curve	
				break;
		if(i == Y.length)
			return;
		x1 = x - precision/10;							//(x1, y1) is a point to the left of (x, y)
		Y = findY(x1);
		y1 = Y[i];
		x2 = x + precision/10;							//(x2, y2) is a point to the right of (x, y)
		Y = findY(x2);
		y2 = Y[i];
	}
	else{
		set(ex, false);
		x1 = x - precision/10;
		y1 = evaluate(x1);
		x2 = x + precision/10;
		y2 = evaluate(x2);

	}
	slope = (y1 - y2)/(x1 - x2);
	graph.beginPath();
	draw({x: x1, y: y1}, {x: bound.x.R, y: slope*(bound.x.R - x1) + y1});
	draw({x: x1, y: y1}, {x: bound.x.L, y: slope*(bound.x.L - x1) + y1});
	graph.stroke();
}
function setPara(){
	for(var i = 0; i < MaxExCurves; i++){
		explicitCurves.push({c: "", color: colors[i]});
		tangents[i] = [];
	}
	tangents[i] = [];
}
function selectCurve(){
	canvas.removeEventListener("mousedown", mouseDown);
	canvas.addEventListener("mousedown", tangentPoint);
}
function tangentPoint(){
	setTan(x, y, colorAtClick);
	canvas.addEventListener("mousedown", mouseDown);
	canvas.removeEventListener("mousedown", tangentPoint);
	// canvas.addEventListener("mousedown", mouseDown);
}
setPara();
foo();
