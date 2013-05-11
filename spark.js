/* Global variables */
var temp;
var Spark = {
	k : 1,
	//8.99E-9,
	e : 1,
	//1.6E-19,
	w : 500,
	h : 500,
	eRange : 20,
	kStage : null,
	actLayer : new Kinetic.Layer(),
	txtLayer : new Kinetic.Layer(),
	txtItems: {},
	avieRadius : 14,
	focus : false,
	mouseX : 0,
	mouseY : 0,
	jqCall : '#',
	pandas : [],
	scoredFlag:false,
	Ginji : null
};

var userPref = {
	edgeBounce: true,
}

var startTime = 0;
var redCount = 0;
var blueCount = 0;

Spark.posColor = Spark.actLayer.getContext().createRadialGradient(0, 0, 0, 0, 0, Spark.avieRadius);
Spark.posColor.addColorStop(0, "red");
Spark.posColor.addColorStop(1, "black");

Spark.negColor = Spark.actLayer.getContext().createRadialGradient(0, 0, 0, 0, 0, Spark.avieRadius);
Spark.negColor.addColorStop(0, "blue");
Spark.negColor.addColorStop(1, "black");

Spark.neuColor = Spark.actLayer.getContext().createRadialGradient(0, 0, 0, 0, 0, Spark.avieRadius);
Spark.neuColor.addColorStop(0, "white");
Spark.neuColor.addColorStop(1, "black");

Spark.Charge = function(val, x, y) {
	if(!val){
		val = Math.random() *2*Spark.eRange - Spark.eRange;
		val = Math.round(val);
		if(val==0) val = 1;
		 }
//	if(val>0) redCount++;
//	else blueCount++;
	this.cou = val;
	if(!x)
		x = Math.floor(Math.random() * Spark.w);
	if(!y)
		y = Math.floor(Math.random() * Spark.h);
	this.pos = Vector.create([x, y, 0]);
	this.fv = Vector.create([0, 0, 0]);
	this.velo = Vector.create([0, 0, 0]);
	this.mass = 1;
};

Spark.Charge.prototype.createAvie = function() {
	this.avie = new Kinetic.Circle({
		x : this.pos.e(1),
		y : this.pos.e(2),
		radius : Spark.avieRadius,
		stroke : "black",
		strokeWidth : 1,
		fill : (this.cou > 0 ? Spark.posColor : Spark.negColor)
	});
};

Spark.Charge.prototype.updatePos = function(x, y) {
	if(userPref.edgeBounce){
		if(x > Spark.w || x<0 )
		this.velo.elements[0]*=-1;
	if(y > Spark.h || y<0)
		this.velo.elements[1]*=-1;
	}
	else {
	/* wrap */
	if(x > Spark.w)
		x = 0;
	else if(x < 0)
		x = Spark.w;
	else {
	}
	if(y > Spark.h)
		y = 0;
	else if(y < 0)
		y = Spark.h;
	else {
	}
	}

	this.pos = Vector.create([x, y, 0]);
	if(this.avie)
		this.avie.setPosition(x, y);
};

Spark.Charge.prototype.addFv = function(acc) {
	this.fv = this.fv.add(acc);
}

Spark.Charge.prototype.move = function() {
	var a = this.fv.x((1 / this.mass));
	//	console.log("a="+strVector(a));
	this.velo = this.velo.add(a);
	//	console.log("v="+strVector(this.velo));
	var d = this.pos.add(this.velo);
	this.updatePos(d.e(1), d.e(2));
	//	console.log("d="+strVector(d));
}

Spark.Charge.prototype.draw = function() {
	
	//console.log(this.pos.e(1) + "," + this.pos.e(2));
};

Spark.mouseMoveUpdate = function(evt) {
	var ben = Spark.kStage.getMousePosition();
//	var jerry = $(Spark.jqCall).offset();
	Spark.mouseX = ben.x;// - jerry.left;
	Spark.mouseY = ben.y;// - jerry.top;
	Spark.Ginji.updatePos(Spark.mouseX, Spark.mouseY);
	//	console.log(Spark.mouseX+","+Spark.mouseY);
};

Spark.mouseEnterStage = function(evt) {
	Spark.focus = true;
	$(Spark.jqCall).on("mousemove", Spark.mouseMoveUpdate);
};

Spark.mouseLeaveStage = function(evt) {
	Spark.focus = false;
	$(Spark.jqCall).off("mousemove");

};
function strVector(v) {
	return "<" + v.e(1) + "," + v.e(2) + "," + v.e(3) + ">";
}

