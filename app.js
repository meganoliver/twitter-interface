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
let currentUser;
let userAvatar;
let userFollowing;
let text = [];
let tweeterName = [];
let tweeterScreenName = [];
let tweeterProfileImage = [];
let retweetCount = [];
let favoriteCount = [];
let friendName = [];
let friendHandle = [];
let friendAvatar = [];
let friendStatus = [];
let reciever;
let senderAvatar;
let recieverAvatar;
let message = [];

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
			const { users } = data;
			users.forEach(user => {
				friendName.push(user.name);
				friendHandle.push(user.screen_name);
				friendAvatar.push(user.profile_image_url);
				friendStatus.push(user.following);
			});
		}
	});
	next();
}, (req, res, next) => {
	//Get 5 most recent DMs
	T.get('direct_messages/sent', { count: 1 }, (err, data, res) => {
		if(err) {
			console.log(err.message);
		} else {
			reciever = data[0].recipient.name;
			recieverAvatar = data[0].recipient.profile_image_url;
			senderAvatar = data[0].sender.profile_image_url;

			data.forEach(msg => {
				message.push(msg.text);
			});
		}
	});
	next();
}, (req, res, next) => {
	//Get current user's info
	T.get('account/verify_credentials', (err, data, res) => {
		if(err) {
			console.log(err.message);
		}
		currentUser = data.screen_name;
		userAvatar = data.profile_image_url;
		userFollowing = data.friends_count;
	});
	next();
});

//Create local variables to insert into templates
app.get('/', (req, res) => {
	res.render('index', {
		currentUser: currentUser,
		userAvatar: userAvatar,
		userFollowing: userFollowing,
		text: text,
		tweeterName: tweeterName,
		tweeterScreenName: tweeterScreenName,
		tweeterProfileImage: tweeterProfileImage,
		retweetCount: retweetCount,
		favoriteCount: favoriteCount,
		friendName: friendName,
		friendHandle: friendHandle,
		friendAvatar: friendAvatar,
		friendStatus: friendStatus,
		reciever: reciever,
		recieverAvatar: recieverAvatar,
		senderAvatar: senderAvatar,
		message: message
	});
});

app.get('/', (req, res) => {
	res.render('index');
});

app.listen(3000, () => {
	console.log('The app is running on localhost:3000!')
});