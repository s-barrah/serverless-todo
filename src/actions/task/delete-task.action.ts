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
 * Delete task
 *
 * @api {post} /task/delete
 * @apiName Delete task
 * @apiGroup To-Do List
 * @apiDescription Delete task
 *
 * @apiParam {string}         taskId         The id of the task
 *
 * @apiSuccess {object} data
 * @apiSuccess {string} message       The response message
 * @apiSuccess {string} status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *      "listId": "468c8094-a756-4000-a919-974a64b5be8e",
 *      "taskId": "c1219773-19b5-4228-ba7c-06309a0b00ee",
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {},
 *       "message": "Task successfully deleted"
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
export const deleteTask: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
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
        .then(() => {
            // Initialise DynamoDB DELETE parameters
            const params = {
                TableName: TASKS_TABLE,
                Key: {
                    "id": taskId,
                    "listId": listId
                },
            }
            // Delete task from db
            return databaseService.delete(params)
        })
        .then(() => {
            // Set Success Response
            response = new ResponseModel({}, StatusCode.OK, ResponseMessage.DELETE_TASK_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.DELETE_TASK_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
