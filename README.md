GoxTradingBot
=============

Gox Trading Bot Chrome Extension

<img src="http://i39.tinypic.com/34sf8rn.jpg"/>


This work is based on:

 - Gox Trading Bot (https://chrome.google.com/webstore/detail/gox-trading-bot/iejmifigokhpcgpmoacllcdiceicmejb)
 - Discussion thread (https://bitcointalk.org/index.php?topic=67591.0)
 - Base idea (https://bitcointalk.org/index.php?topic=60501) 

**The code was provided for educational/fun purposes and shouldn't be used to trade significant amounts of BTC!**

Neither original author nor modifiers of the code are to be responsible for any damage caused by using this bot.
There is no warranty of any kind that the source will perform according to any specification/expectations. 

**You as user are fully responsible for analysing the code and deciding if and how to use it.**


Configuration:
---

constants in file background.js:

	**MaxHoursToKeep** - how many bars are kept in history to calculate EMA trends

	**btcOffset** - amount of BTC that shouldn't be touched by trade (all amount above that will be used)
 
	**btcFiat** - replace with Your currency
	
	**hrInterval** - number of seconds between "ticks" (ie 3600 - one hour)
	
	**bidWithLastPrice** - bid with last price rather than market price

	
Installation:
---

1. Copy files from github to Your local storage.
2. Configure background.js according to above specs
3. Run Chrome and goto "chrome://extensions/" url
4. Click on "Read extension without package" and choose Your local folder


Changes:
---

0.2.0.2 
- added chart with trends (a link from popup near balance)
- added **hrInterval**
- option to bid with last price rather than market price ()
- different thresholds buy/sell
- other minor fixes
