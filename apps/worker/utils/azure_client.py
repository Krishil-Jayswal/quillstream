from azure.storage.blob import BlobServiceClient
from config import settings

service_client = BlobServiceClient.from_connection_string(settings.ABS_CONNECTION_URL)

container_client = service_client.get_container_client(settings.ABS_CONTAINER_NAME)

def download_video(blob_id: str, file_path: str):
    blob = container_client.get_blob_client(blob_id)
    f = open(file_path, "wb")
    blob_data = blob.download_blob()
    blob_data.readinto(f)
    f.close()