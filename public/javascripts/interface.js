var dragEnabled = false;
var dragElement = null;
var focusedHolder = null;
var activeMatrix = null;
var count = 1;

var workspace = {};
workspace.data = '';
workspace.lastupdate = new Date();
workspace.name = 'Name this workspace...';
workspace.wid = '';


var saveLocalWorkspaceInfo = function () {
	// var content = $('.workspace')[0].innerHTML;
	// workspace.data = content;
	localStorage.setItem('workspace', JSON.stringify(workspace));
}

var loadLocalWorkspaceInfo = function () {

	var x = localStorage.getItem('workspace');
	if (x === null) {
		localStorage.setItem('workspace', JSON.stringify(workspace));
	}

	var local = JSON.parse(localStorage.getItem('workspace'));
	if (local) {
		$('.workspace')[0].innerHTML = local.data;
		$('.workspace-title')[0].innerHTML = local.name
	} else {
		$('.workspace')[0].innerHTML = '';
		localStorage.setItem('workspace', JSON.stringify(workspace));
	}
	workspace.wid = local.wid || '';
	workspace.name = local.name || 'Name this workspace...';
	workspace.data = local.data || '';
	workspace.lastupdate = local.lastupdate || new Date();
	repairAllBindings();
}

var loadRemoteWorkspace = function (id) {
	var user_data = {};
	user_data.uid = $('.profile')[0].id;
	user_data.wid = id;

	$.ajax({
		type: 'GET',
		url: '/load',
		data: user_data,
		// dataType: 'json',
		// traditional: true,
		// contentType: "application/json; charset=utf-8",
		success: function (data) {

			data = JSON.parse(data);

			if (data.code == 0) {
				var ws = data.data;
				workspace.wid = ws[0]._id;
				workspace.name = ws[0].name;
				workspace.lastupdate = ws[0].lastupdate;
				workspace.data = ws[0].data;
				saveLocalWorkspaceInfo();
				loadLocalWorkspaceInfo();
			} else {
				$('#temp')[0].remove();
				showAlert('danger', 'Error loading your workspace!', 3000);
			}
		},
		error: function(err) {
			console.error(err);
		}
	});
}

var repairAllBindings = function () {

	$('.holder').on('click', function (e) {
		replaceWithReminder($(this), e);
	});

	$('.number, .holder').on('keydown', function (event) {

		if (event.keyCode == 13) {
			event.preventDefault();
			return false;
		}

		// Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
			 // Allow: Ctrl+A
			(event.keyCode == 65 && event.ctrlKey === true) || 
			 // Allow: home, end, left, right
			(event.keyCode >= 35 && event.keyCode <= 39) ||
			(event.keyCode == 109 && $(this).text().length == 0)) {
				 // let it happen, don't do anything
				 return;
		}
		else {
			// Ensure that it is a number and stop the keypress
			if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
				event.preventDefault(); 
			}
		}
	});

	$('.matrix').on('mousedown', function (e) {
		if (e.button == 2) {

			activeMatrix = $(this);

			$('#context-menu').css({
				top: e.pageY + 10 + 'px',
				left: e.pageX + 10 + 'px'
			});

			$('#context-menu').dropdown('toggle');
			e.preventDefault();
			return false;
		}
	});

	$('.compute-button').on('click', function (e) {
		var sequence = $(this).parent();
		var matrices = sequence.children('.matrix');

		var mat1 = elementToArray($(matrices[0]));
		var mat2 = elementToArray($(matrices[1]));

		var rmat;

		if (sequence[0].classList.contains('sum'))
			rmat = sumMatrices(mat1, mat2);
		else if (sequence[0].classList.contains('diff'))
			rmat = subtractMatrices(mat1, mat2);
		else
			rmat = multiplyMatrices(mat1, mat2);

		var result = arrayToElement(rmat);

		var operator = document.createElement('div');
		operator.innerHTML = "=";
		operator.classList.add('operator');
		//operator.style.paddingTop = sequence.height() / 2 - 4 + 'px';

		sequence[0].appendChild(operator);
		sequence[0].appendChild(result);
		sequence[0].classList.add('completed');
		
		$('body').removeClass('open');
		sequence.children('.compute-button')[0].remove();
		repairAllBindings();
		e.stopPropagation();
	});
};

var replaceWithReminder = function (elem, e) {
	e.stopPropagation();
	focusedHolder = elem;
	var text = elem.text();
	if (text.charCodeAt(0) == 9632) {
		elem.text('');
	}
};

var checkIDmat = function () {
	return $('#idmat').is(':checked');
};

$('#removemat').on('click', function (e) {
	if (activeMatrix != null) {
			activeMatrix.parent().remove();
	}
	$('body').removeClass('open');
	e.stopPropagation();
});

