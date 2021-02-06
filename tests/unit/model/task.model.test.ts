import * as chai from 'chai';

import TaskModel from '../../../src/models/task.model';

const taskMock = require('../../mocks/task.mock.json')

const expect = chai.expect;

describe('Model/Task.model', () => {

    describe('Ensure entity mapping', () => {
        it('should return an object with all of the entity values', () => {
            const taskModel = new TaskModel(taskMock);

            expect(taskModel.getEntityMappings()).to.eql({
                id: taskMock.id,
                listId: taskMock.listId,
                description: taskMock.description,
                completed: taskMock.completed,
                timestamp: taskModel.getEntityMappings().timestamp
            });
        });
    });

    describe('Ensure entity hydration', () => {
        it('should be able to get-task-list the hydrated variables from the model', () => {
            const taskModel = new TaskModel(taskMock);

            expect(taskModel.getId()).to.eql(taskMock.id);
            expect(taskModel.getListId()).to.eql(taskMock.listId);
            expect(taskModel.getDescription()).to.eql(taskMock.description);
            expect(taskModel.getCompleted()).to.eql(taskMock.completed);
        });
    })
})
