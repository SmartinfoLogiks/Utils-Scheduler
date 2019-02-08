# silkSync

A nodejs project to make API calls or send e-mails on specified time intervals. It also logs all the errors on the local machine as well as on loggly. Verbose logging is not implemented

## Getting Started

### Requirements

+ nodemailer ^5.1.1
+ request ^2.88.0
+ request-promise ^4.2.2
+ winston ^3.2.1
+ winston-loggly-bulk ^2.0.3

Do ``` npm install ``` to install from package.json

### Quick Start

+ Clone or download the project
+ Open config.json and edit the details
+ Do ```npm install```
+ ```npm start```

## Usage

The format of the JSON object is as follows

For GET request
``` json
{
	"name": "SCHEDULER_NAME",
	"timeInterval": "00:0:00",
	"type": {
		"API": true,
		"sendEmail": false
	},
	"API": {
		"uri": "YOUR_URL",
		"method": "GET",
		"header": "(if headers are needed) || null"
		}
}
```

For POST requests
``` json
{
	"name": "SCHEDULER_NAME",
	"timeInterval": "00:00:00",
	"type": {
		"API": true,
		"sendEmail": false
	},
	"API": {
		"uri": "YOUR_URL",
		"method": "POST",
		"header": {
			"header1": "value",
            "header2": "value"
		},
		"body": "YOUR_DATA"
	}
}

```

For e-mail
``` json
{
	"name": "SCHEDULER_NAME",
	"timeInterval": "00:00:00",
	"type": {
		"API": false,
	"sendEmail": true
	},
	"email": {
		"host": "EMAIL_SERVICE",
		"authentication": {
			"from": "YOUR EMAIL",
			"password": "YOUR PASSWORD"
		},			
		"to": "RECEIVER'S EMAIL",
		"subject": "YOUR_SUBJECT",
		"body": "YOUR_MESSAGE"
	}
}
```

## Example

Below configuration will make an API call and send the result via e-mail every ten seconds

**Note:** In order for nodemailer to work less secure apps options has to be enabled. Follow this link https://www.google.com/settings/security/lesssecureapps
``` json
{
	"name": "scheduler",
	"timeInterval": "00:00:10",
	"type": {
		"API": true,
		"sendEmail": true
	},
	"API": {
		"uri": "https://api.jsonbin.io/b",
		"method": "POST",
		"header": {
			"Content-type": "application/json"
		},
		"body": "{\"Sample\": \"Hello World\"}"
	},
	"email": {
		"host": "smtp.gmail.com",
		"authentication": {
			"from": "example@gmail.com",
			"password": "xxxxxxx"
		},			
		"to": "receiver@gmail.com",
		"subject": "Result of API call",
		"body": ""
	}
}
```

## Built With

* Nodejs - The web framework used

## Authors

* **Mohammedhussain Bharmal** - *Initial work* - [mohammedbharmal](https://github.com/mohammedbharmal/)

## License

This project is licensed under the MIT License - see the [LICENSE.md]() file for details