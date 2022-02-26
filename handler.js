'use strict';
const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.listAllNFTs = async (event) => {
  if (event.headers.Authorization) {
    let token = event.headers.Authorization.split(' ')[1];
    if (token != "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c") {
      return {
        statusCode: 401,
        body: JSON.stringify(
          {
            errors: [
              {
                message: 'You are not authorized to perform this operation'
              }
            ]
          },
          null,
          2
        ),
      };
    }
  }
  else {
    return {
      statusCode: 401,
      body: JSON.stringify(
        {
          errors: [
            {
              message: 'You are not authenticated'
            }
          ]
        },
        null,
        2
      ),
    };
  }

  if (!event.queryStringParameters || (event.queryStringParameters && !event.queryStringParameters.ownerId)) {
    return {
      statusCode: 404,
      body: JSON.stringify(
        {
          errors: [
            {
              message: 'The query parameter "ownerId" is required.'
            }
          ]
        },
        null,
        2
      ),
    };
  }
  else {
    let table = "nfts";
    let params = {
      TableName: table,
      FilterExpression: 'ownerId = :ownerId',
      ExpressionAttributeValues: { ':ownerId': event.queryStringParameters.ownerId }
    };
    try {
      let result = await docClient.scan(params).promise();
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: 'NFTs retrieved successfully',
            data: result.Items
          },
          null,
          2
        ),
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify(
          {
            errors: [
              {
                message: 'Failed to retrieve NFTs'
              }
            ]
          },
          null,
          2
        ),
      };
    }
  }
};
