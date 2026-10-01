import json
from database import SessionLocal
from models import BaseEquipment  # Adjust if your model class name is different

JSON_FILE_PATH = "equipment_seed.json"  # Update with the path to your JSON file
BATCH_SIZE = 1000

def seed():
    db = SessionLocal()
    try:
        existing = db.query(BaseEquipment).count()
        if existing > 0:
            print("Equipment already exists. Skipping seeding.")
            return

        # Load and parse JSON
        with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
            items = json.load(f)

        total_items = len(items)
        print(f"Loaded {total_items} items from JSON. Inserting in batches...")

        # Process in batches to keep latency and memory usage low over WAN
        for i in range(0, total_items, BATCH_SIZE):
            batch = items[i:i + BATCH_SIZE]
            objects = [
                BaseEquipment(name=item["name"], slot=item["slot"])
                for item in batch
            ]
            db.add_all(objects)
            db.commit()
            print(f"Inserted {min(i + BATCH_SIZE, total_items)} / {total_items} items...")

        print("Successfully seeded base_equipment.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()