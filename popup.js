var bp = chrome.extension.getBackgroundPage()
function padit(d) {
	return d<10 ? '0'+d : d.toString()
}

function hrRefreshOnClick(){
//bp.refreshEMA(true);
//refreshtable();
}

function refreshtable() {
	const wds = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
	const bcols = ["#f2f2ff", "#fffff0"]
	var tab = document.getElementById("tab")
	document.getElementById("emal").innerHTML=bp.EmaLongPar
	document.getElementById("emas").innerHTML=bp.EmaShortPar
	while (tab.rows.length>5) tab.deleteRow(1)
	
	if (bp.updateinprogress) { // && bp.H1.length>bp.LogLines) {
		var r=tab.insertRow(4);
		var c=r.insertCell(-1);
		c.colSpan=5;
		c.innerHTML="&nbsp;<br>Fetching trading data - please wait...<br>("+bp.H1.length+" of "+bp.MaxHoursToKeep+" samples loaded)<br>&nbsp;";
		c.style.backgroundColor="#FFFFFF";
		c.style.textAlign="center";
		c.id="loadCell";
	}		
	
	if (!bp.updateinprogress && bp.H1.length>bp.LogLines) {
		if (bp.H1.length>bp.emaLong.length){
			bp.refreshEMA(true);
			}
		for (var i=bp.H1.length-bp.LogLines; i<bp.H1.length; i++) {
		if ((bp.emaLong.length>i) && (bp.emaShort.length>i)) {
			var el = bp.emaLong[i];
			var es = bp.emaShort[i];

			var perc = 0;	
			if ((es + el)>0) {	
			   perc = 100 * (es-el) / ((es+el)/2)
			}
			var r=tab.insertRow(5)
			var ti=new Date(bp.tim[i]*bp.TimeFrame*1000)
				//   new Date(bp.tim[i]*3600*1000)
			r.style.backgroundColor=bcols[((bp.tim[i]+1)/24)&1]
			r.title=wds[ti.getDay()]
			
			var mnts = ti.getMinutes().toString();
			if (mnts.length<2) mnts = '0'+mnts;
			var hrss = ti.getHours().toString();
			if (hrss.length<2) hrss = '0'+hrss;
			
			r.insertCell(-1).innerHTML= hrss + ":"+ mnts; 
			r.insertCell(-1).innerHTML=bp.H1[i].toFixed(4)
			r.insertCell(-1).innerHTML=es.toFixed(4)
			r.insertCell(-1).innerHTML=el.toFixed(4)
			var c=r.insertCell(-1)
			c.innerHTML=perc.toFixed(4)+'%'
			if (perc>bp.MinThresholdBuy || perc<-bp.MinThresholdSell) {
				c.style.backgroundColor = perc<0 ? "#ffd0d0" : "#d0ffd0"
			} else {
				c.style.backgroundColor = perc<0 ? "#fff0f0" : "#f0fff0"
			}
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


function popupUpdateCounter() {
	var o=document.getElementById("loadCell");
	if (o) {
		o.innerHTML="&nbsp;<br>Fetching trading data - please wait...<br>("+bp.H1.length+" of "+bp.MaxHoursToKeep+" samples loaded)<br>&nbsp;";
	}
	//redrawChart();
}

document.getElementById("hrRefresh").onclick=hrRefreshOnClick;
refreshtable();
bp.popupRefresh=refreshtable;
bp.popupUpdateCounter=popupUpdateCounter;
