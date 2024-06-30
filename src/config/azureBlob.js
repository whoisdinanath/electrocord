import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";


dotenv.config();

const { ACCOUNT_NAME, CONTAINER_NAME, SAS_TOKEN} = process.env;


export const blobServiceClient = new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net${SAS_TOKEN}`
);

export const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
