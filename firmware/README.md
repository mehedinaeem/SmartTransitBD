# Firmware boundary

The real GPS/GNSS prototype works. ESP32/A7670E transmits location via cellular connectivity. Existing hardware firmware has not been imported into this repository and is not modified by this foundation.

Future work: document device identity, coordinate conventions, timestamps, retry/backoff, offline buffering, and an authenticated ingestion contract. Do not embed cellular credentials or device keys in source control. This directory contains no simulated firmware presented as a working integration.
