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
 *       "name": "My To-do list update",
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
    let response;
    const requestData = JSON.parse(event.body);

    return validateAgainstConstraints(requestData, requestConstraints)
        .then(async () => {
            const databaseService = new DatabaseService();
            const params = {
                TableName: process.env.LIST_TABLE,
                Key: {
                    "id": requestData.listId
                },
                UpdateExpression: "set #name = :name",
                ExpressionAttributeNames: {
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":name": requestData.name,
                }
            }
            return await databaseService.update(params);
        })
        .then((updated) => {
            response = new ResponseModel({ updated }, StatusCode.OK, ResponseMessage.UPDATE_LIST_SUCCESS);
        })
        .catch((error) => {
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.UPDATE_LIST_FAIL);
        })
        .then(() => {
            return response.generate()
        });
}
