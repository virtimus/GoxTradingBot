const MaxHoursToKeep = 144;
const btcOffset = 3.2; // this amount will be untouched by trade - bot will play with the rest
const btcFiat = 'USD'; // change this to Your currency 
// const hrInterval = 1800;// interval as number of seconds (ie 3600 - 1 hour)
const bidWithLastPrice = false; // use last price to bid rather than market one

var ApiKey = localStorage.ApiKey || '';
var ApiSec = localStorage.ApiSec || '';

var EmaShortPar = parseInt(localStorage.EmaShortPar || 10);
var EmaLongPar = parseInt(localStorage.EmaLongPar || 21);
var MaxHoursBack = parseInt(localStorage.MaxHoursBack || MaxHoursToKeep);
var MinThresholdBuy = parseFloat(localStorage.MinThresholdBuy || 0.25);
var MinThresholdSell = parseFloat(localStorage.MinThresholdSell || 0.25);
var LogLines = parseInt(localStorage.LogLines || 12);
var TimeFrame = parseInt(localStorage.TimeFrame || 3600);

var BTC, USD;
var utimer=null;
var bootstrap = 1; // progress bar for loading initial H1 data from mtgox

var H1 = []; // the H1 data
var tim = [];
var emaLong = [];
var emaShort = [];

var popupRefresh=null;
var updateinprogress=false;


function updateEMA(ema, N) {
	var pr, k = 2 / (N+1);
	while (ema.length < H1.length) {
		if (ema.length==0) { 
			ema.push(H1[0]);
		} else {
			ema.push( H1[ema.length] * k + ema[ema.length-1] * (1-k) )
		}
	}
}

function schedupdate(t) {
	if (utimer) clearTimeout()
	utimer = setTimeout(update,t)
}

function update() {
	mtgoxpost("info.php", [],
		function(e) {
			console.log("info error", e)
			chrome.browserAction.setTitle({title: "Error executing info" });
			schedupdate(10*1000) // retry after 10 seconds
		},
		function(d) {
			console.log("info.php", d.currentTarget.responseText)
			BTC = Number.NaN
			USD = Number.NaN
			try {
				var rr = JSON.parse(d.currentTarget.responseText)
				if (typeof(rr.Wallets[btcFiat].Balance.value)=="undefined") {
					chrome.browserAction.setTitle({title: rr.error });
				} else {
					BTC = parseFloat(rr.Wallets.BTC.Balance.value)
					USD = parseFloat(rr.Wallets[btcFiat].Balance.value)
					chrome.browserAction.setTitle({title: (rr.Wallets.BTC.Balance.value + " BTC + " + rr.Wallets[btcFiat].Balance.value + " " + btcFiat) });
				}
			} catch (e) {
				console.log(e)
				chrome.browserAction.setTitle({title: e.toString() });
			}
			schedupdate(5*60*1000) // Update balance every 5 minutes
		}
	)
}

function signdata(data) {
	var shaObj = new jsSHA(data, "ASCII")
	var SecretKey = atob(ApiSec)
	var hmac = shaObj.getHMAC(SecretKey, "ASCII", "SHA-512", "B64")
	while (hmac.length%4) hmac+='=' // workaround for the B64 too short bug
	return hmac
}


function mtgoxpost(page, params, ef, df) {
	var req = new XMLHttpRequest()
	req.open("POST", "https://mtgox.com/api/0/"+page, true)
	req.onerror = ef
	req.onload = df
	var data = "nonce="+((new Date()).getTime()*1000)
	for (var i in params)  data += "&" + params[i]
	data = encodeURI(data)
	var hmac = signdata(data)
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
	req.setRequestHeader("Rest-Key", ApiKey)
	req.setRequestHeader("Rest-Sign", hmac)
	req.send(data)
}


function one(e) {
	console.log("ajax post error", e)
}

function onl(d) {
	console.log("ajax post ok", d)
	schedupdate(2500)
}


function dat2day(ms) {
	var t = new Date(ms)
	var y = t.getUTCFullYear().toString()
	var m = (t.getUTCMonth()+1).toString()
	var d = t.getUTCDate().toString()
	if (m.length<2)  m='0'+m;
	if (d.length<2)  d='0'+d;
	return y+"-"+m+"-"+d
}

function get_url(req, url) {
	//console.log(url)
	req.open("GET", url)
	req.send(null);
}


function getemadif(idx) {
	var cel = emaLong[idx]
	var ces = emaShort[idx]
	return 100 * (ces-cel) / ((ces+cel)/2)
}


