import { BlobServiceClient } from "@azure/storage-blob";

const uploadFileToBlob = async (file, location, newFileName = null) => {
  // Create a BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(location);
  await containerClient.createIfNotExists({
    access: "container",
  });
  // Get a block blob client
  const blobName = newFileName ? newFileName : file.originalname;
  const blobClient = containerClient.getBlockBlobClient(blobName);
  // Upload data to the blob
  const uploadBlobResponse = await blobClient.uploadData(file.buffer);
  // Return the URL of the blob
  return blobClient.url;
};

const deleteBlob = async (blobName) => {
  // Create a BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient("images");
  // Get a block blob client
  const blobClient = containerClient.getBlockBlobClient(blobName);
  // Delete the blob
  await blobClient.delete();
};

export { uploadFileToBlob, deleteBlob };
