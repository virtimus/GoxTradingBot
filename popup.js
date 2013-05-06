var bp = chrome.extension.getBackgroundPage()
function padit(d) {
	return d<10 ? '0'+d : d.toString()
}
function refreshtable() {
	const wds = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
	const bcols = ["#f2f2ff", "#fffff0"]
	var tab = document.getElementById("tab")
	document.getElementById("emal").innerHTML=bp.EmaLongPar
	document.getElementById("emas").innerHTML=bp.EmaShortPar
	while (tab.rows.length>3) tab.deleteRow(1)
	if (!bp.updateinprogress && bp.H1.length>bp.LogLines) {
		for (var i=bp.H1.length-bp.LogLines; i<bp.H1.length; i++) {
			var el = bp.emaLong[i]
			var es = bp.emaShort[i]
			var perc = 100 * (es-el) / ((es+el)/2)
			var r=tab.insertRow(3)
			var ti=new Date(bp.tim[i]*3600*1000)
			r.style.backgroundColor=bcols[((bp.tim[i]+1)/24)&1]
			r.title=wds[ti.getDay()]
			r.insertCell(-1).innerHTML=(new Date(bp.tim[i]*3600*1000)).getHours() + ":00"
			r.insertCell(-1).innerHTML=bp.H1[i].toFixed(3)
			r.insertCell(-1).innerHTML=es.toFixed(3)
			r.insertCell(-1).innerHTML=el.toFixed(3)
			var c=r.insertCell(-1)
			c.innerHTML=perc.toFixed(3)+'%'
			if (perc>bp.MinThreshold || perc<-bp.MinThreshold) {
				c.style.backgroundColor = perc<0 ? "#ffd0d0" : "#d0ffd0"
			} else {
				c.style.backgroundColor = perc<0 ? "#fff0f0" : "#f0fff0"
			}
		}
	}
	if (isNaN(bp.USD) || isNaN(bp.BTC)) {
		document.getElementById("nobalan").style.display="table-row"
		document.getElementById("balance").style.display="none"
	} else {
		document.getElementById("nobalan").style.display="none"
		document.getElementById("balance").style.display="table-row"
		document.getElementById("usd").innerHTML=bp.USD.toFixed(2)+" "+ bp.btcFiat; 
		document.getElementById("btc").innerHTML=bp.BTC.toFixed(2)
	}
}
refreshtable()
bp.popupRefresh=refreshtable
