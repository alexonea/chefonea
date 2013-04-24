var createMatrix = function (nrows, ncols) {
	var result = document.createElement('table');
	result.classList.add('matrix');
	var tbody = document.createElement('tbody');
	for (var i = 0; i < nrows; i++) {
		var tr = document.createElement('tr');
		for (var j = 0; j < ncols; j++) {
			var td = document.createElement('td');
			td.classList.add('holder');
			td.setAttribute('contenteditable', 'true');
			td.innerHTML = '&#9632;';
			tr.appendChild(td);
		};
		tbody.appendChild(tr);
	};
	result.appendChild(tbody);
	return result;
}