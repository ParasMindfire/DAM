import amqp from 'amqplib/callback_api';
import { logger } from '@dam/logger';
import { QUEUE_CONSTANTS } from '@dam/shared';

let channel: amqp.Channel | null = null;

export const initializeRabbitMQ = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost', (error, connection) => {
      if (error) {
        logger.error('Error connecting to RabbitMQ:', error);
        reject(error);
        return;
      }

      connection.createChannel((err, ch) => {
        if (err) {
          logger.error('Error creating channel:', err);
          reject(err);
          return;
        }

        channel = ch;

        // Setup exchanges and queues
        ch.assertExchange(QUEUE_CONSTANTS.EXCHANGES.ASSET, 'topic', { durable: true });

        Object.values(QUEUE_CONSTANTS.QUEUES).forEach((queue) => {
          ch.assertQueue(queue, { durable: true });
        });

        ch.bindQueue(
          QUEUE_CONSTANTS.QUEUES.THUMBNAIL_GENERATION,
          QUEUE_CONSTANTS.EXCHANGES.ASSET,
          QUEUE_CONSTANTS.ROUTING_KEYS.ASSET_UPLOADED
        );

        logger.info('RabbitMQ initialized successfully');
        resolve();
      });
    });
  });
};

export const getRabbitMQChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) {
    // You MUST provide a function, even if it's empty
    channel.close((err) => {
      if (err) logger.error('Error closing channel:', err);
      else logger.info('RabbitMQ channel closed');
    });
  }
};
