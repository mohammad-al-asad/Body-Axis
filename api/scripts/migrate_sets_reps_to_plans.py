from __future__ import annotations

import argparse
import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import certifi
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

# Ensure api directory is on sys.path
API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

load_dotenv(API_ROOT / ".env")


async def run_migration(
    apply_changes: bool = False,
    default_sets: int = 3,
    default_reps: str = "10 reps",
    mongo_uri: str | None = None,
    db_name: str | None = None,
) -> None:
    mongodb_uri = mongo_uri or os.getenv("MONGODB_URI")
    database_name = db_name or os.getenv("MONGODB_DB", "bodyaxis")

    if not mongodb_uri:
        print("\n" + "=" * 60)
        print("ERROR: MONGODB_URI not provided.")
        print("=" * 60)
        print("Please provide the MongoDB connection URI via one of the following:")
        print("  1. Command line argument:")
        print("     python3 api/scripts/migrate_sets_reps_to_plans.py --mongo-uri '<your_uri>'")
        print("  2. In api/.env file:")
        print("     MONGODB_URI=<your_uri>")
        print("  3. Environment variable:")
        print("     export MONGODB_URI='<your_uri>'")
        print("=" * 60 + "\n")
        sys.exit(1)

    client = AsyncMongoClient(mongodb_uri, tlsCAFile=certifi.where())
    db = client[database_name]

    print("=" * 60)
    print("BodyAxis: Migrate Sets & Reps from Exercises to Plans")
    print(f"Mode: {'APPLY (Live DB writes enabled)' if apply_changes else 'DRY RUN (No changes will be saved)'}")
    print(f"Database: {database_name}")
    print(f"Default fallback: {default_sets} sets, {default_reps}")
    print("=" * 60)

    # 1. Gather all exercises and their sets/reps
    exercises_cursor = db.exercises.find({})
    exercise_lookup: dict[str, dict[str, Any]] = {}
    exercise_count = 0
    exercises_with_sets_reps = 0

    async for ex in exercises_cursor:
        exercise_count += 1
        ex_id = ex.get("exercise_id")
        if not ex_id:
            continue
        sets_val = ex.get("sets")
        reps_val = ex.get("reps")
        if sets_val is not None or reps_val is not None:
            exercises_with_sets_reps += 1

        exercise_lookup[ex_id] = {
            "sets": sets_val if sets_val is not None else default_sets,
            "reps": reps_val if reps_val is not None else default_reps,
            "exercise_name": ex.get("exercise_name", ex_id),
        }

    print(f"\n[1] Exercises scanned: {exercise_count} total, {exercises_with_sets_reps} had sets/reps.")

    # 2. Iterate plans and populate sets/reps on each phase exercise item
    plans_cursor = db.plans.find({})
    plans_scanned = 0
    plans_modified = 0
    total_phase_items_updated = 0

    async for plan in plans_cursor:
        plans_scanned += 1
        plan_id = plan.get("plan_id", str(plan.get("_id")))
        plan_name = plan.get("plan_name", "Unnamed Plan")
        phases = plan.get("phases", {})
        plan_needs_update = False
        updated_phases: dict[str, list[dict[str, Any]]] = {}

        print(f"\nPlan [{plan_id}] '{plan_name}':")

        for phase_name in ("reset", "control", "integrate"):
            phase_items = phases.get(phase_name, [])
            new_items = []
            for item in phase_items:
                ex_id = item.get("exercise_id")
                current_sets = item.get("sets")
                current_reps = item.get("reps")

                # Check if sets or reps need to be populated
                ex_info = exercise_lookup.get(ex_id, {})
                target_sets = current_sets if current_sets is not None else ex_info.get("sets", default_sets)
                target_reps = current_reps if current_reps is not None else ex_info.get("reps", default_reps)

                if current_sets != target_sets or current_reps != target_reps:
                    plan_needs_update = True
                    total_phase_items_updated += 1
                    print(
                        f"  -> {phase_name.upper()} | {ex_id}: sets={target_sets} (was {current_sets}), reps='{target_reps}' (was '{current_reps}')"
                    )

                new_item = dict(item)
                new_item["sets"] = target_sets
                new_item["reps"] = target_reps
                new_items.append(new_item)

            updated_phases[phase_name] = new_items

        if plan_needs_update:
            plans_modified += 1
            if apply_changes:
                await db.plans.update_one(
                    {"_id": plan["_id"]},
                    {
                        "$set": {
                            "phases": updated_phases,
                            "updated_at": datetime.now(timezone.utc),
                        }
                    },
                )
                print(f"  [SAVED] Plan {plan_id} phases updated.")
            else:
                print(f"  [DRY RUN] Plan {plan_id} would be updated.")
        else:
            print("  No changes needed.")

    # 3. Clean up exercises collection (unset sets and reps)
    if exercises_with_sets_reps > 0:
        print(f"\n[3] Exercise Cleanup:")
        if apply_changes:
            result = await db.exercises.update_many(
                {},
                {"$unset": {"sets": "", "reps": ""}},
            )
            print(f"  [APPLIED] Unset sets and reps from {result.modified_count} exercise documents.")
        else:
            print(f"  [DRY RUN] Would unset sets and reps from {exercises_with_sets_reps} exercise documents.")

    print("\n" + "=" * 60)
    print("Migration Summary:")
    print(f"  Plans scanned: {plans_scanned}")
    print(f"  Plans modified: {plans_modified}")
    print(f"  Exercise items updated in plans: {total_phase_items_updated}")
    print(f"  Exercises with sets/reps cleaned: {exercises_with_sets_reps}")
    print(f"  Action taken: {'Changes committed to database' if apply_changes else 'Dry run only (no changes made)'}")
    print("=" * 60)

    if not apply_changes:
        print("\nTo apply these changes to the live database, run:")
        print("  python3 api/scripts/migrate_sets_reps_to_plans.py --apply\n")

    await client.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Migrate sets and reps from exercises collection to plans collection."
    )
    parser.add_argument(
        "--apply",
        "--write",
        dest="apply_changes",
        action="store_true",
        help="Apply changes to the database (default is dry-run mode).",
    )
    parser.add_argument(
        "--dry-run",
        dest="dry_run",
        action="store_true",
        help="Run without modifying the database (default behavior).",
    )
    parser.add_argument(
        "--default-sets",
        type=int,
        default=3,
        help="Default sets if not defined on exercise (default: 3).",
    )
    parser.add_argument(
        "--default-reps",
        type=str,
        default="10 reps",
        help="Default reps if not defined on exercise (default: '10 reps').",
    )

    parser.add_argument(
        "--mongo-uri",
        type=str,
        default=None,
        help="MongoDB connection URI (overrides MONGODB_URI environment variable).",
    )
    parser.add_argument(
        "--db-name",
        type=str,
        default=None,
        help="MongoDB database name (default: bodyaxis or from MONGODB_DB).",
    )

    args = parser.parse_args()
    apply_mode = args.apply_changes and not args.dry_run

    asyncio.run(
        run_migration(
            apply_changes=apply_mode,
            default_sets=args.default_sets,
            default_reps=args.default_reps,
            mongo_uri=args.mongo_uri,
            db_name=args.db_name,
        )
    )


if __name__ == "__main__":
    main()
