//==========================
//		DEPENDENCIES
//==========================

const express = require('express');
const app = express();
const pug = require('pug');
const Twit = require('twit');
const config = require('./config.js');
const T = new Twit(config);

//==========================
//		GLOBAL VARIABLES
//==========================

let text = [];
let tweeterName = [];
let tweeterScreenName = [];
let tweeterProfileImage = [];
let retweetCount = [];
let favoriteCount = [];
let friendName = [];
let friendHandle = [];
let friendAvatar = [];


app.set('view engine', 'pug');

//==========================
// 		MIDDLEWARE
//==========================

app.use('/static', express.static('public'));

app.use((req, res, next) => {
	//Get 5 latest tweets
	T.get('statuses/user_timeline', { count: 5 }, (err, data, res) => {
		if(err) {
			console.log(err.message);
		} else {
			data.forEach(tweet => {
				text.push(tweet.text);
				tweeterName.push(tweet.user.name);
				tweeterScreenName.push(tweet.user.screen_name);
				tweeterProfileImage.push(tweet.user.profile_image_url);
				retweetCount.push(tweet.retweet_count);
				favoriteCount.push(tweet.favorite_count);
			});
		}	
	});
	next();
}, (req, res, next) => {
	//Get 5 most recent friends
	T.get('friends/list', { count: 5 }, (err, data, res) => {
		if(err) {
			console.log(err.message);
		} else {
			console.log(data);
			data.forEach(user => {
				friendName.push(user.name);
				friendHandle.push(user.screen_name);
				friendAvatar.push(user.profile_image_url);
			});
		}
	});
	console.log(friendName);
	next();
});

//Create local variables to insert into templates
app.get('/', (req, res) => {
	res.render('index', {
		text: text,
		tweeterName: tweeterName,
		tweeterScreenName: tweeterScreenName,
		tweeterProfileImage: tweeterProfileImage,
		retweetCount: retweetCount,
		favoriteCount: favoriteCount,
		friendName: friendName,
		friendHandle: friendHandle,
		friendAvatar: friendAvatar
	});
});

app.get('/', (req, res) => {
	res.render('index');
});

app.listen(3000, () => {
	console.log('The app is running on localhost:3000!')
});