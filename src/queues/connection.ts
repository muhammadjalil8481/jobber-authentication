import client, { Channel, ChannelModel } from "amqplib";
import { log } from "@authentication/logger";
import { config } from "@authentication/config";

async function createConnection(): Promise<Channel | undefined> {
  let retries = 0;
  log.info(
    `Authentication service createConnection() method: Connecting to RabbitMQ ${config.RABBITMQ_ENDPOINT}...`
  );
  try {
    const connection: ChannelModel = await client.connect(
      `${config.RABBITMQ_ENDPOINT}`
    );
    const channel: Channel = await connection.createChannel();
    log.info("Authentication service connected to RabbitMQ successfully");

    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    retries++;
    if (retries >= 3) {
      log.error("Authentication service createConnection() method", error);
      process.exit(1);
    }
  }
}

function closeConnection(channel: Channel, connection: ChannelModel): void {
  process.once("SIGINT", async () => {
    await channel.close();
    await connection.close();
  });
}
export { createConnection };
