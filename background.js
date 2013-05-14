const MaxHoursToKeep = 144;
const btcPreserve = 5; // this amount will be untouched by trade - bot will play with the rest
const btcFiat = 'USD'; // change this to Your currency 
// const TimeFrame = 1800;// interval as number of seconds (ie 3600 - 1 hour)
const bidWithLastPrice = false; // use last price to bid rather than market one

var ApiKey = localStorage.ApiKey || '';
var ApiSec = localStorage.ApiSec || '';

var tradingEnabled = (localStorage.tradingEnabled || 1);
var bsTrigSell = (localStorage.bsTrigSell || 0);
var bsTrigBuy = (localStorage.bsTrigBuy || 0);

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
var popupUpdateCounter=null;
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

function mtgoxpost1(page, params, ef, df) {
	var req = new XMLHttpRequest()
	req.open("POST", "https://mtgox.com/api/1/"+page, true)
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


function hmac_512(message) {
    var secret = atob(ApiSec);
    var shaObj = new jsSHA(message, "TEXT");
    var hmac = shaObj.getHMAC(secret, "B64", "SHA-512", "B64");
    return hmac
}

function mtgoxpost2(page, params, ef, df) {
	var req = new XMLHttpRequest()
	req.open("POST", "https://mtgox.com/api/2/"+page, true)
	req.onerror = ef
	req.onload = df
	var data = 'nonce='+((new Date()).getTime()*1000);
	for (var i in params)  data += "&" + params[i];
	data = encodeURI(data);
	data = page + '\x00' + data;
	var hmac = hmac_512(data)
	//var hmac = signdata(data)
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

function extractPrice(sfrom){
var n=sfrom.indexOf("BTC at");
n+=6;
var ret = -1;
var s2 = sfrom.substr(n);
var s3 = "";
for (var i=0; i<s2.length; i++) {
	if (((s2.charAt(i)>='0') && (s2.charAt(i)<='9')) || (s2.charAt(i)=='.')){
		s3 = s3 + s2.charAt(i);
		}
	}
ret = parseFloat(s3);
return ret;
}

function getWalletHistory(fonret,fonerr){

				//var inf = ["nonce="+((new Date()).getTime()*1000),'currency=BTC',"nonce="+((new Date()).getTime()*1000)];//['since='+btcFiat,'amount=1000'];
				var inf = ['currency=BTC'];//['since='+btcFiat,'amount=1000'];
				//if (bidWithLastPrice) inf.push('price='+H1[H1.length-1].toString());				
				
				mtgoxpost1("generic/wallet/history", inf, 				
					function one(e) {
						console.log("ajax post error", e)
						if (fonerr!=null) fonerr(e);
						}, 
					function onl(d) {
						console.log("ajax post ok", d);
						var rdo = JSON.parse(d.srcElement.responseText);
						if (rdo.result == "success") {
							fonret(rdo);
							}
						else {
							console.log("ERROR geting wallet history");
						}	
						//schedupdate(2500);
						}
					);


}

function checkIfToTrade(stype,func){

		var bInProgress =true;
		getWalletHistory(function(rdo){
			
							var recNum = parseInt(rdo.return.records);
							for (var i=0; i<recNum; i++) {
								var res = rdo.return.result[i];//
								if (res.Type == stype) {// find first "stype" transaction
									var prevPrice = extractPrice(res.Info);
									var currPrice = H1[(H1.length-1)];
									var k=(stype=='in')?1:-1;
									var bsTrig = (stype=='in')?bsTrigSell:bsTrigBuy;
									if (prevPrice>0)
									if (((currPrice-prevPrice)*k/prevPrice) > (bsTrig/100)) {//trigger trade
										func();
									}
									i=recNum;//end of loop
								}
								}				
				bInProgress = false;
			},
			function(e){
				bInProgress = false;
			}
			);

}

function checkIfToBuy(dif,func){
var bBuy = false;
		if (USD>=0.01) {
			if (getemadif(H1.length-1) > MinThresholdBuy) {
			if (tradingEnabled==1) {			
					bBuy = true;
			} else {
					console.log("BUY switched off! (EMA("+EmaShortPar+")/EMA("+EmaLongPar+")>"+MinThresholdBuy+"%");
			}					
			}
		} else {
			console.log("No "+btcFiat+" to exec up-trend")
		}
	if (bBuy &&( bsTrigBuy>0)){// check yet history
		bBuy = false;
		checkIfToTrade("out",func);
	}	
		
	return bBuy;
}

function checkIfToSell(dif,func){
	var bSell = false;	
		if (BTC>=btcPreserve) {
			var s = BTC - btcPreserve;
			if (getemadif(H1.length-1) < -MinThresholdSell) {
				if (tradingEnabled==1) {			
					bSell = true;	
				} else {
					console.log("SELL switched off! (EMA("+EmaShortPar+")/EMA("+EmaLongPar+")<-"+MinSellThreshold+"%");
				}				
			}
		} else {
			console.log("No BTC to exec down-trend")
		}
	if (bSell &&( bsTrigSell>0)){// check yet history
		bSell =false;
		checkIfToTrade("in",func);
	}

	return bSell;

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
		if (checkIfToBuy(dif,function(){
				if (tradingEnabled==1){
				console.log("BUY!!!");
				var inf = ['Currency='+btcFiat,'amount=1000'];
				if (bidWithLastPrice) inf.push('price='+H1[H1.length-1].toString());
				mtgoxpost("buyBTC.php", inf, one, onl)
				}
		})) {

		}

		
	} else if (dif<-MinThresholdSell) {
		chrome.browserAction.setBadgeBackgroundColor({color:[128, 0, 0, 200]})
		if (checkIfToSell(dif,function(){
				if (tradingEnabled==1){
				console.log("SELL!!!")
				var inf = ['Currency='+btcFiat,'amount='+s.toString()];
				if (bidWithLastPrice) inf.push('price='+H1[H1.length-1].toString());
				mtgoxpost("sellBTC.php", inf , one, onl)		
				}
		})) {
		
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
		} else if (popupUpdateCounter!=null) {
			try {
				popupUpdateCounter();
			} catch (e) {
				popupUpdateCounter=null;
			}				
		}
	}
	get_url(req, url)
}

chrome.browserAction.setBadgeBackgroundColor({color:[128, 128, 128, 50]})
schedupdate(10)
updateH1()
setInterval(updateH1, 3*60*1000) // recheck every 3 minutes
