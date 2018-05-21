/* -- VECTOR script ends here ------------------------------------------ */


/* --------------------------------------------------------------------- */
/* -- 'myTracker' grew and evolved from Mozilla Touch Events tutorial -- */
/* -- G Moehring 2018 May 07, version: VERYROUGH ----------------------- */

'use strict';

let myTracker = (function() {

	let canvas,
		context,
		target,
		targetCoords,
		feedback;
	let	TouchesArray = new Vector();
	let	arcsArchive = new Vector();


// -------- TOOLBOX
// Initializes a touch object for each finger onscreen. Occurs at first contact.
	let	createNewTouchRecord = function(changedTouchesArray){

		let cta = changedTouchesArray;

		for (let i = cta.length - 1; i >= 0; i--) {

			let cleanX = Math.round(cta[i].clientX);
			let cleanY = Math.round(cta[i].clientY);

			return {

				id: cta[i].identifier,
				xCoord: new Vector().push(cleanX),
				yCoord: new Vector().push(cleanY)
			}
		}
	}
// Retrieves the id for a given touch from the array (TouchesArray) storing all touch objects.
	let lookupTAIndex = function(changedTouchIdentifier){

		let ctid = changedTouchIdentifier;

		for (let i = TouchesArray.length - 1; i >= 0; i--) {

			if (ctid == TouchesArray[i].id){
				return i;
			}
			else {
				console.log('somethings fucked');
			}
		}
	}
// Retrieves the last xy coords for a given touch object.
	let getPrevCoords = function(changedTouchIdentifier){

		let index_TA = lookupTAIndex(changedTouchIdentifier);

		return {

			xCoord: TouchesArray[index_TA].xCoord.last(),
			yCoord: TouchesArray[index_TA].yCoord.last()
		}
	}
// For each finger (touch) changing state (eg. moving) adds latest xy location to
// the array (TouchesArray) storing all touch objects.
	let addCoords = function(changedTouchItem){

			let cti = changedTouchItem;
			let cleanX = Math.round(cti.xCoord);
			let cleanY = Math.round(cti.yCoord);
			let index_TA = lookupTAIndex(cti.identifier);

			TouchesArray[index_TA].xCoord.push(cleanX);
			TouchesArray[index_TA].yCoord.push(cleanY);

	}
// The fun part. Draws your finger path.
	let drawStuff = function(changedTouchesArray){

		let cta = changedTouchesArray;

		for (let i = cta.length - 1; i >= 0; i--) {

			let prevCoords = getPrevCoords(cta[i].identifier);
			let prevX = prevCoords.xCoord;
			let prevY = prevCoords.yCoord;
			let currX = Math.round(cta[i].clientX);
			let currY = Math.round(cta[i].clientY);

			context.beginPath();
			context.moveTo(prevX, prevY);
			context.lineTo(currX, currY);
			context.stroke();

			TouchesArray[i].xCoord.push(currX);
			TouchesArray[i].yCoord.push(currY);
		}
	}
// At the end or cancellation of a finger (touch), archives the path each finger(s) took!
// Then removes ended or cancelled touch from the array tracking active touches (TouchesArray)
	let archivePath = function(changedTouchesArray){

		let cta = changedTouchesArray;

		for (let i = cta.length - 1; i >= 0; i--) {

			let ctid = cta[i].identifier;
			let index_TA = lookupTAIndex(ctid);
			let stamp = Date.now();

			TouchesArray[index_TA].id = stamp;

			arcsArchive.push(TouchesArray[index_TA]);

			TouchesArray.splice(i, 1);
		}
	}
// 	Helper function to give user feedback whether they hit or missed the target.
	let toggleState = function(elemtochange, zA, zB){

		if (elemtochange.getAttribute('data-state') === zA){

			elemtochange.setAttribute('data-state', zB);

		} else {

			elemtochange.setAttribute('data-state', zA);
		}
	}
// Helper function to evaluate if user hit the target.
	let bullseye = function(recObj){

		let x = recObj.xCoord[0];
		let y = recObj.yCoord[0];

		if (((x >= targetCoords.x1) && (x <= targetCoords.x2)) &&
			((y >= targetCoords.y1) && (y <= targetCoords.y2))) {

			toggleState(feedback, 'visible', 'invisible');

		} else {

			return // ??
		}
	}
// Helper function to reformat objects into arrays. (Ultimately want to export as CSV).
	let arrayify = function(arcsArchive){ // Make recursive?

		for (let i = arcsArchive.length - 1; i >= 0; i--) { //this may get large so may need to cache length.

			var result = Object.keys(arcsArchive[i]).map(function(key){
				  return [key, arcsArchive[i][key]];
			});
		}
		console.log(result);
	}


// -------- TOUCH START HANDLER
	let touchStart = function(evt){

		evt.preventDefault();

		let changedTouches = evt.changedTouches;
		let newRec = createNewTouchRecord(changedTouches);

		bullseye(newRec);

		TouchesArray.push(newRec);
	}


// -------- TOUCH MOVE HANDLER
	let touchMove = function(evt){

		evt.preventDefault();

		drawStuff(evt.changedTouches);
	}


// -------- TOUCH END HANDLER
	var touchEnd = function(evt){

		evt.preventDefault();

		drawStuff(evt.changedTouches);

		archivePath(evt.changedTouches);

		//arrayify(arcsArchive); Need to find best format for export to CSV
	}


// -------- TOUCH CANCEL HANDLER (eg finger wanders off canvas)
	let touchCancel = function(evt){

		let cta = changedTouchesArray;

		for (let i = cta.length - 1; i >= 0; i--) {

			let ctid = cta[i].identifier;
			let index_TA = lookupTAIndex(ctid);
			TouchesArray.splice(index_TA, 1);
		}
	}


// -------- INITIALIZE THE WHOLE ENCHILADA
	let initStuff = function(){
		let scrWidth = window.innerWidth;
		let scrHeight = window.innerHeight;

		// myTracker 'global' vars
		canvas = document.getElementsByTagName('canvas')[0];
		context = canvas.getContext('2d');
		feedback = document.getElementById('locked');
		target = document.getElementById('target');
		targetCoords = {
			x1: target.offsetLeft,
			x2: target.offsetLeft + target.clientWidth,
			y1: target.offsetTop,
			y2: target.offsetTop + target.clientHeight
		}

		canvas.setAttribute("width", scrWidth);
		canvas.setAttribute("height", scrHeight);
		canvas.addEventListener('touchstart',touchStart,false);
		canvas.addEventListener('touchmove',touchMove,false);
		canvas.addEventListener('touchend',touchEnd,false);
		canvas.addEventListener('touchcancel',touchCancel,false);
	}
	return {
		initStuff: initStuff
	}
})();

window.addEventListener('load', myTracker.initStuff);