function refreshEMA(reset) {
	if (reset) {
		emaLong = []
		emaShort = []
	}

	if (H1.length > MaxHoursToKeep) {
		var skip = H1.length-MaxHoursToKeep
		H1 = H1.slice(skip)
		tim = tim.slice(skip)
		emaLong = emaLong.slice(skip)
		emaShort = emaShort.slice(skip)
	}

	updateEMA(emaLong, EmaLongPar)
	updateEMA(emaShort, EmaShortPar)

	var dp, dif = getemadif(H1.length-1)
	chrome.browserAction.setBadgeText({text: Math.abs(dif).toFixed(2)})

	if (dif>MinThresholdBuy) {
		chrome.browserAction.setBadgeBackgroundColor({color:[0, 128, 0, 200]})
		if (USD>=0.01) {
			if (getemadif(H1.length-1) > MinThresholdBuy) {
				console.log("BUY!!!");
				var inf = ['Currency='+btcFiat,'amount=1000'];
				if (bidWithLastPrice) inf.push('price='+H1[H1.length-1].toString());
				mtgoxpost("buyBTC.php", inf, one, onl)
			}
		} else {
			console.log("No "+btcFiat+" to exec up-trend")
		}
	} else if (dif<-MinThresholdSell) {
		chrome.browserAction.setBadgeBackgroundColor({color:[128, 0, 0, 200]})
		if (BTC>=btcOffset) {
			var s = BTC - btcOffset;
			if (getemadif(H1.length-1) < -MinThresholdSell) {
				console.log("SELL!!!")
				var inf = ['Currency='+btcFiat,'amount='+s.toString()];
				if (bidWithLastPrice) inf.push('price='+H1[H1.length-1].toString());
				mtgoxpost("sellBTC.php", inf , one, onl)
			}
		} else {
			console.log("No BTC to exec down-trend")
		}
	} else {
		if (dif>0) {
			chrome.browserAction.setBadgeBackgroundColor({color:[10, 100, 10, 100]})
		} else {
			chrome.browserAction.setBadgeBackgroundColor({color:[100, 10, 10, 100]})
		}
	}

}

function updateH1() {
	if (updateinprogress) {
		return
	}
	updateinprogress = true

	var hour_fetch, hour_now = parseInt( (new Date()).getTime() / (TimeFrame*1000) )
	if (tim.length>0) {
		hour_fetch = tim[tim.length-1] + 1
		if (hour_fetch > hour_now) {
			//console.log("Already have open price for the current hour")
			updateinprogress = false
			return
		}
	} else {
		hour_fetch = hour_now - MaxHoursBack
	}

	var req = new XMLHttpRequest()

	var url = "https://data.mtgox.com/api/0/data/getTrades.php?Currency="+btcFiat+"&since="+(hour_fetch*TimeFrame*1000000).toString()

	req.onerror = function(e) {
		console.log("getTrades error", e, "-repeat")
		get_url(req, url)
	}

	req.onload = function() {
		var refr = false
		var done = true
		try {
			//console.log(req.responseText)
			var trs = JSON.parse( req.responseText )
			//console.log(trs.length)
			if (trs.length > 1) {
				tim.push(hour_fetch)
				var f = parseFloat(trs[0].price);
				var f0 = H1[H1.length-1];
				if (((f/10)>=f0) || ((f*10)<=f0)){ // strange peaks elimination - just keep old val
					f=f0;
					}
				H1.push(f)
				hour_fetch++
				if (hour_fetch <= hour_now) {
					url = "https://data.mtgox.com/api/0/data/getTrades.php?Currency="+btcFiat+"&since="+(hour_fetch*TimeFrame*1000000).toString()
					get_url(req, url)
					done = false
					if (bootstrap) {
						bootstrap++
						chrome.browserAction.setBadgeText({text: ("       |        ").substr(bootstrap%9, 6)})
					}
				} else {
					console.log("Got some new hours", H1.length, MaxHoursToKeep)
					refr = true
					bootstrap = 0
				}
			}
		} catch (e) {
			console.log("getTrades JSON error", e, req.responseText)
			chrome.browserAction.setBadgeText({text: "xxx"})
		}
		if (refr)  refreshEMA(false)
		if (done)  updateinprogress = false
		if (refr && popupRefresh!=null) {
			try {
				popupRefresh()
			} catch (e) {
				popupRefresh=null
			}
		}
	}
	get_url(req, url)
}

chrome.browserAction.setBadgeBackgroundColor({color:[128, 128, 128, 50]})
schedupdate(10)
updateH1()
setInterval(updateH1, 3*60*1000) // recheck every 3 minutes
