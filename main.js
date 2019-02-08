const requestPromise = require('request-promise');
const fs = require('fs');
const nodemailer = require('nodemailer');
const winston = require('winston');
var {
	Loggly
} = require('winston-loggly-bulk');
const {
	format
} = require('winston');

var configData;
var intervalIDs = [];

// winston issue
// https://github.com/loggly/winston-loggly-bulk/issues/45
var winstonLogglyOptions = new Loggly({
	subdomain: 'myletter',
	inputToken: '1428653c-ee35-449e-9f9c-5e98a18b36dc',
	auth: {
		username: 'vewa',
		password: 'qwertyuiop'
	},
	tags: ['scheduler']
})

const logger = winston.createLogger({
	level: 'error',
	format: format.combine(
		format.timestamp({
			format: 'DD-MM-YYYY HH:mm:ss'
		}),
		format.printf(error => {
			return `${error.timestamp} ${error.level} - ${error.message}`;
		})
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: 'logs/activity.log',
			maxsize: '30000',
			maxFiles: '3',
			tailable: true
		}),
		winstonLogglyOptions
	],
	exitOnError: false
})

async function start() {
	// process.exit() and winston file write issue
	// https://github.com/winstonjs/winston/issues/228
	try {
		configData = JSON.parse(fs.readFileSync('config.json', 'utf8'));
		initiateCall();

		fs.watchFile('config.json', function (curr, prev) {
			configData = JSON.parse(fs.readFileSync('config.json', 'utf8'));
			for (i in intervalIDs) {
				clearInterval(intervalIDs[i]);
			}
			initiateCall();
		});
	} catch (error) {
		logger.error('config.json not found :: ' + error);
		console.log('Config file not found! Exiting......');
		await setTimeout(function () {
			process.exit();
		}, 1000);
	}
}

function initiateCall() {
	for (var i in configData) {
		var timeToRun = configData[i]['timeInterval'].split(':');
		// 3600000 hours 60000 minutes 1000 seconds
		var milliSeconds = timeToRun[0] * 3600000 + timeToRun[1] * 60000 + timeToRun[2] * 1000;
		scheduler(milliSeconds, configData[i]);
	}
}

function scheduler(time, obj) {
	try {
		var newID;
		if (obj['type']['API'] === true && obj['type']['sendEmail'] === true) {
			newID = setInterval(async function () {
				sendMail(obj, await apiCall(obj));
			}, time);
			intervalIDs.push(newID);
		} else if (obj['type']['API'] === true) {
			newID = setInterval(function () {
				apiCall(obj);
			}, time);
			intervalIDs.push(newID);
		} else if (obj['type']['sendEmail'] === true) {
			newID = setInterval(function () {
				sendMail(obj);
			}, time);
			intervalIDs.push(newID);
		}
	} catch (error) {
		logger.error('Error :: ' + error);
		console.log(error);
	}
}

async function apiCall(obj) {
	var options = {
		method: obj['API']['method'],
		uri: obj['API']['uri'],
		headers: obj['API']['header'],
	};

	if (obj['API']['method'] == 'POST')
		options['body'] = obj['API']['body'];

	return await requestPromise(options)
		.then(function (data) {
			console.log(data);
			console.log('\n');
			return data;
		})
		.catch(function (error) {
			logger.error('API call failed by ' + obj['name'] + ' :: ' + error);
			console.log(error);
		});
};

async function sendMail(obj, toEmail = null) {
	var body = '';
	if (toEmail == null) {
		body = obj['email']['body'];
	} else {
		body = toEmail;
	}

	console.log(obj['email']['authentication']['from'])
	console.log(obj['email']['authentication']['password'])

	var transporter = nodemailer.createTransport({
		host: obj['email']['host'],
		auth: {
			user: obj['email']['authentication']['from'],
			pass: obj['email']['authentication']['password']
		}
	})

	var options = {
		from: obj['email']['authentication']['from'],
		to: obj['email']['to'],
		subject: obj['email']['subject'],
		text: body
	}

	try {
		let info = await transporter.sendMail(options);
	} catch (error) {
		logger.error('Email failed by ' + obj['name'] + ' :: ' + error);
		console.log(error);
	}
};

start();