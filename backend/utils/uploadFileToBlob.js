import { BlobServiceClient } from "@azure/storage-blob";

const uploadFileToBlob = async (file) => {
  // Create a BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient("images");
  await containerClient.createIfNotExists({
    access: "container",
  });
  // Get a block blob client
  const blobClient = containerClient.getBlockBlobClient(file.originalname);
  // Upload data to the blob
  const uploadBlobResponse = await blobClient.uploadData(file.buffer);
  // Return the URL of the blob
  return blobClient.url;
};

export { uploadFileToBlob };
