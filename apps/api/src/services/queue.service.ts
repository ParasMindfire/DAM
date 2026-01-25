import { logger } from '@dam/logger';
import { getRabbitMQChannel } from '../config';

interface IQueueMessage {
  assetId: string;
  fileName: string;
  mimeType: string;
  [key: string]: unknown;
}

export class QueueService {
  async publishMessage(
    exchange: string,
    routingKey: string,
    message: IQueueMessage
  ): Promise<void> {
    try {
      const channel = getRabbitMQChannel();
      const messageBuffer = Buffer.from(JSON.stringify(message));

      channel.publish(exchange, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json',
      });

      logger.info(`Message published to ${exchange} with key ${routingKey}`);
    } catch (error) {
      logger.error('Error publishing message:', error);
      throw new Error('Failed to publish message');
    }
  }

  async consumeMessages(
    queue: string,
    callback: (message: IQueueMessage) => Promise<void>
  ): Promise<void> {
    try {
      const channel = getRabbitMQChannel();

      await channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await callback(content);
            channel.ack(msg);
            logger.info(`Message processed from queue: ${queue}`);
          } catch (error) {
            logger.error('Error processing message:', error);
            channel.nack(msg, false, false);
          }
        }
      });

      logger.info(`Started consuming messages from queue: ${queue}`);
    } catch (error) {
      logger.error('Error consuming messages:', error);
      throw new Error('Failed to consume messages');
    }
  }
}

export const queueService = new QueueService();
