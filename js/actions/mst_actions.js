var actionsWidth = 150;
var statusCodetraceWidth = 430;

var isDrawOpen = false;
var isCreateOpen = false;
var isSamplesOpen = false;
var isKruskalsOpen = false;
var isPrimsOpen = false;

function openDraw() {
	if(!isDrawOpen) {
		$('.draw').fadeIn('fast');
		isDrawOpen = true;
	}
}

function closeDraw() {
	if(isDrawOpen) {
		$('.draw').fadeOut('fast');
		isDrawOpen = false;
	}
}

function openCreate() {
	if(!isCreateOpen) {
		$('.create').fadeIn('fast');
		isCreateOpen = true;
	}
}
function closeCreate() {
	if(isCreateOpen) {
		$('.create').fadeOut('fast');
		$('#create-err').html("");
		isCreateOpen = false;
	}
}

function openKruskals() {
	if(!isKruskalsOpen) {
		$('.kruskals').fadeIn('fast');
		isKruskalsOpen = true;
	}
}
function closeKruskals() {
	if(isKruskalsOpen) {
		$('.kruskals').fadeOut('fast');
		$('#kruskals-err').html("");
		isKruskalsOpen = false;
	}
}
function openPrims() {
	if(!isPrimsOpen) {
		$('.prims').fadeIn('fast');
		isPrimsOpen = true;
	}
}
function closePrims() {
	if(isPrimsOpen) {
		$('.prims').fadeOut('fast');
		$('#prims-err').html("");
		isPrimsOpen = false;
	}
}

function hideEntireActionsPanel() {
	closeDraw();
	closeCreate();
	closeKruskals();
	closePrims();
	hideActionsPanel();
}

$( document ).ready(function() {
	
	//action pullouts
	$('#draw').click(function() {
		openDraw();
		closePrims();
		closeKruskals();
		closeCreate();
	});

	$('#create').click(function() {
		closeDraw();
		closePrims();
		closeKruskals();
		openCreate();
	});

	$('#samples').click(function() {
		closeDraw();
		closeCreate();
		closePrims();
		closeKruskals();
	})
	
	$('#prims').click(function() {
		closeDraw();
		closeCreate();
		closeKruskals();
		openPrims();
	});
	
	$('#kruskals').click(function() {
		closeDraw();
		closeCreate();
		closePrims();
		openKruskals();
	});
		
	//tutorial mode
	$('#mst-tutorial-1 .tutorial-next').click(function() {
		showActionsPanel();
	});
	$('#mst-tutorial-2 .tutorial-next').click(function() {
		hideEntireActionsPanel();
	});
	$('#mst-tutorial-3 .tutorial-next').click(function() {
		showStatusPanel();
	});
	$('#mst-tutorial-4 .tutorial-next').click(function() {
		hideStatusPanel();
		showCodetracePanel();
	});
	$('#mst-tutorial-5 .tutorial-next').click(function() {
		hideCodetracePanel();
	});
});