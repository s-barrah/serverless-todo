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
import requestConstraints from '../../constraints/task/update.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

enum PlaceHolder {
    DESCRIPTION = ':description',
    COMPLETED = ':completed',
}

/***
 * Updates task and insert into database
 *
 * @api {post} /task/update
 * @apiName Updates task
 * @apiGroup To-Do List
 * @apiDescription Update task
 *
 * @apiParam {string}           listId               The id of the to-do list
 * @apiParam {string}           taskId               The task id
 * @apiParam {string}           description          The task description
 *
 * @apiSuccess {object}         data
 * @apiSuccess {string}         message       The response message
 * @apiSuccess {string}         status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "listId": "468c8094-a756-4000-a919-974a64b5be8e",
 *       "taskId": "c1219773-19b5-4228-ba7c-06309a0b00ee",
 *       "description": "Clean the apartment",
 *       "completed": true,
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {},
 *       "message": "Task successfully updated"
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
 *              "taskId": [
 *                  "Task Id can't be blank"
 *              ]
 *              "description": [
 *                  "Description can't be blank"
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
export const updateTask: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    // Initialize response variable
    let response;

    // Parse request parameters
    const requestData = JSON.parse(event.body);

    // Initialise database service
    const databaseService = new DatabaseService();

    // Destructure request data
    const { listId, taskId, completed, description } = requestData

    // Destructure process.env
    const { LIST_TABLE, TASKS_TABLE } = process.env;

    return Promise.all([
        // Validate against constraints
        validateAgainstConstraints(requestData, requestConstraints),
        // Get item from the DynamoDB table
        databaseService.getItem({ key: listId, tableName: LIST_TABLE })
    ])
        .then(async () => {

            // Optional completed parameter
            const isCompletedPresent = typeof completed !== 'undefined';

            // Initialise the update-task-list expression
            const updateExpression = `set ${description ? 'description = :description,' : ''} ${typeof completed !== 'undefined' ? 'completed = :completed,' : ''} updatedAt = :timestamp`;

            // Ensures at least one optional parameter is present
            if (description || isCompletedPresent) {

                // Initialise DynamoDB UPDATE parameters
                const params = {
                    TableName: TASKS_TABLE,
                    Key: {
                        "id": taskId,
                        "listId": listId
                    },
                    UpdateExpression: updateExpression,
                    ExpressionAttributeValues: {
                        ":timestamp": new Date().getTime(),
                    },
                    ReturnValues: "UPDATED_NEW"
                }
                // Set optional values only if present
                if (description) {
                    params.ExpressionAttributeValues[PlaceHolder.DESCRIPTION] = description
                }
                if (isCompletedPresent) {
                    params.ExpressionAttributeValues[PlaceHolder.COMPLETED] = completed
                }

                // Updates item in DynamoDB table
                return await databaseService.update(params);
            }
            // Throws error if none of the optional parameters is present
            throw new ResponseModel({}, StatusCode.BAD_REQUEST, ResponseMessage.INVALID_REQUEST)
        })
        .then((results) => {
            // Set Success Response
            response = new ResponseModel({ ...results.Attributes }, StatusCode.OK, ResponseMessage.UPDATE_TASK_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.UPDATE_TASK_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
