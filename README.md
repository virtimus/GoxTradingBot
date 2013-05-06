GoxTradingBot
=============

Gox Trading Bot Chrome Extension


This work is based on Gox Trading Bot (https://chrome.google.com/webstore/detail/gox-trading-bot/iejmifigokhpcgpmoacllcdiceicmejb)

The code was provided for educational/fun purposes and shouldn't be used to trade significant amounts of BTC.

Neither original author nor modifiers of the code are to be responsible for any damage caused by using this bot.
There is no warranty of any kind that the source will perform according to any specification/expectations. 
You as user are fully responsible for analysing the code and deciding if and how to use it.


Configuration:
---

constants in file background.js:

	**MaxHoursToKeep** - how many bars are kept in history to calculate EMA trends

	**btcOffset** - amount of BTC that shouldn't be touched by trade (all amount above that will be used)
 
	**btcFiat** - replace with Your currency


Installation:
---

1. Copy files from github to Your local storage.
2. Configure background.js according to above specs
3. Run Chrome and goto "chrome://extensions/" url
4. Click on "Read extension without package" and choose Your local folder