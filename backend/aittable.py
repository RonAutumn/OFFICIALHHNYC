import json
from pyairtable import Api
import os
from datetime import datetime
import logging
from time import sleep
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('airtable_sync.log'),
        logging.StreamHandler()
    ]
)

# Load environment variables
load_dotenv()

# Airtable credentials
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID', 'applgr65s82aAWI6t')

if not AIRTABLE_API_KEY:
    raise ValueError("AIRTABLE_API_KEY not found in environment variables")

def get_all_tables():
    """
    Get a list of all tables in the base
    """
    try:
        api = Api(AIRTABLE_API_KEY)
        base_url = f"https://api.airtable.com/v0/meta/bases/{BASE_ID}/tables"
        response = api._request("get", base_url)
        tables = response.json().get('tables', [])
        return [table['name'] for table in tables]
    except Exception as e:
        logging.error(f"Error fetching tables: {e}")
        return []

def fetch_data_from_table(table_name, max_retries=3):
    """
    Fetch ALL data and fields from a specific Airtable table with special handling for Products and Orders
    """
    api = Api(AIRTABLE_API_KEY)
    table = api.table(BASE_ID, table_name)
    
    for attempt in range(max_retries):
        try:
            records = table.all()

            if not records:
                logging.warning(f"No records found in table '{table_name}'")
                return []
                
            logging.info(f"Successfully fetched {len(records)} records from {table_name}")
            
            processed_records = []
            for record in records:
                if table_name == "Products":
                    fields = record.get('fields', {})
                    processed_record = {
                        'Record ID': record['id'],
                        **fields,  
                        'Name': fields.get('Name', ''),
                        'Description': fields.get('Description', ''),
                        'Price': fields.get('Price', 0),
                        'Strain Type': fields.get('Strain Type', ''),
                        'Effects': fields.get('Effects', []),
                        'Flavors': fields.get('Flavors', []),
                        'Is Special Deal': fields.get('Is Special Deal', False),
                        'Original Product ID': fields.get('Original Product ID', ''),
                        'Special Price': fields.get('Special Price', None),
                        'Special Start Date': fields.get('Special Start Date', None),
                        'Special End Date': fields.get('Special End Date', None),
                        'Is Bundle Deal': fields.get('Is Bundle Deal', False),
                        'Bundle Products': fields.get('Bundle Products', []),
                        'Bundle Savings': fields.get('Bundle Savings', 0),
                        'Category': fields.get('Category', []),
                        'Image': fields.get('Image', []),
                        'Stock': fields.get('Stock', 0),
                        'Status': fields.get('Status', 'Draft')
                    }
                elif table_name == "Orders":
                    fields = record.get('fields', {})
                    processed_record = {
                        'Record ID': record['id'],
                        **fields,  
                        'Status': fields.get('Status', ''),
                        'Borough': fields.get('Borough', ''),
                        'Shipping Fee': fields.get('Shipping Fee', 0),
                        'Delivery Date': fields.get('Delivery Date', ''),
                        'Delivery Fee': fields.get('Delivery Fee', 0),
                        'Tracking Number': fields.get('Tracking Number', ''),
                        'Shipping Method': fields.get('Shipping Method', '')
                    }
                else:
                    processed_record = {
                        'Record ID': record['id'],
                        **record['fields']
                    }
                processed_records.append(processed_record)
            
            if table_name == "Orders":
                for timestamp_field in ['Created', 'Created Time', 'createdTime', 'Modified', 'Last Modified']:
                    if any(timestamp_field in record for record in processed_records):
                        processed_records.sort(key=lambda x: x.get(timestamp_field, ''), reverse=True)
                        break
            
            return processed_records
                
        except Exception as e:
            if 'NOT_FOUND' in str(e):
                logging.error(f"Table '{table_name}' not found in the Airtable base")
                return []
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2  
                logging.warning(f"Attempt {attempt + 1} failed for table '{table_name}': {e}. Retrying in {wait_time} seconds...")
                sleep(wait_time)
            else:
                logging.error(f"Failed to fetch data from table '{table_name}' after {max_retries} attempts: {e}")
                return []

