import {
    APIGatewayProxyHandler,
    APIGatewayEvent,
    Context,
    APIGatewayProxyResult
} from 'aws-lambda';
import 'source-map-support/register';

// Models
import ListModel from "../../models/list.model";
import ResponseModel from "../../models/response.model";

// Services
import DatabaseService from "../../services/database.service";

// utils
import { validateAgainstConstraints } from "../../utils/util";

// Define the request constraints
import requestConstraints from '../../constraints/list/create.constraint.json';

// Enums
import { StatusCode } from "../../enums/status-code.enum";
import { ResponseMessage } from "../../enums/response-message.enum";

/***
 * Create to-do list and insert into database
 *
 * @api {post} /list/create
 * @apiName Create to-do list
 * @apiGroup To-Do List
 * @apiDescription Create to-do list
 *
 * @apiParam {string}           name          The name of the list
 *
 * @apiSuccess {object}         data
 * @apiSuccess {string}         message       The response message
 * @apiSuccess {string}         status        The response status
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *      "name": "My To-do list",
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": { "listId": "468c8094-a756-4000-a919-974a64b5be8e" },
 *       "message": "To-do List successfully created"
 *       "status": "success"
 *     }
 *      *
 *  @apiErrorExample {json} Error-Response: Validation Errors
 *     HTTP/1.1 400 Bad Request
 *    {
 *      "data": {
 *          "validation": {
                "name": [
                    "Name can't be blank"
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
export const createList: APIGatewayProxyHandler = async (event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> => {
    // Initialize response variable
    let response;

    // Parse request parameters
    const requestData = JSON.parse(event.body);

    // Validate against constraints
    return validateAgainstConstraints(requestData, requestConstraints)
        .then(async () => {
            // Initialise database service
            const databaseService = new DatabaseService();

            // Initialise and hydrate model
            const listModel = new ListModel(requestData);

            // Get model data
            const data = listModel.getEntityMappings();

            // Initialise DynamoDB PUT parameters
            const params = {
                TableName: process.env.LIST_TABLE,
                Item: {
                    id: data.id,
                    name: data.name,
                    createdAt: data.timestamp,
                    updatedAt: data.timestamp,
                }
            }
            // Inserts item into DynamoDB table
            await databaseService.create(params);
            return data.id;
        })
        .then((listId) => {
            // Set Success Response
            response = new ResponseModel({ listId }, StatusCode.OK, ResponseMessage.CREATE_LIST_SUCCESS);
        })
        .catch((error) => {
            // Set Error Response
            response = (error instanceof ResponseModel) ? error : new ResponseModel({}, StatusCode.ERROR, ResponseMessage.CREATE_LIST_FAIL);
        })
        .then(() => {
            // Return API Response
            return response.generate()
        });
}
