import {
    APIGatewayProxyHandler,
    APIGatewayEvent,
    Context,
    APIGatewayProxyResult
} from 'aws-lambda';
import 'source-map-support/register';

// Models
import ResponseModel from "../../models/response.model";

// Services
import DatabaseService from "../../services/database.service";

// utils
import { validateAgainstConstraints } from "../../utils/util";

// Define the request constraints
import requestConstraints from '../../constraints/list/update.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

/***
 * Updates to-do list and insert into database
 *
 * @api {post} /list/update
 * @apiName Update to-do list
 * @apiGroup To-Do List
 * @apiDescription Update to-do list
 *
 * @apiParam {string}           listId        The id of the to-do list
 * @apiParam {string}           name          The name of the list
 *
 * @apiSuccess {object}         data
 * @apiSuccess {string}         message       The response message
 * @apiSuccess {string}         status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "listId": "468c8094-a756-4000-a919-974a64b5be8e",
 *       "name": "My To-do list update-task-list",
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {},
 *       "message": "To-do List successfully updated"
 *       "status": "success"
 *     }
 *      *
 *  @apiErrorExample {json} Error-Response: Validation Errors
 *     HTTP/1.1 400 Bad Request
 *    {
 *      "data": {
 *          "validation": {
 *              "listId": [
 *                  "List Id can't be blank"
 *              ]
 *              "name": [
 *                  "Name can't be blank"
 *              ]
 *          }
 *      },
 *      "message": "required fields are missing",
 *      "status": "bad request"
 *    }
 *
 *  @apiErrorExample {json} Error-Response: Unknown Error
 *     HTTP/1.1 500 Internal Server Error
 *    {
 *      "data": {},
 *      "message": "Unknown error",
 *      "status": "error"
 *    }
 */
export const updateList: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    // Initialize response variable
    let response;

    // Parse request parameters
    const requestData = JSON.parse(event.body);

    // Initialise database service
    const databaseService = new DatabaseService();

    // Destructure environmental variable
    const { LIST_TABLE } = process.env;

    // Destructure request data
    const { listId, name } = requestData


    return Promise.all([
        // Validate against constraints
        validateAgainstConstraints(requestData, requestConstraints),
        // Item exists
        databaseService.getItem({key: listId, tableName: LIST_TABLE})
    ])
        .then(async () => {

            // Initialise DynamoDB UPDATE parameters
            const params = {
                TableName: LIST_TABLE,
                Key: {
                    "id": listId
                },
                UpdateExpression: "set #name = :name, updatedAt = :timestamp",
                ExpressionAttributeNames: {
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":name": name,
                    ":timestamp": new Date().getTime(),
                },
                ReturnValues: "UPDATED_NEW"
            }
            // Updates Item in DynamoDB table
            return await databaseService.update(params);
        })
        .then((results) => {
            // Set Success Response
            response = new ResponseModel({ ...results.Attributes }, StatusCode.OK, ResponseMessage.UPDATE_LIST_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.UPDATE_LIST_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
