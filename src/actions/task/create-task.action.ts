import {
    APIGatewayProxyHandler,
    APIGatewayEvent,
    Context,
    APIGatewayProxyResult
} from 'aws-lambda';
import 'source-map-support/register';

// Models
import TaskModel from "../../models/task.model";
import ResponseModel from "../../models/response.model";

// Services
import DatabaseService from "../../services/database.service";

// utils
import { validateAgainstConstraints } from "../../utils/util";

// Define the request constraints
import requestConstraints from '../../constraints/task/create.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

/***
 * Adds tasks to to-do list
 *
 * @api {post} /task/create
 * @apiName Create task
 * @apiGroup To-Do List
 * @apiDescription Create task on to-do list
 *
 * @apiParam {string}        listId              The id of the to-do list
 * @apiParam {string}        description         The description of the task
 * @apiParam {boolean}       completed           The status of the task
 *
 * @apiSuccess {object} data
 * @apiSuccess {string} message       The response message
 * @apiSuccess {string} status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *      "listId": "468c8094-a756-4000-a919-974a64b5be8e",
 *      "description": "Shopping",
 *      "completed": false,
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": { },
 *       "message": "Task successfully added"
 *       "status": "success"
 *     }
 *      *
 *  @apiErrorExample {json} Error-Response: Validation Errors
 *     HTTP/1.1 400 Bad Request
 *    {
 *      "data": {
 *          "validation": {
                "listId": [
                    "List Id can't be blank"
                ],
                "description": [
                    "Description can't be blank"
                ],
                "completed": [
                    "Completed can't be blank"
                ]
            }
 *      },
 *      "message": "required fields are missing",
 *      "status": "bad request"
 *    }
 *
 *  @apiErrorExample {json} Error-Response: Invalid List Id
 *     HTTP/1.1 500 Internal Server Error
 *    {
 *      "data": {
 *          "id": "468c8094-a756-4000-a919-example"
 *      },
 *      "message": "Item does not exist",
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
export const createTask: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    // Initialize response variable
    let response;

    // Parse request parameters
    const requestData = JSON.parse(event.body);

    // Initialise database service
    const databaseService = new DatabaseService();

    return Promise.all([
        // Validate against constraints
        validateAgainstConstraints(requestData, requestConstraints),
        // Get item from the DynamoDB table
        databaseService.getItem({ key: requestData.listId, tableName: process.env.LIST_TABLE })
    ])
        .then(async () => {

            // Initialise and hydrate model
            const taskModel = new TaskModel(requestData);

            // Get model data
            const data = taskModel.getEntityMappings();

            // Initialise DynamoDB PUT parameters
            const params = {
                TableName: process.env.TASKS_TABLE,
                Item: {
                    id: data.id,
                    listId: data.listId,
                    description: data.description,
                    completed: data.completed,
                    createdAt: data.timestamp,
                    updatedAt: data.timestamp,
                }
            }
            // Inserts item into DynamoDB table
            await databaseService.create(params);
            return data.id;
        })
        .then((taskId) => {
            // Set Success Response
            response = new ResponseModel({ taskId }, StatusCode.OK, ResponseMessage.CREATE_TASK_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.CREATE_TASK_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
