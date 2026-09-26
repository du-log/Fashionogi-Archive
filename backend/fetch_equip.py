import requests
import json
import time

# The base URL for the Mabinogi World MediaWiki API
API_URL = "https://wiki.mabinogiworld.com/api.php"

# Map Wiki Categories to your database's slot/equipment types
CATEGORY_MAP = {
    "Category:Headgear": "headgear",
    "Category:Facewear": "face",
    "Category:Clothes": "body",
    "Category:Light_Armor": "body",
    "Category:Heavy_Armor": "body",
    "Category:Gloves": "gloves",
    "Category:Shoes": "shoes",
    "Category:Robes": "back",
    "Category:Wings": "back",
    "Category:Tails": "tail",
    "Category:Accessories": "accessory",
    "Category:Halos": "accessory"
}

def fetch_category_members(category_name, slot_type):
    print(f"Fetching {category_name}...")
    items = []
    
    # MediaWiki API parameters
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": category_name,
        "cmlimit": 500,  # Max items per request
        "cmnamespace": 0 # Only pull actual pages (ignores Talk pages, sub-categories, etc.)
    }

    while True:
        try:
            response = requests.get(API_URL, params=params, headers={"User-Agent": "MabiLookbook-Seed-Bot/1.1"})
            data = response.json()
            
            # Extract the page titles (the item names)
            if "query" in data and "categorymembers" in data["query"]:
                for member in data["query"]["categorymembers"]:
                    items.append({
                        "name": member["title"],
                        "slot": slot_type
                    })
            
            # Check for pagination (if the category has more than 500 items)
            if "continue" in data:
                params["cmcontinue"] = data["continue"]["cmcontinue"]
                time.sleep(2) # Be polite to the wiki servers
            else:
                break
                
        except Exception as e:
            print(f"Error fetching {category_name}: {e}")
            break
            
    print(f"-> Found {len(items)} items in {slot_type}.")
    return items

def fetch():
    all_equipment = {}
    
    for wiki_category, slot_type in CATEGORY_MAP.items():
        items = fetch_category_members(wiki_category, slot_type)
        for item in items:
            all_equipment[item["name"]] = item
        time.sleep(2) # Pause between categories
        
    excluded_substrings = [
        " List", 
        "Upgrades/", 
        "Set", 
        "User:", 
        "Template:",
        "Category:",
        "Enchants",
        "Gallery",
        "Design Contest",
        "Gachapon" # Often catches lists of gachapon items rather than the items themselves
    ]

    # Optional: Filter out known junk pages that slip into wiki categories
    clean_equipment = []
    for item in all_equipment.values():
        name = item["name"]
        
        # Skip if it contains any wiki-meta substrings
        if any(bad_string in name for bad_string in excluded_substrings):
            continue
            
        # Hardcode filter: If it literally has "Wings" in the name but isn't slotted as Wings, 
        # force it or skip it. (This fixes wings that were ONLY categorized as clothing).
        if " Wings" in name and not "Pegasus' Wings" in name and not " Wings Headband" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Cape" in name or " Coffin" in name or " Ocean Coat" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Pack" in name or " Knapsack" in name or " Rucksack" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Backpack" in name or " Dreamweaver" in name or " Yantra" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Planisphere" in name or " Doily" in name or " Runic Circle" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Circle of Tranquility" in name or " Floating Silk" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Aerialist's Hoop" in name or " Watch Frame" in name or " Leaf Muffler" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Overcoat" in name or " Topcoat" in name or " Forest Muffler" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Bleugenne Fur" in name or " Long Faux Fur" in name or " Short Faux Fur" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Mafia Coat" in name or " Mafia Costume Coat" in name or " Mafia Jacket" in name or " Mafia Costume Jacket" in name and item["slot"] != "back":
            item["slot"] = "back"
        if " Shoes" in name or " Boots" in name or " Slippers" in name or " Heels" in name or " Sandals" in name or " Slip-ons" in name or " Loafers" in name and item["slot"] != "shoes":
            item ["slot"] = "shoes"
        if " Gloves" in name and item["slot"] != "gloves":
            item ["slot"] = "gloves"
        clean_equipment.append(item)
    
    # Save to a JSON file
    with open("equipment_seed.json", "w", encoding="utf-8") as f:
        json.dump(clean_equipment, f, indent=4, ensure_ascii=False)
        
    print(f"\nSuccess! Saved {len(clean_equipment)} total items to equipment_seed.json")

if __name__ == "__main__":
    fetch()