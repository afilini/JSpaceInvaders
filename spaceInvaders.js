var display = [];

	var INF = 999999;

	var alive = true;

	var objects =  {navicelle: {},
					cannone: {},
					proiettili: {},
					boxNavicelle: {},
					casette: {}
					};

	var sprites = {
		navicella: {data: [['_ ', '_ ', '# ', '# ', '# ', '_ ', '_ '], ['\\ ', '_ ', '_ ', '_ ', '_ ', '_ ', '/ ']],
					width: 7,
					height: 2},
		cannone: 	{data: [['  ', '  ', '@ ', '  ', '  '], ['@ ', '@ ', '@ ', '@ ', '@ ']],
					width: 5,
					height: 2
					},
		proiettile: {data: [['* '],['* ']],
					width: 1,
					height: 2
					},
		varProiettile: {data: [['! '],['o ']],
					width: 1,
					height: 2
					},
		casetta: {data: [['  ', '~ ', '~ ', '  '], ['% ', '% ', '% ', '% '], ['% ', '  ', '  ', '% ']],
					width: 4,
					height: 3
					}
	};

	var config = {
		width: 80,
		height: 50,
		nNavicelle: 10,
		nRowNavicelle: 2,
		distCannoneBasso: 4,
		vSpaceNavicella: 5,
		velocitaProiettile: 1,
		fireDelay: 3000,
		maxVmove: 20
	};

	var timeoutIds = {
		fireNavicella: 0,
		gestisciNavicelle: 0,
		rendering: 0
	}

	var ID = 0;
	var gestNavicelle = {
						timer: 500,
						direction: -1,
						totalVmove: 0
						};

	function fireNavicella() {
		var counter = 0;
		for (var ID in objects.navicelle) {
			var item = objects.navicelle[ID];
			genProiettile(item.x + (sprites.navicella.width - 1) / 2, item.y + 3 ,1, "varProiettile");
			counter++;
		}
		if (counter == 0) {
			endGame(1);
		}
		config.fireDelay -= 5;
		timeoutIds.fireNavicella = setTimeout(fireNavicella, config.fireDelay);
	}

	function resizeBox () {
		objects.boxNavicelle.UpLeft		= {x: INF, y: INF};
		objects.boxNavicelle.DownLeft	= {x: 0, y: 0};
		objects.boxNavicelle.UpRight	= {x: 0, y: 0};
		objects.boxNavicelle.DownRight	= {x: 0, y: 0};

		for (var ID in objects.navicelle) {
			var item = objects.navicelle[ID];

			if (item.x - 1 < objects.boxNavicelle.UpLeft.x) {
				objects.boxNavicelle.UpLeft.x = item.x - 1;
				objects.boxNavicelle.DownLeft.x = item.x - 1;
			} 

			if (item.x + sprites.navicella.width + 1 > objects.boxNavicelle.UpRight.x) {
				objects.boxNavicelle.UpRight.x = item.x + sprites.navicella.width + 1;
				objects.boxNavicelle.DownRight.x = item.x + sprites.navicella.width + 1;
			}

			if (item.y - 1< objects.boxNavicelle.UpLeft.y) {
				objects.boxNavicelle.UpLeft.y = item.y - 1;
				objects.boxNavicelle.UpRight.y = item.y - 1;
			} 

			if (item.y + sprites.navicella.height + 1 > objects.boxNavicelle.UpRight.y) {
				objects.boxNavicelle.DownLeft.y = item.y + sprites.navicella.height + 1;
				objects.boxNavicelle.DownRight.y = item.y + sprites.navicella.height + 1;
			}
		}
	}

	function relativeBoxMove(x, y) {
		for (var ID in objects.navicelle) {
			var item = objects.navicelle[ID];
			objects.navicelle[ID].x += x;
			objects.navicelle[ID].y += y;
		}
	}

	function gestisciNavicelle () {
		if (gestNavicelle.timer > 100)
			gestNavicelle.timer -= 5;

		resizeBox();

		var relativeMove = {x: 0, y: 0};

		if (gestNavicelle.direction < 0) {
			if (objects.boxNavicelle.UpLeft.x > 2)
				relativeMove.x = -1;
			else {
				gestNavicelle.direction *= -1;
				
				if (gestNavicelle.totalVmove < config.maxVmove) {
					gestNavicelle.totalVmove += 2;
					relativeMove.y = 2;
				}
			}
		} else {
			if (objects.boxNavicelle.UpRight.x < config.width - 2)
				relativeMove.x = +1;
			else {
				gestNavicelle.direction *= -1;
				
				if (gestNavicelle.totalVmove < config.maxVmove) {
					gestNavicelle.totalVmove += 2;
					relativeMove.y = 2;
				}
			}
		}

		relativeBoxMove(relativeMove.x, relativeMove.y);

		timeoutIds.gestisciNavicelle = setTimeout(gestisciNavicelle, gestNavicelle.timer);
	}

	function genNavicella (x, y) {
		objects.navicelle[ID++] = {x: x, y: y};
	}

	function genCannone (x, y) {
		objects.cannone = {ObjID: ID, x: x, y: y};
		ID++;
	}

	function genProiettile (x, y, direzione, tipo) {
		objects.proiettili[ID++] = {x: x, y: y, direzione: direzione, tipo: tipo};
	}

	function genCasetta (x, y) {
		objects.casette[ID++] = {ObjID: ID, x: x, y: y, data: sprites.casetta.data};
	}

	function initNavicelle () {
		var navPerRow = config.nNavicelle / config.nRowNavicelle;
		var space = Math.floor((config.width - sprites.navicella.width * navPerRow) / (navPerRow + 1));
		var height = config.vSpaceNavicella;
		for (var i = 0; i < config.nRowNavicelle; i++) {
			for (var j = 0; j < navPerRow; j++) {
				genNavicella(space + (sprites.navicella.width + space) * j, height + (2 + height) * i);
			}
		}

		resizeBox();
	}

	function initCasette () {
		var houseNum = config.nNavicelle / config.nRowNavicelle;
		var space = Math.floor((config.width - sprites.casetta.width * houseNum) / (houseNum + 1));

		for (var i = 0; i < houseNum; i++) 
			genCasetta(space + (sprites.casetta.width + space) * i, config.height - 5 - sprites.casetta.height);
	}

	function initCannone () {
		var space = Math.floor((config.width - sprites.cannone.width) / 2);
		var height = config.height - config.distCannoneBasso;
		genCannone(space, height);
	}

	function isPartOf (x, y, objectsArray, type) {

		for (var ID in objectsArray) {
			var item = objectsArray[ID];

			if ((x >= item.x && x <= item.x + type.width - 1) && (y >= item.y && y <= item.y + type.height - 1)) 
				return ID

		}
		return false;
	}

	function printDisplay () {

		for (var i = 0; i < config.height; i++) {
			display[i] = [];
			for (var j = 0; j < config.width; j++) 
				display[i][j] = (i == 0 || i == config.height - 1 || j == 0 || j == config.width-1) ? '# ' : '  ';
		}

		/* PROIETTILI */

		for (var ID in objects.proiettili) {
			var item = objects.proiettili[ID];
			(function(){
				if (item.y < 2 || item.y > config.height - 3) 
					delete objects.proiettili[ID];
				else {
					for (var i = 0; i < sprites.proiettile.width; i++) 
						for (var j = 0; j < sprites.proiettile.height; j++) {
							if ((touchingID = isPartOf(item.x + i, item.y + j, objects.casette, sprites.casetta)) !== false) {

								delete objects.proiettili[ID];
								delete objects.casette[touchingID];
								return;
							}

							display[item.y + j][item.x + i] = sprites[item.tipo].data[j][i];
						}
						
					objects.proiettili[ID].y += item.direzione * config.velocitaProiettile;
				}
			})();

		}

		/* CASETTE */

		for (var ID in objects.casette) {
			var item = objects.casette[ID];
			for (var i = 0; i < sprites.casetta.width; i++) 
				for (var j = 0; j < sprites.casetta.height; j++) {
					display[item.y + j][item.x + i] = item.data[j][i];
				}
		}

		/* NAVICELLA */

		for (var ID in objects.navicelle) {
			var item = objects.navicelle[ID];
			for (var i = 0; i < sprites.navicella.width; i++) 
				for (var j = 0; j < sprites.navicella.height; j++) {
					if (display[item.y + j][item.x + i] == '* ') 
						delete objects.navicelle[ID];
					
					display[item.y + j][item.x + i] = sprites.navicella.data[j][i];
				}
		}

		/* CANNONE */

		for (var i = 0; i < sprites.cannone.width; i++) 
			for (var j = 0; j < sprites.cannone.height; j++) {
				if (display[objects.cannone.y + j][objects.cannone.x + i] == 'o ' || display[objects.cannone.y + j][objects.cannone.x + i] == '!')
					alive = false;

				display[objects.cannone.y + j][objects.cannone.x + i] = sprites.cannone.data[j][i];
			}

		/* GENERAZIONE STRINGA */

		var string = '';
		for (var i = 0; i < config.height; i++) {
			for (var j = 0; j < config.width; j++) 
				string += display[i][j];
			string += '\n';
		}

		$('#console').html(string);

		if (alive)
			timeoutIds.rendering = setTimeout(printDisplay, 100);
		else
			endGame(false);
	}

	function start () {
		initCannone();
		initNavicelle();
		initCasette();
	}

	function leftArrowPressed() {
		objects.cannone.x -= 2;
	}

	function rightArrowPressed() {
		objects.cannone.x += 2;
	}

	function fire() {
		genProiettile(objects.cannone.x + (sprites.cannone.width - 1) / 2, objects.cannone.y - 3, -1, "proiettile");
	}

	function endGame (result) {
		clearTimeout(timeoutIds.rendering);
		clearTimeout(timeoutIds.gestisciNavicelle);
		clearTimeout(timeoutIds.fireNavicella);
		var string = '';

		for (var i = 0; i < (config.height - 1)/2; i++)
			string += ' \n';
		for (var i = 0; i < (config.width - 9)/2; i++)
			string += ' ';

		if (result)
			string += "YOU WIN!!";
		else 
			string += "GAME OVER";

		$('#console').css('font-size', '12px');
		$('#console').html(string);
	}

	function moveSelection(evt) {
		switch (evt.keyCode) {
			case 37:
			leftArrowPressed();
			break;

			case 65:
			leftArrowPressed();
			break;

			case 39:
			rightArrowPressed();
			break;
			
			case 68:
			rightArrowPressed();
			break;

			case 32:
			fire();
			break;

			default:
			console.log(evt.keyCode);
			break;
			}
		};

function docReady()
{ 
  window.addEventListener('keydown', moveSelection);
  start();
  printDisplay();
  gestisciNavicelle();
  fireNavicella();
}