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
import requestConstraints from '../../constraints/task/get.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

/***
 * Get task
 *
 * @api {post} /task
 * @apiName Get task
 * @apiGroup To-Do List
 * @apiDescription Get task
 *
 * @apiParam {string}         listId         The id of the list
 * @apiParam {string}         taskId         The id of the task
 *
 * @apiSuccess {object} data
 * @apiSuccess {string} message       The response message
 * @apiSuccess {string} status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "listId": "e784e0cb-ce5f-4ce5-8b9f-8fb243d332cf",
 *       "taskId": "468c8094-a756-4000-a919-974a64b5be8e",
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {
 *           listId: '3e790b70-d27c-49db-9fc4-b07d7e636c2e',
 *           description: 'Buy some milk',
 *           createdAt: 1609773184678,
 *           id: 'f17cfcee-a636-4a94-a6d4-818c86a6a450',
 *           completed: false,
 *           updatedAt: 1609773184678
 *       },
 *       "message": "Task successfully retrieved"
 *       "status": "success"
 *     }
 *      *
 *  @apiErrorExample {json} Error-Response: Validation Errors
 *     HTTP/1.1 400 Bad Request
 *    {
 *      "data": {
 *          "validation": {
                "taskId": [
                    "Task Id can't be blank"
                ]
            }
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
export const getTask: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    // Initialize response variable
    let response;

    // Parse request parameters
    const requestData = JSON.parse(event.body);

    // Initialise database service
    const databaseService = new DatabaseService();

    // Destructure request data
    const { taskId, listId } = requestData

    // Destructure process.env
    const { TASKS_TABLE } = process.env;

    // Validate against constraints
    return validateAgainstConstraints(requestData, requestConstraints)
        .then(() => {
            // Get item from the DynamoDB table
            // if it exists
            return databaseService.getItem({
                key: taskId,
                hash: 'listId',
                hashValue: listId,
                tableName: TASKS_TABLE
            })
        })
        .then((data) => {
            // Set Success Response
            response = new ResponseModel({ ...data.Item  }, StatusCode.OK, ResponseMessage.GET_TASK_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.GET_TASK_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
