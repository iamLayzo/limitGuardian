import { Store } from '../types';
import { DynamoDBClient, GetItemCommand, PutItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

export default class DynamoStore implements Store {
  private client: DynamoDBClient;
  private tableName: string;
  private windowMs: number;

  constructor(client: DynamoDBClient, tableName: string, windowMs: number) {
    this.client = client;
    this.tableName = tableName;
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    const params = {
      TableName: this.tableName,
      Key: { 'key': { S: key } }
    };

    const record = await this.client.send(new GetItemCommand(params));

    let totalHits = 1;
    let resetTime = new Date(Date.now() + this.windowMs);

    if (record.Item) {
      totalHits = Number(record.Item.totalHits?.N || 1) + 1;
      resetTime = new Date(record.Item.resetTime?.S || Date.now() + this.windowMs);
    }

    const putParams = {
      TableName: this.tableName,
      Item: {
        'key': { S: key },
        'totalHits': { N: totalHits.toString() },
        'resetTime': { S: resetTime.toISOString() }
      }
    };

    await this.client.send(new PutItemCommand(putParams));

    return { totalHits, resetTime };
  }

  async resetKey(key: string): Promise<void> {
    const deleteParams = {
      TableName: this.tableName,
      Key: { 'key': { S: key } }
    };

    await this.client.send(new DeleteItemCommand(deleteParams)); 
  }

  async decrement(key: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { 'key': { S: key } }
    };

    const record = await this.client.send(new GetItemCommand(params));

    if (record.Item) {
      let totalHits = Number(record.Item.totalHits?.N || 1);

      if (totalHits > 1) {
        totalHits--;

        const updateParams = {
          TableName: this.tableName,
          Item: {
            'key': { S: key },
            'totalHits': { N: totalHits.toString() },
            'resetTime': { S: record.Item.resetTime?.S || new Date(Date.now() + this.windowMs).toISOString() }
          }
        };

        await this.client.send(new PutItemCommand(updateParams));
      } else {
        await this.resetKey(key);
      }
    }
  }
}
