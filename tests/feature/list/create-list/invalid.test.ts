import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

const expect = chai.expect;


const requestData = {
    name: 12344567
}

describe('POST /list/create - Invalid create list request', () => {
    let response, statusCode;

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.createList(requestData)
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

    it('should expect response status to show that validation has failed', (done) => {
        expect(response.message).to.eql('required fields are missing');
        done();
    });

    it('Expect validation errors to be listed', (done) => {
        let validationErrors = response.data.validation;
        expect(validationErrors.name[0]).to.eql('Name must be of type string');
        done();
    });

})