$('#inverse').on('click', function (e) {
	var mat = elementToArray(activeMatrix);
	var det = matrixDeterminant(mat);

	if (det == 0 || (mat.nrows != mat.ncols)) {
		return;
	}

	mat = matrixInverse(mat);

	var elem = arrayToElement(mat);
	var sequence = activeMatrix.parent();


	var operator = document.createElement('div');
	operator.innerHTML = "=";
	operator.classList.add('operator');
	//operator.style.paddingTop = sequence.height() / 2 - 4 + 'px';

	var notation = document.createElement('div');
	notation.classList.add('notation')
	notation.innerHTML = '-1';

	if (sequence[0].classList.contains('completed')) {
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		var mat2 = activeMatrix.clone();
		if (mat2[0].classList.contains('determinant'))
			mat2[0].classList.remove('determinant');
		sequence[0].appendChild(mat2[0]);
		$('.workspace')[0].appendChild(sequence[0]);
	}

	sequence[0].appendChild(notation);
	sequence[0].appendChild(operator);
	sequence[0].appendChild(elem);
	sequence[0].classList.add('completed');
	
	$('body').removeClass('open');
	repairAllBindings();
	e.stopPropagation();
});

$('#transpose').on('click', function (e) {
	var mat = elementToArray(activeMatrix);
	mat = transposeMatrix(mat);

	var elem = arrayToElement(mat);
	var sequence = activeMatrix.parent();


	var operator = document.createElement('div');
	operator.innerHTML = "=";
	operator.classList.add('operator');
	//operator.style.paddingTop = sequence.height() / 2 - 4 + 'px';

	var notation = document.createElement('div');
	notation.classList.add('notation')
	notation.innerHTML = 'T';

	if (sequence[0].classList.contains('completed')) {
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		var mat2 = activeMatrix.clone();
		if (mat2[0].classList.contains('determinant'))
			mat2[0].classList.remove('determinant');
		sequence[0].appendChild(mat2[0]);
		$('.workspace')[0].appendChild(sequence[0]);
	}

	sequence[0].appendChild(notation);
	sequence[0].appendChild(operator);
	sequence[0].appendChild(elem);
	sequence[0].classList.add('completed');
	
	$('body').removeClass('open');
	repairAllBindings();
	e.stopPropagation();
});

$('#determinant').on('click', function (e) {
	var mat = elementToArray(activeMatrix);
	var det = matrixDeterminant(mat);

	var sequence = activeMatrix.parent();

	var operator = document.createElement('div');
	operator.innerHTML = "=";
	operator.classList.add('operator');

	var result = document.createElement('span');
	result.classList.add('result')
	result.innerHTML = det + "";

	if (sequence[0].classList.contains('completed')) {
		var mat2 = activeMatrix.clone();
		mat2[0].classList.remove('result');
		mat2[0].classList.add('determinant');
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		sequence[0].appendChild(mat2[0]);
		$('.workspace')[0].appendChild(sequence[0]);
	} else {
		var mat2 = activeMatrix;
		mat2[0].classList.add('determinant');
	}


	sequence[0].appendChild(operator);
	sequence[0].appendChild(result);
	sequence[0].classList.add('completed');

	sequence[0].children[0].style.borderRadius = 0 + 'px';
	
	$('body').removeClass('open');
	repairAllBindings();
	e.stopPropagation();
});

$('#sum-with').on('click', function (e) {
	var mat = elementToArray(activeMatrix);

	var sequence = activeMatrix.parent();

	var operator = document.createElement('div');
	operator.classList.add('operator');
	operator.innerHTML = "+";

	var operand = createMatrix(mat.nrows, mat.ncols, ++count, false, false);

	if (sequence[0].classList.contains('completed')) {
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		var mat2 = activeMatrix.clone();
		if (mat2[0].classList.contains('determinant'))
			mat2[0].classList.remove('determinant');
		sequence[0].appendChild(mat2[0]);
		$('.workspace')[0].appendChild(sequence[0]);
	}

	var actionButton = document.createElement('div');
	actionButton.classList.add('btn');
	actionButton.classList.add('compute-button');
	actionButton.classList.add('btn-warning');
	actionButton.classList.add('pull-right');
	actionButton.innerHTML = "Compute";


	sequence[0].appendChild(operator);
	sequence[0].appendChild(operand);
	sequence[0].appendChild(actionButton);
	sequence[0].classList.add('sum');
	sequence[0].classList.add('completed');

	$('body').removeClass('open');
	repairAllBindings();
	e.stopPropagation();	
});

