var matdb = [];

var createMatrix = function (nrows, ncols, id, isIDmat) {
	var result = document.createElement('table');

	if (id != 'undefined') {
		result.id = 'm' + id;
	}

	result.classList.add('matrix');

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
	return result;
}