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
	var matrixElem = id.clone();
	var result = {};
	var tds = matrixElem.find('td');
	var count = 0;
	result.nrows = matrixElem.attr('nrows');
	result.ncols = matrixElem.attr('ncols');
	result.numbers = [];

	console.log(tds);

	for (var i = 0; i < result.nrows; i++) {
		var row = [];
		for (var j = 0; j < result.ncols; j++) {
			console.log(tds[count].innerHTML);
			console.log(parseFloat(tds[count].innerHTML));
			row.push(parseFloat(tds[count ++].innerHTML));
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

var sumMatrices = function (m1, m2) {
	var i = m1.ncols, j;
	 while (i--) { j = m1.nrows;
    	while (j--) {
    		m1.numbers[i][j] += m2.numbers[i][j];
    	}
    }
    return m1;
}

var subtractMatrices = function (m1, m2) {
	var i = m1.ncols, j;
	 while (i--) { j = m1.nrows;
    	while (j--) {
    		m1.numbers[i][j] -= m2.numbers[i][j];
    	}
    }
    return m1;
}

var multiplyMatrices = function (m1, m2) {
	var result = new Object();
	result.ncols = m2.ncols;
	result.nrows = m1.nrows;
	result.numbers = [];
	var m = m1.ncols;

	var i = result.ncols, j;
    while (i--) { j = result.nrows;
    	result.numbers[i] = [];
    	while (j--) {
    		result.numbers[i][j] = 0;
    		for (var k = 0; k < m; k++)
    			result.numbers[i][j] += m1.numbers[i][k] * m2.numbers[k][j];
    	}
    }
    return result;
}

var matrixInverse = function (matrixData) {
	var det = matrixDeterminant(matrixData);

	if (det == 0 || (matrixData.nrows != matrixData.ncols)) return null;

	var n = matrixData.nrows;
	for (var i = 0; i < n; i++) {
		for (var j = n; j < 2 * n; j++) {
			if (i == (j - n)) {
				matrixData.numbers[i][j] = 1.0;
			} else {
				matrixData.numbers[i][j] = 0.0;
			}
		}
	}

	for (var i = 0; i < n; i++) {
		for (var j = 0; j < n; j++) {
			if (i != j) {
				var ratio = matrixData.numbers[j][i] / matrixData.numbers[i][i];
				for (var k = 0; k < 2 * n; k++) {
					matrixData.numbers[j][k] -= ratio * matrixData.numbers[i][k];
				}
			}
		}
	}

	for (var i = 0; i < n; i++) {
		var a = matrixData.numbers[i][i];
		for (var j = 0; j < 2 * n; j++) {
			matrixData.numbers[i][j] /= a;
		}
	}

	for (var i = 0; i < n; i++) {
		for (var j = n; j < 2 * n; j++) {
			matrixData.numbers[i][j - n] = matrixData.numbers[i][j];
		}
	}
	console.log(matrixData);
	return matrixData;
}