import { log } from "@authentication/logger";
import { Channel } from "amqplib";

interface DirectProducerParmas {
  channel: Channel;
  exchangeName: string;
  routingKey: string;
  message: string;
  logMessage?: string;
}
export async function publishDirectMessage({
  channel,
  exchangeName,
  routingKey,
  message,
  logMessage,
}: DirectProducerParmas) {
  try {
    await channel.assertExchange(exchangeName, "direct");
    channel.publish(exchangeName, routingKey, Buffer.from(message));
    log.info(logMessage);
  } catch (error) {
    log.error("AuthService publishDirectMessage() method error", error);
  }
}