def save_data_to_markdown(table_name, data):
    """
    Save ALL fetched data to a markdown file with table format
    """
    try:
        if not os.path.exists('airtable_data'):
            os.makedirs('airtable_data')
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        filename = f"airtable_data/{table_name.lower()}.md"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"# {table_name}\n\n")
            f.write(f"Generated on: {timestamp}\n")
            f.write(f"Total Records: {len(data)}\n\n")
            
            if not data:
                f.write("No data available for this table.\n")
                return data
            
            if table_name == "Products":
                ordered_fields = [
                    'Record ID', 'Name', 'Description', 'Price',
                    'Strain Type', 'Effects', 'Flavors',
                    'Is Special Deal', 'Original Product ID', 'Special Price',
                    'Special Start Date', 'Special End Date',
                    'Is Bundle Deal', 'Bundle Products', 'Bundle Savings',
                    'Category', 'Image', 'Stock', 'Status'
                ]
                remaining_fields = sorted(list(set(field for record in data for field in record.keys()) - set(ordered_fields)))
                fields = ordered_fields + remaining_fields
            elif table_name == "Orders":
                ordered_fields = [
                    'Record ID', 'Status', 'Borough', 'Shipping Fee',
                    'Delivery Date', 'Delivery Fee', 'Tracking Number',
                    'Shipping Method'
                ]
                remaining_fields = sorted(list(set(field for record in data for field in record.keys()) - set(ordered_fields)))
                fields = ordered_fields + remaining_fields
            else:
                fields = sorted(list(set(field for record in data for field in record.keys())))
            
            f.write("| " + " | ".join(fields) + " |\n")
            f.write("| " + " | ".join(["---" for _ in fields]) + " |\n")
            
            for record in data:
                row = []
                for field in fields:
                    value = record.get(field, '')
                    if isinstance(value, (list, dict)):
                        value = json.dumps(value)
                    elif value is None:
                        value = ''
                    elif isinstance(value, bool):
                        value = str(value)
                    elif isinstance(value, (int, float)):
                        value = str(value)
                    
                    value = str(value).replace('|', '\\|').replace('\n', '<br>')
                    if len(str(value)) > 100:
                        value = str(value)[:97] + "..."
                    row.append(value)
                f.write("| " + " | ".join(row) + " |\n")
            
            logging.info(f"Data saved to {filename}")
        return data
    except Exception as e:
        logging.error(f"Error saving markdown for table '{table_name}': {e}")
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
            
        fields = set()
        for record in data:
            fields.update(record.keys())
        fields = sorted(list(fields))
        
        markdown_content += "### Fields\n"
        markdown_content += "| Field Name | Type | Example Value |\n"
        markdown_content += "|------------|------|---------------|\n"
        
        for field in fields:
            example = next((record.get(field) for record in data if field in record and record[field]), 'N/A')
            field_type = type(example).__name__ if example != 'N/A' else 'N/A'
            
            if isinstance(example, (list, dict)):
                example = json.dumps(example)
            if len(str(example)) > 50:
                example = str(example)[:47] + "..."
            example = str(example).replace("|", "\\|").replace("\n", "<br>")
            
            markdown_content += f"| {field} | {field_type} | {example} |\n"
        
        markdown_content += f"\nTotal Records: {len(data)}\n\n"
        markdown_content += "---\n\n"
    
    with open('airtable_database.md', 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    logging.info("Documentation saved to airtable_database.md")

if __name__ == "__main__":
    tables = get_all_tables()
    if not tables:
        tables = ["Orders", "Settings", "Products", "Category", "Shipping", "Order Details", "Updates"]
    
    all_table_data = {}
    
    for table in tables:
        print(f"Fetching data from table: {table}")
        data = fetch_data_from_table(table)
        if data:
            print(f"Found {len(data)} records in '{table}'")
            saved_data = save_data_to_markdown(table, data)
            all_table_data[table] = saved_data
        else:
            print(f"No data or table '{table}' not found.")
            all_table_data[table] = []
        print("-" * 40)
    
    create_markdown_documentation(all_table_data)
