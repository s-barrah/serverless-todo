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
import requestConstraints from '../../constraints/list/id.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";


/***
 * Get list
 *
 * @api {post} /list
 * @apiName Get list
 * @apiGroup To-Do List
 * @apiDescription Get list
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
 *       "data": {
 *          "name": "My Wednesday List",
 *          "createdAt": 1609383835145,
 *          "id": "468c8094-a756-4000-a919-974a64b5be8e",
 *          "updatedAt": 1609468610216,
 *          "tasks": [
 *              {
 *                "id": "c1219773-19b5-4228-ba7c-06309a0b00ee",
 *                "description": "To go shopping",
 *                "completed": false
 *              },
 *              {
 *                "id": "e8b92a93-55c9-46d2-a39e-2fc11d314f71",
 *                "description": "Watch TV",
 *                "completed": false
 *              },
 *              {
 *                "id": "39662ac3-cd1c-4a7a-9b74-c1c6423ce800",
 *                "description": "Sleep",
 *                "completed": false
 *              },
 *              {
 *                "id": "35899e48-d692-4423-96a1-2c98d7bd04ef",
 *                "description": "Eat",
 *                "completed": false
 *              }
 *           ]
 *        },
 *       "message": "To-do list successfully retrieved"
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
export const getList: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    let response;
    const requestData = JSON.parse(event.body);

    const databaseService = new DatabaseService();

    return validateAgainstConstraints(requestData, requestConstraints)
        .then(async () => {
            return await databaseService.getItem({ key: requestData.listId, tableName: process.env.LIST_TABLE });
        })
        .then( async (data) => {
            const params = {
                TableName: process.env.TASKS_TABLE,
                IndexName : 'list_index',
                KeyConditionExpression : 'listId = :listIdVal',
                ExpressionAttributeValues : {
                    ':listIdVal' : requestData.listId
                }
            };
            const results = await databaseService.query(params);
            const tasksData = results?.Items?.map((task) => {
                return {
                    id: task.id,
                    description: task.description,
                    completed: task.completed,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                }
            });
            response = new ResponseModel({
                ...data.Item,
                tasks: tasksData,
            }, StatusCode.OK, ResponseMessage.GET_LIST_SUCCESS);

        })
        /*.then((results) => {
            const data = results?.Items?.map((task) => {
                return {
                    id: task.id,
                    description: task.description,
                    completed: task.completed,
                }
            });
            if (!data.length) {
                response = new ResponseModel({}, StatusCode.BAD_REQUEST, ResponseMessage.GET_LIST_FAIL);
            } else {
                response = new ResponseModel({
                    ...results[0],
                    tasks: data
                }, StatusCode.OK, ResponseMessage.GET_LIST_SUCCESS);
            }

        })*/
        .catch((error) => {
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.GET_LIST_FAIL);
        })
        .then(() => {
            return response.generate()
        });
}
