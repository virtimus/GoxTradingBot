var bp = chrome.extension.getBackgroundPage()	
var chartInitialized = false;
var nowDate;
var nowDateStr;


function padit(d) {return d<10 ? '0'+d.toString() : d.toString()};

function formatChartNumbers(v) {
	return v.toFixed(4);
}

function processTradeData(emaLong, h1, emaShort, tim) {
		var refr = false
		var done = true
		try {
		
			data1 = [];
			data2 = [];
			data3 = [];
			
			nowDate=new Date();
			nowDateStr=nowDate.getFullYear()+"-"+padit(nowDate.getMonth()+1)+"-"+padit(nowDate.getDate());
		
			//console.log(req.responseText)
			///var trs = bp.H1;//responseData;//JSON.parse(responseText )
			//console.log(trs.length)
			if (h1.length > 1) {
				var ss = new Date();
				for (var i = 0; i < h1.length; i++) {
					ss=new Date(tim[i]*bp.TimeFrame*1000);//(new Date(bp.tim[i]*3600*1000)).getHours();// + ":00";
					
					if (emaLong!=null){
						data1.push([ss, parseFloat(emaLong[i])]);
						}

					data2.push([ss, parseFloat(h1[i])]);
						
					if (emaShort!=null){
						data3.push([ss, parseFloat(emaShort[i])]);
						}

				}
						
            var background = {
                type: 'linearGradient',
                x0: 0,
                y0: 0,
                x1: 0,
                y1: 1,
                colorStops: [{ offset: 0, color: '#d2e6c9' },
                             { offset: 1, color: 'white'}
							 ]
            };

			//$('#jqChart').empty();
			if (chartInitialized){
			  var series = $('#jqChart').jqChart('option', 'series');

			  series[0].data = data1;
			  series[1].data = data2;
			  series[2].data = data3;
			  
			  $('#jqChart').jqChart('update');
			}
			else {
            $('#jqChart').jqChart({
                title: { text: 'EMA Trends.', font: '18px sans-serif' },
                axes: [
                        {
  						    type: 'dateTime',
							interval: 1,
							intervalType: 'hours',
							labels: { stringFormat: 'hh:MM' },//mm/dd 
                            location: 'bottom',
                            zoomEnabled: true
                        }
                      ],
                border: { strokeStyle: '#6ba851' },
                background: background,
                tooltips: {
                    type: 'shared'
                },
                crosshairs: {
                    enabled: true,
                    hLine: false,
                    vLine: { strokeStyle: '#cc0a0c' }
                },
                series: [
                            {
                                title: 'emaShort',
                                type: 'line',
                                data: data1,
                                markers: null
                            },
                            {
                                title: 'Price',
                                type: 'line',
                                data: data2,
                                markers: null
                            },							
                            {
                                title: 'emaLong',
                                type: 'line',
                                data: data3,
                                markers: null
                            }
                        ]
            });		

            $('#jqChart').bind('tooltipFormat', function (e, data) {
			
				var trend=(data[2].y<data[0].y?'<span style="font-weight:bold;color:#6F6">UP</span>':(data[2].y>data[0].y?'<span style="font-weight:bold;color:#F66">DOWN</span>':'none'));
	
				var d=data[0].x;//new Date(data[0].x*60*1000);
				var dateStr=d.getFullYear()+"-"+padit(d.getMonth()+1)+"-"+padit(d.getDate());
				var t=(dateStr!=nowDateStr?dateStr:"Today")+" "+padit(d.getHours()) + ":"+padit(d.getMinutes());
				var dateHtml = '<div align="center"><span style="font-weight:bold">'+t+'</span><table width="100%" border="0"><tr style="font-weight:bold;color:'+data[1].series.fillStyle+'"><td align="left">Price: </td><td align="right"> '+formatChartNumbers(data[1].y)+'</td></tr>';	
				
				var emaShortHtml = '<tr style="font-weight:bold;color:'+data[0].series.fillStyle+'"><td align="left">EMA'+bp.EmaShortPar+': </td> <td align="right"> '+formatChartNumbers(data[0].y)+'</td></tr>';
				
				var emaLongHtml = '<tr style="font-weight:bold;color:'+data[2].series.fillStyle+'"><td align="left"> EMA'+bp.EmaLongPar+': </td><td align="right"> '+formatChartNumbers(data[2].y)+'</td></tr></table>Trend: '+trend;
				return dateHtml + emaShortHtml +  emaLongHtml; 
                /*return "<b>" + data[0].series.title + "</b></br>" +
                       "X = " + data[0].x + "</br>" +
                       "Y = " + data[0].y + "</br>" +
                       "Size = " + data[0].size + "</br>"+
					   "Trend = " + trend + "</br>";*/
            });

			
			chartInitialized = true;
			}//initialized
			
			}
			
		} catch (e) {
			console.log("getTrades JSON error", e, e.message)
			chrome.browserAction.setBadgeText({text: "xxx"})
		}

	}


		function showTrades(){

			if (!bp.updateinprogress && bp.H1.length>bp.LogLines) {
				processTradeData(bp.emaShort,bp.H1,bp.emaLong,bp.tim);
			}		

		}
		
		function showTradesHist(){
				//var inf = ["nonce="+((new Date()).getTime()*1000),'currency=BTC',"nonce="+((new Date()).getTime()*1000)];//['since='+btcFiat,'amount=1000'];
				var inf = ['currency=BTC'];//['since='+btcFiat,'amount=1000'];
				//if (bidWithLastPrice) inf.push('price='+H1[H1.length-1].toString());
				
				
				bp.mtgoxpost1("generic/wallet/history", inf, 				
					function one(e) {
						console.log("ajax post error", e)
						}, 
					function onl(d) {
						console.log("ajax post ok", d);
						var rdo = JSON.parse(d.srcElement.responseText);
						if (rdo.result == "success") {
							var recNum = parseInt(rdo.return.records);
							var tab = document.getElementById("tab");
							tab.style.display="inline";
							while (tab.rows.length>1) tab.deleteRow(1)
							for (var i=0; i<recNum; i++) {
								var res = rdo.return.result[i];//
								//.Index;
							var d=new Date(res.Date*1000);
							var dateStr=d.getFullYear()+"-"+padit(d.getMonth()+1)+"-"+padit(d.getDate())+" "+padit(d.getHours())+":"+padit(d.getMinutes()) ;								
								var r=tab.insertRow(1+i);
								r.insertCell(-1).innerHTML = ""+ res.Index; 
								r.insertCell(-1).innerHTML = ""+ dateStr;
								r.insertCell(-1).innerHTML = ""+ res.Type; 								
								r.insertCell(-1).innerHTML = ""+ res.Value.display; 
								r.insertCell(-1).innerHTML = ""+ res.Balance.display; 
								r.insertCell(-1).innerHTML = ""+ res.Info; 
								}
							}
						//schedupdate(2500);
						}
					);
		}

	

        function round(d) {
            return Math.round(100 * d) / 100;
        }

        var data1 = [];
        var data2 = [];
		var data3 = [];

        $(document).ready(function () {

			showTrades();
			var hrefHist = document.getElementById("hrefHistory");	
		    hrefHist.onclick = showTradesHist;			
			//showTradesHist();
        });