$('#subtract-from').on('click', function (e) {
	var mat = elementToArray(activeMatrix);

	var sequence = activeMatrix.parent();

	var operator = document.createElement('div');
	operator.classList.add('operator');
	operator.innerHTML = "-";

	var operand = createMatrix(mat.nrows, mat.ncols, ++count, false, false);

	if (sequence[0].classList.contains('completed')) {
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		var mat2 = activeMatrix.clone();
		if (mat2[0].classList.contains('determinant'))
			mat2[0].classList.remove('determinant');
		sequence[0].appendChild(mat2[0]);
		$('.workspace')[0].appendChild(sequence[0]);
	}

	var actionButton = document.createElement('div');
	actionButton.classList.add('btn');
	actionButton.classList.add('compute-button');
	actionButton.classList.add('btn-warning');
	actionButton.classList.add('pull-right');
	actionButton.innerHTML = "Compute";


	sequence[0].appendChild(operator);
	sequence[0].appendChild(operand);
	sequence[0].appendChild(actionButton);
	sequence[0].classList.add('diff');
	sequence[0].classList.add('completed');

	$('body').removeClass('open');
	repairAllBindings();
	e.stopPropagation();	
});

$(document).mousedown(function (e) {
	if (focusedHolder != null) {
		var text = focusedHolder.text();
		if (text.trim().length == 0) {
			text = String.fromCharCode(9632);
			focusedHolder.text(text);
		}
		focusedHolder = null;
	}
});

$('#multiply-by').on('click', function (e) {
	var mat = elementToArray(activeMatrix);

	var sequence = activeMatrix.parent();

	var operator = document.createElement('div');
	operator.classList.add('operator');
	operator.innerHTML = "*";

	var operand = createMatrix(mat.ncols, mat.nrows, ++count, false, false);

	if (sequence[0].classList.contains('completed')) {
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		var mat2 = activeMatrix.clone();
		if (mat2[0].classList.contains('determinant'))
			mat2[0].classList.remove('determinant');
		sequence[0].appendChild(mat2[0]);
		$('.workspace')[0].appendChild(sequence[0]);
	}

	var actionButton = document.createElement('div');
	actionButton.classList.add('btn');
	actionButton.classList.add('compute-button');
	actionButton.classList.add('btn-warning');
	actionButton.classList.add('pull-right');
	actionButton.innerHTML = "Compute";

	sequence[0].appendChild(operator);
	sequence[0].appendChild(operand);
	sequence[0].appendChild(actionButton);
	sequence[0].classList.add('mul');
	sequence[0].classList.add('completed');

	$('body').removeClass('open');
	repairAllBindings();
	e.stopPropagation();
});

$(document).mousedown(function (e) {

	var content = $('.workspace')[0].innerHTML;
	workspace.data = content;
	saveLocalWorkspaceInfo();

	if (focusedHolder != null) {
		var text = focusedHolder.text();
		if (text.trim().length == 0) {
			text = String.fromCharCode(9632);
			focusedHolder.text(text);
		}
		focusedHolder = null;
	}
});

$('#idmat').on('click', function (e) {
	if ($(this).is(':checked')) {
		$('#ncols').prop('disabled', true);
		var text = $('#nrows').val();
		$('#ncols').val(text);
	} else {
		$('#ncols').prop('disabled', false);
	}
});

$('#nrows').on('keyup', function (e) {
	if ($('#idmat').is(':checked')) {
		var text = $(this).val();
		$('#ncols').val(text);
	}
});

$('#nm-custom').on('click', function (e)  {
	$('#add-custom-matrix').modal('toggle');
});

$('#nm-identity').on('click', function (e) {
	$('#add-identity-matrix').modal('toggle');
});

$('#about').on('click', function (e) {
	$('#about-modal').modal('toggle');
});

$('#confirm-add-custom-matrix').on('click', function (e) {
	var nrows = parseInt($('#nrows').val());
	var ncols = parseInt($('#ncols').val());
	var isIDmat = checkIDmat();

	var elem = createMatrix(nrows, ncols, count ++, isIDmat, true);
	var page = document.querySelector('.workspace');


	$('#add-custom-matrix').modal('toggle');
	page.appendChild(elem);
	
	repairAllBindings();
});

$('#confirm-add-identity-matrix').on('click', function (e) {
	var nrows = parseInt($('#nrows1').val());

	var elem = createMatrix(nrows, nrows, count ++, true, true);
	var page = document.querySelector('.workspace');


	$('#add-identity-matrix').modal('toggle');
	page.appendChild(elem);
	
	repairAllBindings();
});

$('#nm2x2').on('click', function (e) {
	var elem = createMatrix(2, 2, count ++, false, true);
	var page = document.querySelector('.workspace');

	page.appendChild(elem);

	repairAllBindings();
});

$('#nm3x3').on('click', function (e) {
	var elem = createMatrix(3, 3, count ++, false, true);
	var page = document.querySelector('.workspace');

	page.appendChild(elem);

	repairAllBindings();
});

