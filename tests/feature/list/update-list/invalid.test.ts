import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

const expect = chai.expect;


const requestData = {
    "listId": "468c8094-a756-4000-a919-example",
    "name": "My To-do list update",
}

describe('POST /list/update - Invalid list update-task-list request', () => {
    let response, statusCode;

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.updateList(requestData)
            .then((body) => {
                statusCode = 200;
                response = body;
                done();
            })
            .catch((error) => {
                statusCode = error.response.statusCode;
                response = error.response.body;
                done();
            });
    });

    it('should expect a 200 status code', (done) => {
        expect(statusCode).to.eql(200);
        done();
    });

    it('should expect a response message to describe the error', (done) => {
        expect(response.message).to.eql('Invalid Request!');
        done();
    });

    it('should expect response status', (done) => {
        expect(response.status).to.eql('bad request');
        done();
    });

})
