var dragEnabled = false;
var dragElement = null;
var focusedHolder = null;
var activeMatrix = null;
var count = 1;

var repairAllBindings = function () {

	$('.holder').on('click', function (e) {
		replaceWithReminder($(this), e);
	});

	$('.number, .holder').on('keydown', function (event) {

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

		console.log(mat1);
		console.log(mat2);
		console.log(rmat);
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
		sequence[0].appendChild(activeMatrix.clone()[0]);
		$('.content')[0].appendChild(sequence[0]);
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
		sequence = new Array(1);
		sequence[0] = document.createElement('div');
		sequence[0].classList.add('sequence');
		sequence[0].appendChild(mat2[0]);
		$('.content')[0].appendChild(sequence[0]);
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
		sequence[0].appendChild(activeMatrix.clone()[0]);
		$('.content')[0].appendChild(sequence[0]);
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
		sequence[0].appendChild(activeMatrix.clone()[0]);
		$('.content')[0].appendChild(sequence[0]);
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
		sequence[0].appendChild(activeMatrix.clone()[0]);
		$('.content')[0].appendChild(sequence[0]);
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

	var content = $('.content')[0].innerHTML;
	localStorage.setItem('content', content);

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
	var page = document.querySelector('.content');


	$('#add-custom-matrix').modal('toggle');
	page.appendChild(elem);
	
	repairAllBindings();
});

$('#confirm-add-identity-matrix').on('click', function (e) {
	var nrows = parseInt($('#nrows1').val());

	var elem = createMatrix(nrows, nrows, count ++, true, true);
	var page = document.querySelector('.content');


	$('#add-identity-matrix').modal('toggle');
	page.appendChild(elem);
	
	repairAllBindings();
});

$('#nm2x2').on('click', function (e) {
	var elem = createMatrix(2, 2, count ++, false, true);
	var page = document.querySelector('.content');

	page.appendChild(elem);

	repairAllBindings();
});

$('#nm3x3').on('click', function (e) {
	var elem = createMatrix(3, 3, count ++, false, true);
	var page = document.querySelector('.content');

	page.appendChild(elem);

	repairAllBindings();
});

$('#clear-all').on('click', function (e) {
	localStorage.setItem('content', '');
});

$('#save').on('click', function (e) {
	var content = $('.content')[0].innerHTML;
	localStorage.setItem('content', content);

	var user_data = new Object();
	user_data.uid = $('.profile')[0].id;
	user_data.data = content;
	user_data.wid = $('.content')[0].id;
	user_data.name = 'test';

	console.log('saving...');

	$.ajax({
		type: "POST",
		url: '/sync',
		data: user_data,
		success: function (json) {
			
			var result = JSON.parse(json);

			console.log(result);

			if (result.code == 0) {
				var alert = document.createElement('div');
				alert.classList.add('alert');
				alert.classList.add('alert-success');
				alert.innerHTML = '<span class="fui-checkmark-24 space-after"></span><span class="space-before">All your changes have been saved! Keep up the good work!</span>';

				$('body')[0].appendChild(alert);
				var w = 'calc(50% - ' + ($('.alert').width() / 2 + 10) + 'px)';
				$(alert).css('left', w).show().delay(3000).fadeOut(500, function () {
					$(this).remove();
				});
			} else {
				var alert = document.createElement('div');
				alert.classList.add('alert');
				alert.classList.add('alert-danger');
				alert.innerHTML = '<span class="fui-cross-24 space-after"></span><span class="space-before">Ooops! There was an error while trying to save your work!</span>';

				$('body')[0].appendChild(alert);
				var w = 'calc(50% - ' + ($('.alert').width() / 2 + 10) + 'px)';
				$(alert).css('left', w).show().delay(3000).fadeOut(500, function () {
					$(this).remove();
				});
			}
		},
		error: function(err) {
			console.error(err);
		}
	});
	console.log('done');
});

$(document).on('keyup', function(e) {
	var content = $('.content')[0].innerHTML;
	localStorage.setItem('content', content);
});

$(document).ready(function () {
	console.log('Scripts loaded! Ready to use!');

	$('.content')[0].innerHTML = localStorage.getItem('content');
	repairAllBindings();
});