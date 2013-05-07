var matdb = [];

var createMatrix = function (nrows, ncols, id, isIDmat, inSequence) {
	var result = document.createElement('table');

	if (id != 'undefined') {
		result.id = 'm' + id;
	}

	result.classList.add('matrix');
	result.setAttribute('nrows', nrows);
	result.setAttribute('ncols', ncols);

	var tbody = document.createElement('tbody');
	for (var i = 0; i < nrows; i++) {
		var tr = document.createElement('tr');
		for (var j = 0; j < ncols; j++) {
			var td = document.createElement('td');
			td.classList.add('holder');
			td.setAttribute('contenteditable', 'true');
			td.innerHTML = (isIDmat) ? ((i == j) ? 1 : 0) : '&#9632;';
			tr.appendChild(td);
		};
		tbody.appendChild(tr);
	};
	result.appendChild(tbody);
	matdb.push(result);

	var sequence = document.createElement('div');
	sequence.classList.add('sequence');
	sequence.appendChild(result);

	if (inSequence)
		return sequence;
	return result;
};

var elementToArray = function (id) {
	var matrixElem = id;
	var result = {};
	var tds = $('#' + matrixElem[0].id + " .holder");
	var count = 0;
	result.nrows = matrixElem.attr('nrows');
	result.ncols = matrixElem.attr('ncols');
	result.numbers = [];

	for (var i = 0; i < result.nrows; i++) {
		var row = [];
		for (var j = 0; j < result.ncols; j++) {
			row.push(parseInt(tds[count ++].innerHTML));
		};
		result.numbers.push(row);
	};
	return result;
};

var arrayToElement = function (matrixData) {
	var result = document.createElement('table');
	result.id = 'm' + matdb.length;

	result.classList.add('matrix');
	result.classList.add('result');
	result.setAttribute('nrows', matrixData.nrows);
	result.setAttribute('ncols', matrixData.ncols);

	var tbody = document.createElement('tbody');
	for (var i = 0; i < matrixData.nrows; i++) {
		var tr = document.createElement('tr');
		for (var j = 0; j < matrixData.ncols; j++) {
			var td = document.createElement('td');
			td.classList.add('holder');
			td.setAttribute('contenteditable', 'false');
			td.innerHTML = matrixData.numbers[i][j];
			tr.appendChild(td);
		};
		tbody.appendChild(tr);
	};
	result.appendChild(tbody);
	matdb.push(result);
	return result;	
};

var transposeMatrix = function (matrixData) {
    var result = new Object();
    result.ncols = matrixData.nrows;
    result.nrows = matrixData.ncols;
    result.numbers = [];
    var i = matrixData.ncols, j;
    while (i--) { j = matrixData.nrows;
    	result.numbers[i] = [];
    	while (j--) {
    		result.numbers[i][j] = matrixData.numbers[j][i];
    	}
    }
    return result;
};

var matrixDeterminant = function (matrixData) {

	if (matrixData.ncols != matrixData.nrows)
		return null;

	var n = matrixData.nrows;
	var ST = new Array(n);
	var det = 0;

	for (var i = 0; i < n; i++)
		ST[i] = 0;

	var valid = function (k) {
		for (var i = 0; i < k; i++) {
			if (ST[i] == ST[k])
				return 0;
		}
		return 1;
	};

	var solutie = function (k) {
		if (k == n - 1)
			return 1;
		return 0;
	};

	var signatura = function (m) {
		for (var i = 0; i < n - 1; i++) {
			for (var j = i + 1; j < n; j++) {
				if (ST[i] > ST[j])
					m++;
			}
		}
		if (m % 2 == 0)
			return 1;
		return 0;
	};

	var afisare = function (k) {
		var p = 1;
		for (var i = 0; i <= k; i++) {
			p = p * matrixData.numbers[i][ST[i]];
		}
		return Math.pow(-1, signatura(1)) * p;
	};

	var bk = function (k) {
		for (var i = 0; i < n; i++) {
			ST[k] = i;
			if (valid(k)) {
				if (solutie(k)) {
					det = det + afisare(k);
				} else {
					bk(k + 1);
				}
			}
		}
	};

	bk(0);

	return det;
}