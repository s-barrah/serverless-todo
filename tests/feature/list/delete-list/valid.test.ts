import * as chai from 'chai';

import handler from '../../../lib/actions/handler';

type Response = {
    data: any;
    message: string;
    status: string;
}

const expect = chai.expect;


const requestData = {
    name: "My To do list"
}

describe('POST /list/delete - Delete list in DB', () => {
    let response, statusCode, listId;

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.createList(requestData)
            .then((body: Response) => {
                listId = body.data.listId;
                return handler.deleteList({ listId });
            })
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

    it('should expect a success message', (done) => {
        expect(response.message).to.eql('To-do list successfully deleted');
        done();
    });

    it('should expect a success status', (done) => {
        expect(response.status).to.eql('success');
        done();
    });

    it('should check that list has been deleted', () => {
        return handler.getList({ listId })
            .then(() => {
                expect(true).to.eql(false);
            })
            .catch(() => {
                expect(true).to.eql(true);
            });
    });

})
