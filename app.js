//==========================
//		DEPENDENCIES
//==========================

const express = require('express');
const pug = require('pug');
const Twit = require('twit');
const config = require('./config.js');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');


const app = express();
const T = new Twit(config);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie());
app.set('view engine', 'pug');

//==========================
//		GLOBAL VARIABLES
//==========================
let currentUserHandle;
let currentUserName;
let userAvatar;
let userFollowing;
let userBanner;
let text = [];
let newTweet;
let tweeterName;
let tweeterScreenName;
let tweeterProfileImage;
let retweetCount = [];
let favoriteCount = [];
let time;
let tweetTime = [];
let friendName = [];
let friendHandle = [];
let friendAvatar = [];
let friendStatus = [];
let reciever;
let senderAvatar;
let recieverAvatar;
let sentMessage = [];
let recMessage = [];
let sentMsgTime = [];
let recMsgTime = [];

//Create function to calculate elapsed time
function elapsedTime(previous) {
	const msPerMinute = 60 * 1000;
	const msPerHour = msPerMinute * 60;
	const msPerDay = msPerHour * 24;
	const msPerWeek = msPerDay * 7;
	const msPerMonth = msPerDay * 30;
	const msPerYear = msPerDay * 365;
	const timeElapsed = new Date() - new Date(previous);

	if (timeElapsed < msPerMinute) {
		return Math.round(timeElapsed / 1000) + ' s';
	} else if(timeElapsed < msPerHour) {
		return Math.round(timeElapsed / msPerMinute) + ' m';
	} else if(timeElapsed < msPerDay) {
		return Math.round(timeElapsed / msPerHour) + ' h';
	} else if(timeElapsed < msPerWeek) {
		return Math.round(timeElapsed / msPerDay) + ' d';
	} else if(timeElapsed < msPerMonth) {
		return Math.round(timeElapsed / msPerWeek) + ' w';
	} else if(timeElapsed < msPerYear) {
		return Math.round(timeElapsed / msPerMonth) + ' m';
	} else {
		return Math.round(timeElapsed / msPerYear) + ' y';
	}
}

//==========================
// 		MIDDLEWARE
//==========================

//Add static files
app.use('/static', express.static('public'));

//Pull data from the Twitter API 
app.use((req, res, next) => {
	newTweet = req.cookies.newTweet;
	//Get 5 latest tweets
		T.get('statuses/user_timeline', { count: 5 }, (err, data, res) => {
			if(err) {
				console.log("timeline error");
			} else {
				data.forEach(tweet => {
					time = tweet.created_at;
					tweetTime.push(elapsedTime(time));
					text.push(tweet.text);
					retweetCount.push(tweet.retweet_count);
					favoriteCount.push(tweet.favorite_count);
				})
			}
		});	
	next();
}, (req, res, next) => {
	//Get 5 most recent friends
	T.get('friends/list', { count: 5 }, (err, data, res) => {
		if(err) {
			const error = {
				message: err.message,
				status: err.statusCode
			}
			
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
	//Get 3 most recent sent DMs
	T.get('direct_messages/sent', { count: 3 }, (err, data, res) => {
		if(err) {
			console.log("DM sent error");
		} else {
			senderAvatar = data[0].sender.profile_image_url;
			data.forEach(msg => {
				sentMessage.push(msg.text);
				time = msg.created_at;
				sentMsgTime.push(elapsedTime(time));
			});
		}
	});
	next();
}, (req, res, next) => {
	//Get 3 most recently recieved DMs
	T.get('direct_messages', { count: 3 }, (err, data, res) => {
		if(err) {
			console.log("DM recieving error");
		} else {
			reciever = data[0].sender.name;
			recieverAvatar = data[0].sender.profile_image_url;
			data.forEach(msg => {
				time = msg.created_at;
				recMsgTime.push(elapsedTime(time));
				recMessage.push(msg.text);
			})
		}
	});
	next();
}, (req, res, next) => {
	//Get current user's info
	T.get('account/verify_credentials', (err, data, res) => {
		if(err) {
			console.log("Credentials error");
		} else {
			currentUserHandle = data.screen_name;
			currentUserName = data.name;
			userAvatar = data.profile_image_url;
			userFollowing = data.friends_count;
			userBanner = data.profile_background_image_url;
		}
	});
	next();
});

//Create local variables to insert into templates
app.get('/', (req, res) => {
	res.render('index', {
		currentUserHandle: currentUserHandle,
		currentUserName: currentUserName,
		userAvatar: userAvatar,
		userFollowing: userFollowing,
		userBanner: userBanner,
		text: text,
		newTweet: newTweet,
		tweeterName: tweeterName,
		tweeterScreenName: tweeterScreenName,
		tweeterProfileImage: tweeterProfileImage,
		retweetCount: retweetCount,
		favoriteCount: favoriteCount,
		tweetTime: tweetTime,
		friendName: friendName,
		friendHandle: friendHandle,
		friendAvatar: friendAvatar,
		friendStatus: friendStatus,
		reciever: reciever,
		recieverAvatar: recieverAvatar,
		senderAvatar: senderAvatar,
		sentMessage: sentMessage,
		sentMsgTime: sentMsgTime,
		recMessage: recMessage,
		recMsgTime: recMsgTime
	});
});

//Render the template
app.get('/', (req, res) => {
	res.render('index');
});

//POST route for new tweets
app.post('/', (req, res) => {
	res.cookie('newTweet', req.body.newTweet);
	T.post('statuses/update', { status: req.body.newTweet}, (err, data, res) => {
		if(err) {
			console.log("Posting error");
		} else {
			newTweet = req.body.newTweet;
			console.log("success!!");
		}
	});
	res.redirect('back');
});

//Handle errors

app.use((err, req, res, next) => {
	const error = {
		message: err.message,
		status: err.statusCode
	}
	res.render('error', error);
});

app.get('/error', (req, res) => {
	res.render('error');
});

app.listen(3000, () => {
	console.log('The app is running on localhost:3000!')
});