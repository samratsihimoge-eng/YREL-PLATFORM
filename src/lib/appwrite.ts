import { Account, Client } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://sgp.cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6b083d3e000ee339326b";

export const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId);
export const appwriteAccount = new Account(appwriteClient);

export const appwriteReady = Boolean(endpoint && projectId);
