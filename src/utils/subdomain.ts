import { SUBDOMAINS, MODELS } from "@/constants";

export type ChatModel = typeof MODELS.RAG | typeof MODELS.GRAPH_RAG;

// Detect subdomain and return model
export const detectModelFromSubdomain = (): {
  model: ChatModel;
  isSubdomainModel: boolean;
} => {
  if (typeof window === "undefined") {
    return { model: MODELS.RAG as ChatModel, isSubdomainModel: false };
  }

  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];

  if (subdomain === SUBDOMAINS.RAG) {
    return { model: MODELS.RAG as ChatModel, isSubdomainModel: true };
  }

  if (subdomain === SUBDOMAINS.GRAPH_RAG) {
    return { model: MODELS.GRAPH_RAG as ChatModel, isSubdomainModel: true };
  }

  return { model: MODELS.RAG as ChatModel, isSubdomainModel: false };
};