$('#clear-all').on('click', function (e) {
	workspace.data = '';
	workspace.name = 'Name this workspace...';
	workspace.wid = '';
	workspace.lastupdate = new Date();
	saveLocalWorkspaceInfo();
});

var showAlert = function (type, message, time) {
	
	var alert = document.createElement('div');
	alert.classList.add('alert');
	alert.classList.add('alert-' + type + '');
	alert.innerHTML = '<span class="fui-checkmark-24 space-after"></span><span class="space-before">' + message + '</span>';

	$('body')[0].appendChild(alert);
	var w = 'calc(50% - ' + ($('.alert').width() / 2 + 10) + 'px)';
	$(alert).css('left', w).show().delay(time).fadeOut(500, function () {
		$(this).remove();
	});
}

var syncWorkspace = function () {

	var user_data = {};
	user_data.wid = workspace.wid;
	user_data.data = workspace.data;
	user_data.name = workspace.name;
	user_data.uid = $('.profile')[0].id;

	$.ajax({
		type: 'GET',
		url: '/sync',
		data: user_data,
		// dataType: 'json',
		// traditional: true,
		// contentType: "application/json; charset=utf-8",
		success: function (alex) {

			alex = JSON.parse(alex);

			if (alex.code >= 0) {
				
				showAlert('success', 'All your changes have been saved! Keep up the good work!', 3000);
				workspace.wid = alex.workspace.wid;
				saveLocalWorkspaceInfo();

				$('.workspace')[0].id = alex.wid;
			} else {
				showAlert('danger', 'Ooops! There was an error while trying to save your work!', 3000);
			}
		},
		error: function(err) {
			console.error(err);
		}
	});
};

$('#save').on('click', function (e) {
	syncWorkspace();
});

$('.workspace-title').on('focusout', function () {
	var text = $(this)[0].innerText;
	if (text.trim() == '') {
		$(this)[0].innerHTML = 'Name this workspace...';
	}
	workspace.name = $(this)[0].innerHTML;
	saveLocalWorkspaceInfo();
});

$('.workspace-title').on('focusin', function () {
	var text = $(this)[0].innerText;
	if (text == 'Name this workspace...') {
		$(this)[0].innerHTML = '';
	}
	// $(this).focus();
});

var saveTitleUpdate = function () {
	return false;
}

$('.workspace-title').on('keydown', function (e) {
	switch (e.keyCode) {
		case 13:
			e.preventDefault();
			return saveTitleUpdate();
		case 8:
			return ($(this)[0].innerText.length > 0);
		default:
			return true;
	}
	return false;
});

$('#load').on('click', function(e) {
	var menuParent = $(this).parent()[0];

	var ul = document.createElement('ul');
	ul.id = 'temp';

	var loadingAlert = document.createElement('li');
	loadingAlert.classList.add('disabled');
	loadingAlert.innerHTML = '<a href="#"><span class="loading">Loading...</span></a>';
	ul.appendChild(loadingAlert);

	menuParent.appendChild(ul);

	$(document).on('click', function (e) {
		if ($('#temp').length > 0) $('#temp')[0].remove();
	});

	$('#temp').on('focusout', function () {
		if ($(this).length > 0) $(this)[0].remove();
	});

	var uid = $('.profile')[0].id;

	$.ajax({
		type: 'GET',
		url: '/load',
		data: {uid: uid},
		// dataType: 'json',
		// traditional: true,
		// contentType: "application/json; charset=utf-8",
		success: function (data) {

			data = JSON.parse(data);
			if (data.code == 0) {

				var ws = data.data;
				if (ws.length == 0)
					loadingAlert.innerHTML = '<a href="#"><span class="loading">You have no saved workspaces</span></a>';
				else {
					for (var i = ws.length - 1; i >= 0; i--) {
						var elem = document.createElement('li');
						elem.innerHTML = '<a href="#" class="loaditem" id="' + ws[i]._id + '">' + ws[i].name + '</a>';

						ul.appendChild(elem);
					};
					$('.loading').parent()[0].remove();
					$('.loaditem').on('click', function (e) {
						loadRemoteWorkspace($(this)[0].id);
					});
				}
			} else {
				$('#temp')[0].remove();
				showAlert('danger', 'Error loading your workspaces!', 3000);
			}
		},
		error: function(err) {
			console.error(err);
		}
	});
});


$(document).on('keyup', function(e) {
	var content = $('.workspace')[0].innerHTML;
	workspace.data = content;
	saveLocalWorkspaceInfo();
});

$(document).ready(function () {
	console.log('Scripts loaded! Ready to use!');

	loadLocalWorkspaceInfo();
	repairAllBindings();
});