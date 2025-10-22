import os
import mimetypes
from tqdm import tqdm
from pathlib import Path
from config import settings
from concurrent.futures import ThreadPoolExecutor
from azure.storage.blob import BlobServiceClient, ContentSettings

service_client = BlobServiceClient.from_connection_string(settings.ABS_CONNECTION_URL)

container_client = service_client.get_container_client(settings.ABS_CONTAINER_NAME)


def download(blob_id: str, file_path: str):
    blob = container_client.get_blob_client(blob_id)
    blob_props = blob.get_blob_properties()
    total = blob_props.size

    with open(file_path, "wb") as f:
        with tqdm(
            total=total,
            desc=f"Downloading {blob_id}",
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
            colour="green",
            ncols=100,
        ) as pbar:
            stream = blob.download_blob()
            for chunk in stream.chunks():
                bytes_written = f.write(chunk)
                pbar.update(bytes_written)


def upload(blob_id: str, file_path: str):
    blob = container_client.get_blob_client(blob_id)
    mime_type, _ = mimetypes.guess_type(file_path)
    f = open(file_path, "rb")
    blob.upload_blob(
        f,
        overwrite=True,
        content_settings=ContentSettings(
            content_type=mime_type or "application/octet-stream",
            content_encoding="utf-8",
        ),
    )
    f.close()


def upload_artifacts(artifact_dir: str):

    artifacts = [f for f in Path(artifact_dir).rglob("*") if f.is_file()]

    with ThreadPoolExecutor(max_workers=5) as executor:
        for artifact in artifacts:
            executor.submit(
                upload, os.path.join(settings.VIDEO_ID, artifact), artifact.as_posix()
            )
