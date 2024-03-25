import { BlobServiceClient } from "@azure/storage-blob";

const uploadFileToBlob = async (file) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = blobServiceClient.getContainerClient("images");
  await containerClient.createIfNotExists({
    access: "container",
  });

  const blobClient = containerClient.getBlockBlobClient(file.originalname);
  const uploadBlobResponse = await blobClient.uploadData(file.buffer);
  return blobClient.url;
};

export { uploadFileToBlob };