Spark.calc = function() {

	for(var i in Spark.pandas) {
		var panda = Spark.pandas[i];
		if(panda == null)
			continue;
		panda.fv = Vector.create([0,0,0]);
		var R = (panda.pos).subtract(Spark.Ginji.pos);
		R = R.toUnitVector();
		//	console.log("R="+strVector(R));
		var r = panda.pos.distanceFrom(Spark.Ginji.pos);
		if(r < Spark.avieRadius) {
			Spark.Ginji.mass += panda.mass;
			Spark.Ginji.cou += panda.cou;
			Spark.actLayer.remove(panda.avie);
			Spark.newChargeAi(i);
			Spark.scoredFlag = true;
			continue;
		}
		
		//	console.log("r="+r);
		var F = Spark.k * ((panda.cou * Spark.e) * (Spark.Ginji.cou * Spark.e)) / Math.pow(r, 2);
		//	console.log("F="+F);
		F = R.x(F);
		panda.fv = F;
		panda.move();

	}
	/*
	 for(var i in Spark.pandas){
	 Spark.pandas[i].move();
	 }
	 */
//	console.log("my charge="+Spark.Ginji.cou);
};

Spark.draw = function() {
	if(this.focus)
		this.Ginji.avie.show();
	else
		this.Ginji.avie.hide();
	if(this.Ginji.cou>0) this.Ginji.avie.setFill(Spark.posColor);
	else if(this.Ginji.cou<0) this.Ginji.avie.setFill(Spark.negColor);
	else this.Ginji.avie.setFill(Spark.neuColor);
	
	if(this.scoredFlag){
		this.Ginji.avie.setScale(1.5,1.5);
		this.scoredFlag = false;
	}
	else {
		this.Ginji.avie.setScale(1,1);
	}

	this.actLayer.draw();
	this.updateCharge();
	this.txtLayer.draw();
	
	if(this.Ginji.cou>100){
		endTime = new Date();
		var deltaTime = (endTime - startTime)/1000;
		alert("Congrats! You became highly positive in "+deltaTime+" seconds");
		this.kStage.stop();
	}
};

Spark.updateCharge = function(){
	this.txtItems["couValue"].setText(Math.round(Spark.Ginji.cou)+"e C");
}

Spark.setupTxtLayer = function(){
	this.txtItems["couValue"] = new Kinetic.Text({text:"-1",
	x:Spark.w-100,
	y:Spark.h-50,
	fontSize:26,
	fontFamily:"sans",
	textFill:"#33FF99"
	});
	this.txtLayer.add(this.txtItems["couValue"]);
}

Spark.init = function(container) {
	this.w = window.innerWidth*0.9;
	this.h = window.innerHeight*0.9;
	this.kStage = new Kinetic.Stage(container, this.w, this.h);
	var bglayer = new Kinetic.Layer();
	bglayer.add(new Kinetic.Rect({
		x : 0,
		y : 0,
		width : this.w,
		height : this.h,
		fill : "black",
		stroke : "black",
		strokeWidth : 1
	}));
	
	this.setupTxtLayer();
	
	this.kStage.add(bglayer);
	this.kStage.add(this.txtLayer);
	this.kStage.add(this.actLayer);
	this.jqCall = '#' + container;

	$(this.jqCall).width(this.w);
	$(this.jqCall).height(this.h);
	$(this.jqCall).mouseleave(this.mouseLeaveStage);
	$(this.jqCall).mouseenter(this.mouseEnterStage);

	this.Ginji = new Spark.Charge(-10, this.w / 2, this.h / 2);
	this.Ginji.createAvie();
	this.Ginji.avie.setStroke("white");
	this.Ginji.avie.setStrokeWidth(2);
	this.actLayer.add(this.Ginji.avie);

	this.generateCharges();

	this.kStage.onFrame(function(frame) {
		setTimeout(Spark.calc, 1000);
		//Spark.calc();
		Spark.draw();
	});

	startTime = new Date();
	this.kStage.start();

};

Spark.newChargeAi = function(i){
var panda = new Spark.Charge();
panda.cou = Math.abs(panda.cou);
if(Spark.pandas[i].cou<0) panda.cou*=-1; 
panda.createAvie();
Spark.pandas[i] = panda;
Spark.actLayer.add(panda.avie);	
}

Spark.generateCharges = function() {
	var limit = 15;
	for(var i = 0; i < limit; i++) {
		var panda = new Spark.Charge();
		panda.createAvie();
		this.pandas.push(panda);
		this.actLayer.add(panda.avie);
	}
}