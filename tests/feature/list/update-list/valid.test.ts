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

describe('POST /list/update - Update list in DB', () => {
    let response, statusCode, listId, updatedName = (+new Date).toString(36).slice(-5);

    // Before running the tests, send a request to the endpoint.
    before(function (done) {
        handler.createList(requestData)
            .then((body: Response) => {
                listId = body.data.listId;
                return handler.updateList({ listId, name: updatedName })
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
        expect(response.message).to.eql('To-do list successfully updated');
        done();
    });

    it('should expect a success status', (done) => {
        expect(response.status).to.eql('success');
        done();
    });

    it('should check that name has been updated', () => {
        return handler.getList({ listId })
            .then((response: Response) => {
                expect(response.data.id).to.eql(listId);
                expect(response.data.name).to.eql(updatedName);
                expect(response.data.taskCount).to.eql(0);
                expect(response.data.tasks.length).to.eql(0);
            })
            .catch(() => {
                expect(true).to.eql(false);
            });
    });

})
