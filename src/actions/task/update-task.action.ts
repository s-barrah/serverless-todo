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
    let response;
    const requestData = JSON.parse(event.body);

    return validateAgainstConstraints(requestData, requestConstraints)
        .then(async () => {
            const databaseService = new DatabaseService();
            const params = {
                TableName: process.env.TASK_TABLE,
                Key: {
                    "id": requestData.taskId,
                    "listId": requestData.listId
                },
                UpdateExpression: "set description = :description",
                ExpressionAttributeValues: {
                    ":description": requestData.description,
                }
            }
            return await databaseService.update(params);
        })
        .then((updated) => {
            response = new ResponseModel({ updated }, StatusCode.OK, ResponseMessage.UPDATE_TASK_SUCCESS);
        })
        .catch((error) => {
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.UPDATE_TASK_FAIL);
        })
        .then(() => {
            return response.generate()
        });
}
