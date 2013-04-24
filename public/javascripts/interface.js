var dragEnabled = false;
var dragElement = null;
var focusedHolder = null;
var count = 1;

var replaceWithReminder = function (elem, e) {
	e.stopPropagation();
	focusedHolder = elem;
	var text = elem.text();
	if (text.charCodeAt(0) == 9632) {
		elem.text('');
	}
}

$('.holder').on('click', function (e) {
	replaceWithReminder($(this), e);
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

$('#nm-custom').on('click', function (e)  {
	$('#add-custom-matrix').modal('toggle');
});

$('#confirm-add-custom-matrix').on('click', function (e) {
	var nrows = parseInt($('#nrows').val());
	var ncols = parseInt($('#ncols').val());

	var elem = createMatrix(nrows, ncols, count ++);
	var page = document.querySelector('.content');


	$('#add-custom-matrix').modal('toggle');
	page.appendChild(elem);
	
	$('.holder').on('click', function (e) {
		replaceWithReminder($(this), e);
	});
});

$('#nm2x2').on('click', function (e) {
	var elem = createMatrix(2, 2, count ++);
	var page = document.querySelector('.content');

	page.appendChild(elem);
	$('.holder').on('click', function (e) {
		replaceWithReminder($(this), e);
	});
});

$('#nm3x3').on('click', function (e) {
	var elem = createMatrix(3, 3, count ++);
	var page = document.querySelector('.content');

	page.appendChild(elem);
	$('.holder').on('click', function (e) {
		replaceWithReminder($(this), e);
	});
});