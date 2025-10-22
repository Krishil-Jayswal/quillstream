import os
import mimetypes
from tqdm import tqdm
from pathlib import Path
from config import settings
from concurrent.futures import ThreadPoolExecutor
from azure.storage.blob import BlobServiceClient, ContentSettings


class AzureClient:
    def __init__(self):
        self.container_client = BlobServiceClient.from_connection_string(
            settings.ABS_CONNECTION_URL
        ).get_container_client(settings.ABS_CONTAINER_NAME)

    def download(self, blob_id: str, file_path: str):
        blob = self.container_client.get_blob_client(blob_id)
        blob_props = blob.get_blob_properties()
        total = blob_props.size

        with open(file_path, "wb") as f:
            with tqdm(
                total=total,
                unit="B",
                desc=f"Downloading {blob_id}",
                unit_scale=True,
                unit_divisor=1024,
                ncols=100,
                colour="green",
            ) as pbar:
                stream = blob.download_blob()
                for chunk in stream.chunks():
                    bytes_written = f.write(chunk)
                    pbar.update(bytes_written)

    def upload(self, blob_id: str, file_path: str):
        blob = self.container_client.get_blob_client(blob_id)

        with open(file_path, "rb") as f:
            mime_types, _ = mimetypes.guess_type(file_path)
            blob.upload_blob(
                f,
                overwrite=True,
                content_settings=ContentSettings(
                    content_type=mime_types or "application/octet-stream",
                    content_encoding="utf-8",
                ),
            )

    def upload_artifacts(self, artifact_dir: str):
        artifacts = [f for f in Path(artifact_dir).rglob("*") if f.is_file()]

        with ThreadPoolExecutor(max_workers=5) as executor:
            for artifact in artifacts:
                executor.submit(
                    self.upload,
                    os.path.join(settings.VIDEO_ID, artifact),
                    artifact.as_posix(),
                )
