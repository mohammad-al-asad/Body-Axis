from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from struct import unpack

import httpx
import certifi
from dotenv import load_dotenv
from pymongo import AsyncMongoClient


API_ROOT = Path(__file__).resolve().parents[1]


def iter_boxes(data: bytes, start: int, end: int):
    offset = start
    while offset + 8 <= end:
        size = unpack(">I", data[offset : offset + 4])[0]
        box_type = data[offset + 4 : offset + 8]
        header_size = 8

        if size == 1:
            if offset + 16 > end:
                break
            size = unpack(">Q", data[offset + 8 : offset + 16])[0]
            header_size = 16
        elif size == 0:
            size = end - offset

        if size < header_size or offset + size > end:
            break

        yield box_type, offset + header_size, offset + size
        offset += size


def read_mp4_timescale(box_payload: bytes) -> int | None:
    version = box_payload[0]
    if version == 1 and len(box_payload) >= 24:
        timescale = unpack(">I", box_payload[20:24])[0]
    elif version == 0 and len(box_payload) >= 16:
        timescale = unpack(">I", box_payload[12:16])[0]
    else:
        timescale = 0
    return timescale or None


def parse_duration_from_mp4(data: bytes) -> float | None:
    def walk(start: int, end: int) -> float | None:
        for box_type, payload_start, payload_end in iter_boxes(data, start, end):
            if box_type == b"mvhd" and payload_start + 20 <= payload_end:
                version = data[payload_start]
                if version == 1 and payload_start + 32 <= payload_end:
                    timescale = unpack(">I", data[payload_start + 20 : payload_start + 24])[0]
                    duration = unpack(">Q", data[payload_start + 24 : payload_start + 32])[0]
                elif version == 0:
                    timescale = unpack(">I", data[payload_start + 12 : payload_start + 16])[0]
                    duration = unpack(">I", data[payload_start + 16 : payload_start + 20])[0]
                else:
                    timescale = 0
                    duration = 0

                if timescale and duration:
                    return duration / timescale

            if box_type in {b"moov", b"trak", b"mdia"}:
                duration = walk(payload_start, payload_end)
                if duration:
                    return duration

        return None

    return walk(0, len(data)) or parse_fragmented_mp4_duration(data)


def parse_track_metadata(data: bytes, start: int, end: int) -> tuple[int | None, int | None]:
    track_id = None
    timescale = None

    for box_type, payload_start, payload_end in iter_boxes(data, start, end):
        if box_type == b"tkhd" and payload_end - payload_start >= 20:
            version = data[payload_start]
            if version == 1 and payload_start + 24 <= payload_end:
                track_id = unpack(">I", data[payload_start + 20 : payload_start + 24])[0]
            elif version == 0 and payload_start + 16 <= payload_end:
                track_id = unpack(">I", data[payload_start + 12 : payload_start + 16])[0]
        elif box_type == b"mdia":
            for mdia_type, mdia_start, mdia_end in iter_boxes(data, payload_start, payload_end):
                if mdia_type == b"mdhd":
                    timescale = read_mp4_timescale(data[mdia_start:mdia_end])

    return track_id, timescale


