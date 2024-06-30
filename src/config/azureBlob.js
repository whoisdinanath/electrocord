import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";


dotenv.config();

const { ACCOUNT_NAME, SAS_TOKEN, PHOTO_CONTAINER, VIDEO_CONTAINER, AUDIO_CONTAINER, DOCUMENT_CONTAINER, OTHER_CONTAINER } = process.env;

export const blobServiceClient = new BlobServiceClient(
    `https://${ACCOUNT_NAME}.blob.core.windows.net?${SAS_TOKEN}`
);

export const photoContainer = blobServiceClient.getContainerClient(PHOTO_CONTAINER);
export const videoContainer = blobServiceClient.getContainerClient(VIDEO_CONTAINER);
export const audioContainer = blobServiceClient.getContainerClient(AUDIO_CONTAINER);
export const documentContainer = blobServiceClient.getContainerClient(DOCUMENT_CONTAINER);
export const otherContainer = blobServiceClient.getContainerClient(OTHER_CONTAINER);
