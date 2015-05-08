var display = [];

	var objects =  {navicelle: [],
					cannone: {},
					proiettili: []
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
	};

	var config = {
		width: 80,
		height: 50,
		nNavicelle: 10,
		nRowNavicelle: 2,
		distCannoneBasso: 4,
		vSpaceNavicella: 5,
		velocitaProiettile: 1,
		fireDelay: 3000
	};

	var timeoutIds = {
		fireNavicella: 0,
		gestisciNavicelle: 0,
		rendering: 0
	}

	var ID = 0;
	var gestNavicelle = {
						timer: 500,
						movimento: 7,
						totalVmove: 0
						};

	function fireNavicella() {
		var counter = 0;
		objects.navicelle.forEach(function(item, index){
			genProiettile(item.x + (sprites.navicella.width - 1) / 2, item.y + 3 ,1, "varProiettile");
			counter++;
		});
		if (counter == 0) {
			endGame(1);
		}
		config.fireDelay -= 5;
		timeoutIds.fireNavicella = setTimeout(fireNavicella, config.fireDelay);
	}

	function gestisciNavicelle () {
		var vMove = 0;
		if (gestNavicelle.timer > 100)
			gestNavicelle.timer -= 5;

		if (gestNavicelle.movimento < -11) {
			gestNavicelle.movimento = 12;
			vMove = 2;
		}

		if (gestNavicelle.movimento == 0)
			vMove = 2;

		gestNavicelle.totalVmove += vMove;

		objects.navicelle.forEach(function(item, index){
			if (vMove == 0)
				objects.navicelle[index].x += (gestNavicelle.movimento > 0 ? 1 : -1);
			if (gestNavicelle.totalVmove < 24) 
				objects.navicelle[index].y += vMove;
		});
		gestNavicelle.movimento--;

		timeoutIds.gestisciNavicelle = setTimeout(gestisciNavicelle, gestNavicelle.timer);
	}

	function genNavicella (x, y) {
		objects.navicelle.push({ObjID: ID, x: x, y: y});
		ID++;
	}

	function genCannone (x, y) {
		objects.cannone = {ObjID: ID, x: x, y: y};
		ID++;
	}

	function genProiettile (x, y, direzione, tipo) {
		objects.proiettili.push({ObjID: ID, x: x, y: y, direzione: direzione, tipo: tipo});
		ID++;
	}

	function initNavicelle () {
		var navPerRow = config.nNavicelle / config.nRowNavicelle;
		var space = Math.floor((config.width - sprites.navicella.width * navPerRow) / (navPerRow + 1));
		var height = config.vSpaceNavicella;
		for (var i = 0; i < config.nRowNavicelle; i++) {
			for (var j = 0; j < navPerRow; j++) {
				genNavicella(space + (7 + space) * j, height + (2 + height) * i);
			}
		}
	}

	function initCannone () {
		var space = Math.floor((config.width - sprites.cannone.width) / 2);
		var height = config.height - config.distCannoneBasso;
		genCannone(space, height);
	}

	function printDisplay () {

		for (var i = 0; i < config.height; i++) {
			display[i] = [];
			for (var j = 0; j < config.width; j++) 
				display[i][j] = (i == 0 || i == config.height - 1 || j == 0 || j == config.width-1) ? '# ' : '  ';
		}

		/* Proiettili */

		objects.proiettili.forEach(function(item, index){
			if (item.y < 2 || item.y > config.height - 3) 
				delete objects.proiettili[index];
			else {
				for (var i = 0; i < sprites.proiettile.width; i++) 
					for (var j = 0; j < sprites.proiettile.height; j++) {
						display[item.y + j][item.x + i] = sprites[item.tipo].data[j][i];
					}
				objects.proiettili[index].y += item.direzione * config.velocitaProiettile;
			}
		});

		/* NAVICELLA */

		objects.navicelle.forEach(function(item, index){
			for (var i = 0; i < sprites.navicella.width; i++) 
				for (var j = 0; j < sprites.navicella.height; j++) {
					if (display[item.y + j][item.x + i] == '* ') {
						delete objects.navicelle[index];
					}
					display[item.y + j][item.x + i] = sprites.navicella.data[j][i];
				}
		});

		/* CANNONE */

		for (var i = 0; i < sprites.cannone.width; i++) 
			for (var j = 0; j < sprites.cannone.height; j++) {
				if (display[objects.cannone.y + j][objects.cannone.x + i] == 'o ' || display[objects.cannone.y + j][objects.cannone.x + i] == '!')
					endGame(0);
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

		timeoutIds.rendering = setTimeout(printDisplay, 100);
	}

	function start () {
		initCannone();
		initNavicelle();
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
		console.log("Hai Vinto");
		for (var i = 0; i < (config.height - 1)/2; i++)
			string += ' \n';
		for (var i = 0; i < (config.width - 9)/2; i++)
			string += ' ';

		if (result)
			string += "YOU WIN!!";
		else 
			string += "GAME OVER";

		$('#console').html(string);
	}

	function moveSelection(evt) {
		switch (evt.keyCode) {
			case 37:
			leftArrowPressed();
			break;
			case 39:
			rightArrowPressed();
			break;
			case 32:
			fire();
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