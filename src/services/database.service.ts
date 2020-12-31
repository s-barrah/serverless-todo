import * as AWS from 'aws-sdk';

// Interfaces
import IConfig from '../interfaces/config.interface';

// Put
type PutItem = AWS.DynamoDB.DocumentClient.PutItemInput;
type PutItemOutput = AWS.DynamoDB.DocumentClient.PutItemOutput;

// Batch write
type BatchWrite = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;
type BatchWriteOutPut = AWS.DynamoDB.DocumentClient.BatchWriteItemOutput;

// Update
type UpdateItem = AWS.DynamoDB.DocumentClient.UpdateItemInput;
type UpdateItemOutPut = AWS.DynamoDB.DocumentClient.UpdateItemOutput;

// Query
type QueryItem = AWS.DynamoDB.DocumentClient.QueryInput;
type QueryItemOutput = AWS.DynamoDB.DocumentClient.QueryOutput;

// Get
type GetItem = AWS.DynamoDB.DocumentClient.GetItemInput;
type GetItemOutput = AWS.DynamoDB.DocumentClient.GetItemOutput;

// Delete
type DeleteItem = AWS.DynamoDB.DocumentClient.DeleteItemInput;
type DeleteItemOutput = AWS.DynamoDB.DocumentClient.DeleteItemOutput;




const config: IConfig = { region: "eu-west-1" };
if (process.env.STAGE === process.env.DYNAMODB_LOCAL_STAGE) {
    config.accessKeyId = process.env.DYNAMODB_LOCAL_ACCESS_KEY_ID; // local dynamodb accessKeyId
    config.secretAccessKey = process.env.DYNAMODB_LOCAL_SECRET_ACCESS_KEY; // local dynamodb secretAccessKey
    config.endpoint = process.env.DYNAMODB_LOCAL_ENDPOINT; // local dynamodb endpoint
}
AWS.config.update(config);

const documentClient = new AWS.DynamoDB.DocumentClient();

export default class DatabaseService {

    create = async(params: PutItem): Promise<PutItemOutput> => {
        try {
            return await documentClient.put(params).promise();
        } catch (error) {
            console.error(`create-error: ${error}`);
        }
    }

    /**
     *  {
            PutRequest: {
                Item: {
                    id: taskData.id,
                    listId: data.id,
                    description: taskData.description,
                    completed: taskData.completed,
                }
            }
        }
     * */
    batchCreate = async(params: BatchWrite): Promise<BatchWriteOutPut> => {
        try {
            return await documentClient.batchWrite(params).promise();
        } catch (error) {
            console.error(`batch-write-error: ${error}`);
        }
    }

    update = async (params: UpdateItem): Promise<UpdateItemOutPut> => {
        try {
            // result.Attributes
            return await documentClient.update(params).promise();
        } catch (error) {
            console.error(`update-error: ${error}`);
            return await Promise.reject(error)
        }
    }

    query = async (params: QueryItem): Promise<QueryItemOutput> => {
        try {
            return await documentClient.query(params).promise();
        } catch (error) {
            console.error(`query-error: ${error}`);
            return await Promise.reject(error)
        }
    }

    get = async (params: GetItem): Promise<GetItemOutput> => {
        try {
            // result.Item
            return await documentClient.get(params).promise();
        } catch (error) {
            console.error(`get-error: ${error}`);
            return await Promise.reject(error)
        }
    }

    delete = async (params: DeleteItem): Promise<DeleteItemOutput> => {
        try {
            return await documentClient.delete(params).promise();
        } catch (error) {
            console.error(`delete-error: ${error}`);
        }
    }

}