def parse_fragmented_mp4_duration(data: bytes) -> float | None:
    track_timescales: dict[int, int] = {}
    default_durations: dict[int, int] = {}
    track_durations: dict[int, int] = {}

    for box_type, payload_start, payload_end in iter_boxes(data, 0, len(data)):
        if box_type != b"moov":
            continue

        for moov_type, moov_start, moov_end in iter_boxes(data, payload_start, payload_end):
            if moov_type == b"trak":
                track_id, timescale = parse_track_metadata(data, moov_start, moov_end)
                if track_id and timescale:
                    track_timescales[track_id] = timescale
            elif moov_type == b"mvex":
                for mvex_type, mvex_start, mvex_end in iter_boxes(data, moov_start, moov_end):
                    if mvex_type == b"trex" and mvex_end - mvex_start >= 24:
                        track_id = unpack(">I", data[mvex_start + 4 : mvex_start + 8])[0]
                        default_duration = unpack(">I", data[mvex_start + 12 : mvex_start + 16])[0]
                        if track_id and default_duration:
                            default_durations[track_id] = default_duration

    for box_type, payload_start, payload_end in iter_boxes(data, 0, len(data)):
        if box_type != b"moof":
            continue

        for moof_type, moof_start, moof_end in iter_boxes(data, payload_start, payload_end):
            if moof_type != b"traf":
                continue

            track_id = None
            default_duration = None
            truns: list[tuple[int, int, int]] = []

            for traf_type, traf_start, traf_end in iter_boxes(data, moof_start, moof_end):
                if traf_type == b"tfhd" and traf_end - traf_start >= 8:
                    flags = int.from_bytes(data[traf_start + 1 : traf_start + 4], "big")
                    track_id = unpack(">I", data[traf_start + 4 : traf_start + 8])[0]
                    offset = traf_start + 8
                    if flags & 0x000001:
                        offset += 8
                    if flags & 0x000002:
                        offset += 4
                    if flags & 0x000008 and offset + 4 <= traf_end:
                        default_duration = unpack(">I", data[offset : offset + 4])[0]
                elif traf_type == b"trun" and traf_end - traf_start >= 8:
                    flags = int.from_bytes(data[traf_start + 1 : traf_start + 4], "big")
                    sample_count = unpack(">I", data[traf_start + 4 : traf_start + 8])[0]
                    truns.append((flags, sample_count, traf_start + 8))

            if not track_id:
                continue

            duration_units = 0
            for flags, sample_count, offset in truns:
                if flags & 0x000001:
                    offset += 4
                if flags & 0x000004:
                    offset += 4

                if flags & 0x000100:
                    for _ in range(sample_count):
                        if offset + 4 > len(data):
                            break
                        duration_units += unpack(">I", data[offset : offset + 4])[0]
                        offset += 4
                        if flags & 0x000200:
                            offset += 4
                        if flags & 0x000400:
                            offset += 4
                        if flags & 0x000800:
                            offset += 4
                else:
                    fallback_duration = default_duration or default_durations.get(track_id)
                    if fallback_duration:
                        duration_units += sample_count * fallback_duration

            if duration_units:
                track_durations[track_id] = track_durations.get(track_id, 0) + duration_units

    seconds = [
        duration / track_timescales[track_id]
        for track_id, duration in track_durations.items()
        if track_timescales.get(track_id)
    ]
    return max(seconds) if seconds else None


async def fetch_range(
    client: httpx.AsyncClient,
    url: str,
    start: int,
    end: int,
    max_bytes: int,
) -> bytes:
    async with client.stream("GET", url, headers={"Range": f"bytes={start}-{end}"}) as response:
        response.raise_for_status()
        chunks = []
        downloaded = 0
        async for chunk in response.aiter_bytes():
            downloaded += len(chunk)
            if downloaded > max_bytes:
                raise ValueError("range response exceeded metadata download limit")
            chunks.append(chunk)
    return b"".join(chunks)


async def fetch_mp4_metadata_bytes(
    client: httpx.AsyncClient,
    url: str,
    content_length: int,
    max_download_mb: int,
) -> bytes:
    metadata_boxes = []
    metadata_box_types = {b"ftyp", b"moov", b"moof"}
    offset = 0
    max_bytes = max_download_mb * 1024 * 1024
    downloaded = 0

    while offset + 8 <= content_length:
        header = await fetch_range(client, url, offset, min(offset + 15, content_length - 1), 1024)
        if len(header) < 8:
            break

        size = unpack(">I", header[:4])[0]
        box_type = header[4:8]
        header_size = 8

        if size == 1:
            if len(header) < 16:
                break
            size = unpack(">Q", header[8:16])[0]
            header_size = 16
        elif size == 0:
            size = content_length - offset

        if size < header_size:
            break

        if box_type in metadata_box_types:
            downloaded += size
            if downloaded > max_bytes:
                raise ValueError(f"metadata exceeds {max_download_mb} MB download limit")
            metadata_boxes.append(
                await fetch_range(
                    client,
                    url,
                    offset,
                    offset + size - 1,
                    max_bytes,
                )
            )

        offset += size

    return b"".join(metadata_boxes)


