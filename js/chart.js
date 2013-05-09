var bp = chrome.extension.getBackgroundPage()	
var chartInitialized = false;

function processTradeData(emaLong, h1, emaShort, tim) {
		var refr = false
		var done = true
		try {
		
			data1 = [];
			data2 = [];
			data3 = [];
		
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
                title: { text: 'EMA trends.', font: '18px sans-serif' },
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

	

        function round(d) {
            return Math.round(100 * d) / 100;
        }

        var data1 = [];
        var data2 = [];
		var data3 = [];

        $(document).ready(function () {

			showTrades();			
			
        });