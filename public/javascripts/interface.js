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
			(event.keyCode >= 35 && event.keyCode <= 39)) {
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
	if (activeMatrix != null)
		activeMatrix.remove();
	$('.content').removeClass('open');
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

	sequence[0].appendChild(notation);
	sequence[0].appendChild(operator);
	sequence[0].appendChild(elem);
	
	$('.content').removeClass('open');
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

$('#confirm-add-custom-matrix').on('click', function (e) {
	var nrows = parseInt($('#nrows').val());
	var ncols = parseInt($('#ncols').val());
	var isIDmat = checkIDmat();

	var elem = createMatrix(nrows, ncols, count ++, isIDmat);
	var page = document.querySelector('.content');


	$('#add-custom-matrix').modal('toggle');
	page.appendChild(elem);
	
	repairAllBindings();
});

$('#nm2x2').on('click', function (e) {
	var isIDmat = checkIDmat();
	var elem = createMatrix(2, 2, count ++, isIDmat);
	var page = document.querySelector('.content');

	page.appendChild(elem);

	repairAllBindings();
});

$('#nm3x3').on('click', function (e) {
	var isIDmat = checkIDmat();
	var elem = createMatrix(3, 3, count ++, isIDmat);
	var page = document.querySelector('.content');

	page.appendChild(elem);

	repairAllBindings();
});

$(document).ready(function () {
	console.log('Scripts loaded! Ready to use!');
	repairAllBindings();
});