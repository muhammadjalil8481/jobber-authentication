import { Client } from "@elastic/elasticsearch";
import { log } from "./logger";
import {
  ClusterHealthResponse,
  GetResponse,
} from "@elastic/elasticsearch/lib/api/types";
import { config } from "./config";

class ElasticSearch {
  public elasticSearchClient: Client;
  constructor() {
    this.elasticSearchClient = new Client({
      node: config.ELASTIC_SEARCH_URL,
    });
  }

  public async checkConnection() {
    let isConnected = false;
    while (!isConnected) {
      log.info("Authentication service connecting to Elasticsearch...");
      try {
        const health: ClusterHealthResponse =
          await this.elasticSearchClient.cluster.health({});
        log.info(
          `Authentication service Elasticsearch connection successful: ${health.status}`
        );
        await this.createIndex("gigs");
        isConnected = true;
      } catch (error) {
        log.error(
          "Authentication service Elasticsearch connection error:",
          error
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  public async checkIndexExists(indexName: string): Promise<boolean> {
    try {
      const exists = await this.elasticSearchClient.indices.exists({
        index: indexName,
      });
      return exists;
    } catch (error) {
      log.error(`Error checking if index ${indexName} exists:`, error);
      return false;
    }
  }

  async createIndex(indexName: string): Promise<void> {
    try {
      const result = await this.checkIndexExists(indexName);
      if (result) {
        log.info(`Index ${indexName} already exists.`);
      } else {
        await this.elasticSearchClient.indices.create({
          index: indexName,
        });
        await this.elasticSearchClient.indices.refresh({
          index: indexName,
        });
        log.info(`Index ${indexName} created successfully.`);
      }
    } catch (error) {
      log.error(
        `Authentication service Elasticsearch create index ${indexName} error:`,
        error
      );
    }
  }

  async getGigById<T>(index: string, id: string): Promise<T | undefined> {
    try {
      const result: GetResponse = await this.elasticSearchClient.get({
        index,
        id,
      });
      return result._source as T;
    } catch (error) {
      log.error(
        `Auth Service Error getting gig by ID ${id} from index ${index}:`,
        error
      );
      return undefined;
    }
  }
}

export const elasticsearch = new ElasticSearch();

export const elasticSearchClient = elasticsearch.elasticSearchClient;
