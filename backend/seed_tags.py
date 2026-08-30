from database import SessionLocal
from models import BaseTags

preset_tags = [
    'casual', 'formal', 'elegant', 'cute', 
    'edgy', 'gothic', 'steampunk', 'techwear', 
    'streetwear', 'traditional', 'modern', 'fantasy', 
    'cosplay', 'heavy armor', 'light armor', 'robe', 
    'melee', 'archery', 'alchemy', 'martial arts', 
    'gunslinger', 'wings', 'animal', 'monochrome',
    'pastel', 'neon', 'wedding', 'swimwear',
    'winter', 'mage', 'school', 'celestial',
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(BaseTags).count()
        if existing == 0:
            objects = [BaseTags(name = tag) for tag in preset_tags]
            db.add_all(objects)
            db.commit()
            print('Successfully seeded base_tags.')
        else:
            print('Tags already exist. Skipping seeding.')
    except Exception as e:
        db.rollback()
        print(f'Error seeding database: {e}')
    finally:
        db.close()

if __name__ == '__main__':
    seed()