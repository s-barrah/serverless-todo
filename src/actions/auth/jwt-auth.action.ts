import {
    APIGatewayAuthorizerEvent,
    Context,
    Callback
} from 'aws-lambda';

import AuthService from "../../services/auth.service";

export const jwtAuth = async (event: APIGatewayAuthorizerEvent, _context: Context, callback: Callback) => {

    const authService = new AuthService();
    let response;
    try {
        response = await authService.authenticate(event);
    }
    catch (err) {
        callback("Unauthorized");   // Return a 401 Unauthorized response
    }
    return response;

}
