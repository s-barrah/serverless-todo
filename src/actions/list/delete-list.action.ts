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
import { validateAgainstConstraints, createChunks } from "../../utils/util";

// Define the request constraints
import requestConstraints from '../../constraints/list/id.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

/***
 * Delete list
 *
 * @api {post} /list/delete
 * @apiName Delete list
 * @apiGroup To-Do List
 * @apiDescription Delete list
 *
 * @apiParam {string}         listId         The id of the to-do list
 *
 * @apiSuccess {object} data
 * @apiSuccess {string} message       The response message
 * @apiSuccess {string} status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *      "listId": "468c8094-a756-4000-a919-974a64b5be8e",
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {},
 *       "message": "To-do list successfully deleted"
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
export const deleteList: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    let response;
    const requestData = JSON.parse(event.body);
    const databaseService = new DatabaseService();

    return validateAgainstConstraints(requestData, requestConstraints)
        .then(async () => {
            const listParams = {
                TableName: process.env.LIST_TABLE,
                Key: { id: requestData.listId },
            }
            return databaseService.delete(listParams) // Delete to-do list
        })
        .then(async () => {
            const taskParams = {
                TableName: process.env.TASKS_TABLE,
                IndexName : 'list_index',
                KeyConditionExpression : 'listId = :listIdVal',
                ExpressionAttributeValues : {
                    ':listIdVal' : requestData.listId
                }
            };
            const results = await databaseService.query(taskParams); // Find tasks in list
            const taskEntities = results?.Items?.map((item) => {
                return { DeleteRequest: { Key: { id: item.id } } };
            });
            if (taskEntities.length < 25) {
                return databaseService.batchCreate({
                    RequestItems: {
                        [process.env.TASKS_TABLE]: taskEntities, // Batch delete task items
                    }
                });
            }
            const taskChunks = createChunks(taskEntities, 25); // Create chunks if tasks more than 25
            return Promise.all(taskChunks.map((tasks) => {
                return databaseService.batchCreate({
                    RequestItems: {
                        [process.env.TASKS_TABLE]: tasks, // Batch delete task items
                    }
                });
            }));
        })
        .then(() => {
            response = new ResponseModel({}, StatusCode.OK, ResponseMessage.DELETE_LIST_SUCCESS);
        })
        .catch((error) => {
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.DELETE_LIST_FAIL);
        })
        .then(() => {
            return response.generate()
        });
}
