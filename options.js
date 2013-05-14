
var bp = chrome.extension.getBackgroundPage()
var sla = document.getElementById("sla")
var tf = document.getElementById("tf")

function rese() {
	document.getElementById("emas").value=10
	document.getElementById("emal").value=21
	document.getElementById("btras").value=0.25
	document.getElementById("stras").value=0.25
	document.getElementById("bsTrigSell").value=0;
	document.getElementById("bsTrigBuy").value=0;
	//document.getElementById("bsTrig2").value=0;
	
	document.getElementById("tradingEnabled").checked = true;
	
	sla.selectedIndex=1
	tf.selectedIndex=0
}

function save() {
	var btr = parseFloat(document.getElementById("btras").value)
	if (isNaN(btr) || btr<0 || btr>10) {
		alert("Wrong buyTreshold parameter")
		return
	}

	var str = parseFloat(document.getElementById("stras").value)
	if (isNaN(str) || str<0 || str>10) {
		alert("Wrong sellTreshold parameter")
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

	if (bp.EmaShortPar!=es || bp.EmaLongPar!=el || bp.MinThresholdBuy!=btr || bp.MinThresholdSell!=str) {
		if (!confirm("Applying different EMA/Treshold values may case an instant trigger to execute a trade."))  return
	}

	localStorage.ApiKey=bp.ApiKey=document.getElementById("apikey").value
	localStorage.ApiSec=bp.ApiSec=document.getElementById("apisec").value
	
	localStorage.tradingEnabled=bp.tradingEnabled=(document.getElementById("tradingEnabled").checked?1:0);	
	localStorage.bsTrigSell=bp.bsTrigSell=parseInt(document.getElementById("bsTrigSell").value);
	localStorage.bsTrigBuy=bp.bsTrigBuy=parseInt(document.getElementById("bsTrigBuy").value);
	
	bp.schedupdate(10)

	localStorage.LogLines=bp.LogLines=parseInt(sla.value)
	localStorage.TimeFrame=bp.TimeFrame=parseInt(tf.value)

	localStorage.EmaShortPar=bp.EmaShortPar=es
	localStorage.EmaLongPar=bp.EmaLongPar=el
	localStorage.MinThresholdBuy=bp.MinThresholdBuy=btr
	localStorage.MinThresholdSell=bp.MinThresholdSell=str
	bp.refreshEMA(true)
}

function setfields() {
	document.getElementById("apikey").value=bp.ApiKey
	document.getElementById("apisec").value=bp.ApiSec
	document.getElementById("emas").value=bp.EmaShortPar.toString()
	document.getElementById("emal").value=bp.EmaLongPar.toString()
	document.getElementById("btras").value=bp.MinThresholdBuy.toFixed(2)
	document.getElementById("stras").value=bp.MinThresholdSell.toFixed(2)
	document.getElementById("bsTrigSell").value = bp.bsTrigSell.toString();
	document.getElementById("bsTrigBuy").value = bp.bsTrigBuy.toString();
	

	document.getElementById("tradingEnabled").checked=(bp.tradingEnabled==1);
	document.getElementById("btcPreserve").innerHTML = "<strong>"+bp.btcPreserve+"</strong> BTC&nbsp;";
	document.getElementById("btcAmountPreserved").innerHTML  = "" + bp.btcPreserve;
	document.getElementById("MaxHoursToKeep").innerHTML  = "" + bp.MaxHoursToKeep;
	document.getElementById("btcFiat").innerHTML  = "" + bp.btcFiat;
	
	
	for (var i=0; i<sla.options.length; i++) {
		if (parseInt(sla.options[i].value)==bp.LogLines) {
			sla.selectedIndex=i
			break
		}
	}
	for (var i=0; i<tf.options.length; i++) {
		if (parseInt(tf.options[i].value)==bp.TimeFrame) {
			tf.selectedIndex=i
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
