// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Load credentials and set the region from the JSON file
AWS.config.loadFromPath('../config/config.json');

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var queueURL = 'https://sqs.us-west-1.amazonaws.com/478994730514/app-serverToAnalytics';

var params = {
  AttributeNames: [
    'SentTimestamp'
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    'All'
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 0,
  WaitTimeSeconds: 0
};

sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log('Receive Error', err);
  } else {
    console.log('Message received ', data.Messages[0]);
    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    };
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log('Delete Error', err);
      } else {
        console.log('Message Deleted', data);
      }
    });
  }
});