export default {
    ListTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
            TableName: '${self:provider.environment.LIST_TABLE}',
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: '${self:custom.table_throughput}',
                WriteCapacityUnits: '${self:custom.table_throughput}'
            }
        }
    },
    TasksTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
            TableName: '${self:provider.environment.TASKS_TABLE}',
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
                { AttributeName: 'listId', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' },
                { AttributeName: 'listId', KeyType: 'RANGE' }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: '${self:custom.table_throughput}',
                WriteCapacityUnits: '${self:custom.table_throughput}'
            },
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'list_index',
                    KeySchema: [
                        { AttributeName: 'listId', KeyType: 'HASH' },
                    ],
                    Projection: { // attributes to project into the index
                        ProjectionType: 'ALL' // (ALL | KEYS_ONLY | INCLUDE)
                    },
                    ProvisionedThroughput: {
                        ReadCapacityUnits: '${self:custom.table_throughput}',
                        WriteCapacityUnits: '${self:custom.table_throughput}'
                    },
                }
            ]
        }
    }
}
