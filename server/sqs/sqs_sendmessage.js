// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('../config/config.json');

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  DelaySeconds: 10,
  MessageBody: JSON.stringify(restaurantObj),
  QueueUrl: 'https://sqs.us-west-1.amazonaws.com/478994730514/app-serverToAnalytics'
};

sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log('Error"', err);
  } else {
    console.log('Success', data.MessageId);
  }
});