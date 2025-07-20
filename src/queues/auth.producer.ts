import { log } from "@authentication/logger";
import { Channel } from "amqplib";

interface DirectProducerParmas {
  channel: Channel;
  exchangeName: string;
  queueName: string;
  routingKey: string;
  message: string;
  logMessage?: string;
}
export async function publishDirectMessage({
  channel,
  exchangeName,
  queueName,
  routingKey,
  message,
  logMessage,
}: DirectProducerParmas) {
  try {
    await channel.assertExchange(exchangeName, "direct");
    const jobberQueue = await channel.assertQueue(queueName, {
      durable: true,
      autoDelete: false,
    });
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    channel.publish(exchangeName, routingKey, Buffer.from(message), {
      persistent: true,
    });
    log.info(logMessage);
  } catch (error) {
    log.error("AuthService publishDirectMessage() method error", error);
  }
}
