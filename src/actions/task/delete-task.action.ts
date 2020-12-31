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
import requestConstraints from '../../constraints/task/id.constraint.json';

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
 *      "taskId": "468c8094-a756-4000-a919-974a64b5be8e",
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
    let response;
    const requestData = JSON.parse(event.body);
    const databaseService = new DatabaseService();

    console.log('DELETE TASK ACTION TRIGGERED ---- requestData: ', requestData);

    return validateAgainstConstraints(requestData, requestConstraints)
        .then(async () => {
            console.log('DELETE TASK ACTION TRIGGERED ---- VALIDATED');
            const params = {
                TableName: process.env.TASK_TABLE,
                Key: { id: requestData.taskId },
            }
            return databaseService.delete(params) // Delete task from db
        })
        .then(() => {
            response = new ResponseModel({}, StatusCode.OK, ResponseMessage.DELETE_TASK_SUCCESS);
        })
        .catch((error) => {
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.DELETE_TASK_FAIL);
        })
        .then(() => {
            return response.generate()
        });
}
