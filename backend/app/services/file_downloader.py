import requests

from pathlib import Path

TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)


def download_file(url: str):

    print("URL:", url)

    filename = url.split("/")[-1]

    local_path = TEMP_DIR / filename

    response = requests.get(url)

    print("STATUS:", response.status_code)

    response.raise_for_status()

    with open(local_path, "wb") as f:
        f.write(response.content)

    print("SAVED:", local_path)

    return str(local_path)