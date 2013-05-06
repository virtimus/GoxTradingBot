
var bp = chrome.extension.getBackgroundPage()
var sla = document.getElementById("sla")

function rese() {
	document.getElementById("emas").value=10
	document.getElementById("emal").value=21
	document.getElementById("tras").value=0.25
	sla.selectedIndex=1
}

function save() {
	var tr = parseFloat(document.getElementById("tras").value)
	if (isNaN(tr) || tr<0 || tr>10) {
		alert("Wrong Treshold parameter")
		return
	}

	var es = parseInt(document.getElementById("emas").value)
	var el = parseInt(document.getElementById("emal").value)
	if (isNaN(es) || isNaN(el)) {
		alert("Wrong EMA parameter")
		return
	}

	if (es==el) {
		alert("The EMA parameters must be different")
		return
	}

	if (es<1 || el<1) {
		alert("EMA parameter must be bigger than 1")
		return
	}

	if (es>bp.MaxHoursBack || el>bp.MaxHoursBack) {
		alert("EMA parameter too big - max is "+bp.MaxHoursBack)
		return
	}

	if (es > el) {
		var tmp = es
		es = el
		el = tmp
		document.getElementById("emas").value=es
		document.getElementById("emal").value=el
	}

	if (bp.EmaShortPar!=es || bp.EmaLongPar!=el || bp.MinThreshold!=tr) {
		if (!confirm("Applying different EMA/Treshold values may case an instant trigger to execute a trade."))  return
	}

	localStorage.ApiKey=bp.ApiKey=document.getElementById("apikey").value
	localStorage.ApiSec=bp.ApiSec=document.getElementById("apisec").value
	bp.schedupdate(10)

	localStorage.LogLines=bp.LogLines=parseInt(sla.value)

	localStorage.EmaShortPar=bp.EmaShortPar=es
	localStorage.EmaLongPar=bp.EmaLongPar=el
	localStorage.MinThreshold=bp.MinThreshold=tr
	bp.refreshEMA(true)
}

function setfields() {
	document.getElementById("apikey").value=bp.ApiKey
	document.getElementById("apisec").value=bp.ApiSec
	document.getElementById("emas").value=bp.EmaShortPar.toString()
	document.getElementById("emal").value=bp.EmaLongPar.toString()
	document.getElementById("tras").value=bp.MinThreshold.toFixed(2)
	for (var i=0; i<sla.options.length; i++) {
		if (parseInt(sla.options[i].value)==bp.LogLines) {
			sla.selectedIndex=i
			break
		}
	}
}


document.addEventListener('DOMContentLoaded', function() {
	butres.addEventListener('click', function(){rese()})
	butsav.addEventListener('click', function(){save()})
	setfields()
/*
	setcontrols();
	setInterval(col, 300);

	spyes.addEventListener('change', function(){sp.readOnly=!spyes.checked})
	butres.addEventListener('click', function(){reset()})
	butsav.addEventListener('click', function(){save()})
	allcur.addEventListener('click', function(){cf.value=''})
	swtchlog.addEventListener('click', function(){chlog.style.display=chlog.style.display=='none'?'block':'none'})
*/
})
