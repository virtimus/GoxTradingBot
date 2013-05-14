
function update() {
	mtgoxpost1("generic/private/info", [],
		function(e) {
			console.log("info error", e)
			chrome.browserAction.setTitle({title: "Error executing info" });
			schedupdate(10*1000) // retry after 10 seconds
		},
		function(d) {
			console.log("generic/private/info", d.currentTarget.responseText)
			BTC = Number.NaN
			USD = Number.NaN
			try {
				var rr = JSON.parse(d.currentTarget.responseText)
				if (rr.result == 'success') {
					rr = rr.return;
					if (typeof(rr.Wallets[btcFiat].Balance.value)=="undefined") {
						chrome.browserAction.setTitle({title: rr.error });
					} else {
						BTC = parseFloat(rr.Wallets.BTC.Balance.value)
						USD = parseFloat(rr.Wallets[btcFiat].Balance.value)
						chrome.browserAction.setTitle({title: (rr.Wallets.BTC.Balance.value + " BTC + " + rr.Wallets[btcFiat].Balance.value + " " + btcFiat) });
					}
				} else {
					console.log("info soft error", rr.error)
					chrome.browserAction.setTitle({title: "Error executing info:"+rr.error });
					//schedupdate(100*1000) // retry after 100 seconds				
				}
			} catch (e) {
				console.log(e)
				chrome.browserAction.setTitle({title: e.toString() });
			}
			schedupdate(5*60*1000) // Update balance every 5 minutes
		}
	)
}