async def fetch_video_bytes(url: str, max_download_mb: int, verify_tls: bool | str) -> bytes:
    max_bytes = max_download_mb * 1024 * 1024
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=60,
        verify=verify_tls,
    ) as client:
        head = await client.head(url)
        content_length = int(head.headers.get("content-length") or 0)
        content_type = head.headers.get("content-type", "")
        if content_length and "mp4" in content_type:
            metadata = await fetch_mp4_metadata_bytes(
                client,
                url,
                content_length,
                max_download_mb,
            )
            if metadata:
                return metadata

        async with client.stream("GET", url) as response:
            response.raise_for_status()
            chunks = []
            downloaded = 0
            async for chunk in response.aiter_bytes():
                downloaded += len(chunk)
                if downloaded > max_bytes:
                    raise ValueError(f"video exceeds {max_download_mb} MB download limit")
                chunks.append(chunk)
    return b"".join(chunks)


async def resolve_duration_seconds(
    url: str,
    max_download_mb: int,
    verify_tls: bool | str,
) -> float | None:
    data = await fetch_video_bytes(url, max_download_mb, verify_tls)
    duration = parse_duration_from_mp4(data)
    return round(duration, 2) if duration and duration > 0 else None


async def main() -> None:
    parser = argparse.ArgumentParser(
        description="Backfill duration_seconds for previously uploaded MP4/MOV videos.",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Persist duration_seconds to MongoDB. Without this flag, runs as a dry run.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Maximum number of missing-duration videos to process. 0 means all.",
    )
    parser.add_argument(
        "--max-download-mb",
        type=int,
        default=50,
        help="Maximum metadata/full fallback bytes to download per video.",
    )
    parser.add_argument(
        "--max-file-size-mb",
        type=int,
        default=0,
        help="Optional total file-size cap. 0 means no total-size cap.",
    )
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Disable TLS certificate verification for downloading video URLs.",
    )
    args = parser.parse_args()
    verify_tls: bool | str = False if args.insecure else certifi.where()

    load_dotenv(API_ROOT / ".env")

    import os

    mongodb_uri = os.getenv("MONGODB_URI")
    mongodb_db = os.getenv("MONGODB_DB", "bodyaxis")
    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is not set")

    client = AsyncMongoClient(mongodb_uri)
    collection = client[mongodb_db].videos
    missing_duration_filter = {
        "$or": [
            {"duration_seconds": {"$exists": False}},
            {"duration_seconds": None},
            {"duration_seconds": {"$lte": 0}},
        ],
    }
    query_filters = [missing_duration_filter]
    if args.max_file_size_mb:
        max_file_size_bytes = args.max_file_size_mb * 1024 * 1024
        query_filters.append(
            {
                "$or": [
                    {"video_file_size": {"$exists": False}},
                    {"video_file_size": None},
                    {"video_file_size": {"$lte": max_file_size_bytes}},
                ]
            }
        )
    query = {"$and": query_filters}

    cursor = collection.find(query).sort("created_at", 1)
    if args.limit:
        cursor = cursor.limit(args.limit)

    processed = 0
    updated = 0
    skipped = 0
    failed = 0

    async for video in cursor:
        processed += 1
        video_id = str(video["_id"])
        label = f"{video.get('exercise_id', 'unknown')} - {video.get('video_name', video_id)}"
        url = video.get("video_url")
        if not url:
            skipped += 1
            print(f"SKIP {label}: missing video_url")
            continue

        file_size = video.get("video_file_size")
        if (
            file_size
            and args.max_file_size_mb
            and file_size > args.max_file_size_mb * 1024 * 1024
        ):
            skipped += 1
            size_mb = file_size / 1024 / 1024
            print(
                f"SKIP {label}: {size_mb:.1f} MB exceeds "
                f"{args.max_file_size_mb} MB file-size limit"
            )
            continue

        try:
            duration_seconds = await resolve_duration_seconds(
                url,
                args.max_download_mb,
                verify_tls,
            )
        except Exception as exc:
            failed += 1
            print(f"FAIL {label}: {exc}")
            continue

        if not duration_seconds:
            skipped += 1
            print(f"SKIP {label}: duration not found")
            continue

        if args.write:
            await collection.update_one(
                {"_id": video["_id"]},
                {
                    "$set": {
                        "duration_seconds": duration_seconds,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )
            updated += 1
            print(f"UPDATED {label}: {duration_seconds}s")
        else:
            updated += 1
            print(f"DRY RUN {label}: {duration_seconds}s")

    print(
        f"Done. processed={processed}, "
        f"{'updated' if args.write else 'would_update'}={updated}, "
        f"skipped={skipped}, failed={failed}"
    )
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
