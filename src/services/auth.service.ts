import jwt, { VerifyOptions, JwtHeader  } from 'jsonwebtoken';
import jwks from 'jwks-rsa';
import { APIGatewayAuthorizerEvent, PolicyDocument } from 'aws-lambda';

interface IPayload {
    iss: string;
    sub: string;
    aud: string;
    iat: number;
    exp: number;
    azp: string;
    gty: string;
    scope?: unknown;
}
interface IDecode {
    header: JwtHeader,
    payload: IPayload,
    signature: string;
}


export default class AuthService {
    private jwksUri: string;
    private audience: string;
    constructor() {
        this.jwksUri = process.env.JWKS_URI;
        this.audience = process.env.AUDIENCE;
    }

    /**
     * Generate policy document request
     * @param effect
     * @param resource
     * @return PolicyDocument
     */
    getPolicyDocument = (effect: string, resource: string): PolicyDocument => {
        return {
            Version: '2012-10-17', // default version
            Statement: [{
                Action: 'execute-api:Invoke', // default action
                Effect: effect,
                Resource: resource,
            }]
        };
    }

    /**
     * Get token from event
     * @param event
     * @return string
     */
    _getToken = (event: APIGatewayAuthorizerEvent): string => {
        if (!event.type || event.type !== 'TOKEN') {
            throw new Error('Expected "event.type" parameter to have value "TOKEN"');
        }

        const tokenString = event.authorizationToken;
        if (!tokenString) {
            throw new Error('Expected "event.authorizationToken" parameter to be set');
        }

        const match = tokenString.match(/^Bearer (.*)$/);
        if (!match || match.length < 2) {
            throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`);
        }
        return match[1];
    }

    /**
     * Authenticate Request Token
     * @param event
     * @return {Promise<*>}
     */
    authenticate = (event: APIGatewayAuthorizerEvent) => {
        const token = this._getToken(event);
        const decoded = (jwt.decode(token, { complete: true })) as IDecode;

        if (!decoded || !decoded.header || !decoded.header.kid) {
            throw new Error('invalid token');
        }
        const options = {
            audience: this.audience,
            algorithms: ['RS256'],
        } as VerifyOptions;
        return this._getSigningKey(decoded.header.kid)
            .then((key) => jwt.verify(token, key, options))
            .then((decoded: IPayload) => {
                return ({
                    principalId: decoded?.sub,
                    policyDocument: this.getPolicyDocument('Allow', event.methodArn),
                    context: { scope: decoded.scope }
                })
            });
    }


    /**
     * Get signing key from auth0
     * @param kid
     * @return Promise<string>
     */
    _getSigningKey = (kid: string): Promise<string> => {
        const client = jwks({
            strictSsl: true,
            jwksUri: this.jwksUri,
        });
        return new Promise((resolve, reject) =>  {
            client.getSigningKey(kid, ((error, key) => {
                if (error) {
                    reject(error);
                }
                if ("publicKey" in key) {
                    resolve(key.publicKey);
                } else if ("rsaPublicKey" in key) {
                    resolve(key.rsaPublicKey);
                }
            }));
        })
    }

}
