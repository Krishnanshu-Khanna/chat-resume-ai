import { env } from "@/env";
import { Pinecone } from "@pinecone-database/pinecone";

const pineconeClient = new Pinecone({
  apiKey:env.PINECONE_API_KEY,
});

export default pineconeClient;