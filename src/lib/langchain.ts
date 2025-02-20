import { env } from "@/env";
import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PineconeStore } from "@langchain/pinecone";
// import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import pineconeClient from "./pinecone";
import prisma from "./prisma";

const model = new ChatOpenAI({
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_MODEL,
});

export const indexName = env.PINECONE_INDEX_NAME;


async function fetchMessagesFromDB(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  console.log("--- Fetching chat history from Prisma... ---");

  // Prisma query to get chat history
  const messages = await prisma.message.findMany({
    where: {
      chatId: docId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Convert to LangChain-compatible format
  const chatHistory = messages.map((msg) =>
    msg.role === "human"
      ? new HumanMessage(msg.message)
      : new AIMessage(msg.message),
  );

  console.log(`✅ Fetched ${chatHistory.length} messages.`);
  return chatHistory;
}
// ✅ Function to Extract Text from PDF
export async function generateDocs(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("🚨 User not found");
  }

  console.log(`📌 Fetching PDF URL from Prisma for Doc ID: ${docId}`);

  const result = await prisma.chatPDF.findUnique({
    where: { chatId: docId },
  });

  if (!result || !result.pdfUrl) {
    throw new Error("🚨 PDF URL not found in Prisma.");
  }

  console.log(`✅ PDF URL retrieved: ${result.pdfUrl}`);

  try {
    console.log("📌 Fetching PDF from URL...");
    const response = await fetch(result.pdfUrl);

    if (!response.ok) {
      throw new Error(`🚨 Failed to fetch PDF: ${response.statusText}`);
    }

    const pdfBuffer = await response.arrayBuffer(); // ✅ Corrected
    const loader = new PDFLoader(new Blob([pdfBuffer]));
    console.log("✅ PDF Loaded Successfully!");

    console.log("📌 Splitting PDF into sections...");
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(await loader.load());

    console.log(`✅ Split PDF into ${splitDocs.length} sections.`);
    return splitDocs;
  } catch (error) {
    console.error("🚨 Error processing PDF:", error);
    throw new Error("PDF Processing Failed.");
  }
}

// ✅ Function to Check if Namespace Exists in Pinecone
async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string,
) {
  if (!namespace) throw new Error("🚨 No namespace value provided.");

  try {
    console.log(
      `📌 Checking if namespace '${namespace}' exists in Pinecone...`,
    );
    const { namespaces } = await index.describeIndexStats();

    if (namespaces?.[namespace] !== undefined) {
      console.log(`✅ Namespace '${namespace}' exists.`);
      return true;
    }
    console.log(`❌ Namespace '${namespace}' does not exist.`);
    return false;
  } catch (error) {
    console.error("🚨 Error checking namespace:", error);
    return false;
  }
}

// ✅ Function to Generate and Store Embeddings
export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("🚨 User not found");
  }

  try {
    console.log("📌 Initializing OpenAI embeddings...");
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-ada-002",
    });

    console.log("📌 Connecting to Pinecone index...");
    const index = await pineconeClient.index(indexName);

    const namespaceAlreadyExists = await namespaceExists(index, docId);

    if (namespaceAlreadyExists) {
      console.log(`✅ Namespace '${docId}' exists. Using existing embeddings.`);
      return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: docId,
      });
    }

    console.log("📌 Extracting text from PDF...");
    const splitDocs = await generateDocs(docId);

    console.log(`📌 Storing ${splitDocs.length} documents in Pinecone...`);
    return await PineconeStore.fromDocuments(splitDocs, embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
  } catch (error) {
    console.error("🚨 Error during embedding process:", error);
    throw new Error("Embedding process failed.");
  }
}

const generateLangchainCompletion = async (docId: string, question: string) => {
  const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
  if (!pineconeVectorStore) {
    throw new Error("Pinecone vector store not found");
  }

  // Create a retriever to search through the vector store
  console.log("--- Creating a retriever... ---");
  const retriever = pineconeVectorStore.asRetriever();

  // Fetch the chat history from the database
  const chatHistory = await fetchMessagesFromDB(docId);

  // Define a prompt template for generating search queries based on conversation history
  console.log("--- Defining a prompt template... ---");
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory, // Insert the actual chat history here

    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
    ],
  ]);

  // Create a history-aware retriever chain that uses the model, retriever, and prompt
  console.log("--- Creating a history-aware retriever chain... ---");
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // Define a prompt template for answering questions based on retrieved context
  console.log("--- Defining a prompt template for answering questions... ---");
  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's questions based on the below context:\n\n{context}",
    ],

    ...chatHistory, // Insert the actual chat history here

    ["user", "{input}"],
  ]);

  // Create a chain to combine the retrieved documents into a coherent response
  console.log("--- Creating a document combining chain... ---");
  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });

  // Create the main retrieval chain that combines the history-aware retriever and document combining chains
  console.log("--- Creating the main retrieval chain... ---");
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log("--- Running the chain with a sample conversation... ---");
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  // Print the result to the console
  console.log(reply.answer);
  return reply.answer;
};

// Export the model and the run function
export { model, generateLangchainCompletion };