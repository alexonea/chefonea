var dragEnabled = false;
var dragElement = null;
var focusedHolder = null;
// $('.matrix').draggable();

// $('.matrix').mousedown(function (e) {
// 	$('.matrix').draggable('enable');
// 	dragEnabled = true;
// });

// $(document).mouseup(function (e) {
// 	if (dragEnabled == true) {
// 		$('.matrix').draggable('disable');
// 		dragEnabled = false;
// 	}
// });

// $(document).mousemove(function (e) {
// 	if (dragEnabled) {
// 		$('.matrix').draggable('enable');
// 	}
// });

$('.holder').click(function (e) {
	e.stopPropagation();
	focusedHolder = $(this);
	var text = $(this).text();
	if (text.charCodeAt(0) == 9632) {
		$(this).text('');
	}
});

$(document).mousedown(function (e) {
	if (focusedHolder != null) {
		var text = focusedHolder.text();
		console.log(text);
		if (text.trim().length == 0) {
			text = String.fromCharCode(9632);
			focusedHolder.text(text);
		}
		focusedHolder = null;
	}
});