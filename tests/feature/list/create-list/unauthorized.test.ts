import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

const expect = chai.expect;


const requestData = {
    name: "New List"
}

describe('POST /list/create - Unauthorized create list request', () => {
    let response, statusCode;

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.createList(requestData, false)
            .then((body) => {
                // @ts-ignore
                statusCode = body.statusCode;
                response = body;
                done();
            })
            .catch((error) => {
                statusCode = error.response.statusCode;
                response = error.response.body;
                done();
            });
    });

    it('should expect a 401 status code', (done) => {
        expect(statusCode).to.eql(401);
        done();
    });

    it('should expect response to show that request is unauthorized', (done) => {
        expect(response.message).to.eql('Unauthorized');
        expect(response.error).to.eql('Unauthorized');
        done();
    });


})
