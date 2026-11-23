"""Local development configuration; exported variables always take precedence."""

import os
from pathlib import Path
from dotenv import load_dotenv


def load_development_environment(path: Path) -> None:
    if (
        os.environ.get("DJANGO_SETTINGS_MODULE", "config.settings.development")
        == "config.settings.development"
    ):
        load_dotenv(path, override=False)
