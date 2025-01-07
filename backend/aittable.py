import json
from pyairtable import Api
import os
from datetime import datetime

# Airtable credentials
AIRTABLE_API_KEY = "patLWuH2PUXiMYZRm.ea911a03ba2c0d3705569d3f68379e470bca21529e5ad30865399750e7baba60"
BASE_ID = "applgr65s82aAWI6t"

# List of tables in HHNYC base
TABLES = ["Orders", "Settings", "Products", "Category", "Shipping", "Order Details", "Delivery Dates"]

def fetch_data_from_table(table_name):
    """
    Fetch data from a specific Airtable table.
    """
    api = Api(AIRTABLE_API_KEY)
    table = api.table(BASE_ID, table_name)
    
    try:
        records = table.all()  # Fetch all records from the table
        return [
            {field: value for field, value in record['fields'].items()}
            for record in records
        ]
    except Exception as e:
        print(f"Error fetching data from table '{table_name}': {e}")
        return []

def save_data_to_file(table_name, data):
    """
    Save fetched data to a JSON file
    """
    if not os.path.exists('airtable_data'):
        os.makedirs('airtable_data')
    
    filename = f"airtable_data/{table_name.replace(' ', '_').lower()}.json"
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Data saved to {filename}")
    return data

def create_markdown_documentation(all_data):
    """
    Create a markdown file documenting all table data
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    markdown_content = f"# HHNYC Airtable Database Documentation\n\n"
    markdown_content += f"Generated on: {timestamp}\n\n"

    for table_name, data in all_data.items():
        markdown_content += f"## {table_name}\n\n"
        
        if not data:
            markdown_content += "No data available for this table.\n\n"
            continue
            
        # Get all unique fields from the data
        all_fields = set()
        for record in data:
            all_fields.update(record.keys())
        
        # Create table header
        markdown_content += "### Fields\n"
        markdown_content += "| Field Name | Example Value |\n"
        markdown_content += "|------------|---------------|\n"
        
        # Add field examples
        for field in sorted(all_fields):
            example = next((str(record.get(field, '')) for record in data if field in record), 'N/A')
            # Truncate long examples
            if len(example) > 50:
                example = example[:47] + "..."
            # Escape pipe characters in markdown table
            example = example.replace("|", "\\|")
            markdown_content += f"| {field} | {example} |\n"
        
        markdown_content += f"\nTotal Records: {len(data)}\n\n"
        markdown_content += "---\n\n"
    
    with open('airtabledatabase.md', 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print("Documentation saved to airtabledatabase.md")

if __name__ == "__main__":
    all_table_data = {}
    
    for table in TABLES:
        print(f"Fetching data from table: {table}")
        data = fetch_data_from_table(table)
        if data:
            print(f"Data from '{table}':")
            saved_data = save_data_to_file(table, data)
            all_table_data[table] = saved_data
        else:
            print(f"No data or table '{table}' not found.")
            all_table_data[table] = []
        print("-" * 40)
    
    # Create markdown documentation
    create_markdown_documentation(all_table_data)
