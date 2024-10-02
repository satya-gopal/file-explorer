from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import shutil
app = Flask(__name__)
CORS(app)




def get_files_in_directory(path):
    items = []
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        items.append({
            'name': item,
            'isDirectory': os.path.isdir(item_path),
            'path': item_path,
            'size': os.path.getsize(item_path) if os.path.isfile(item_path) else None,
        })
    
    # Sort items: folders first, then files, both in alphabetical order
    items.sort(key=lambda x: (not x['isDirectory'], x['name']))
    return items

@app.route('/files', methods=['GET'])
def get_files():
    directory = request.args.get('path', '/')
    if not os.path.exists(directory):
        return jsonify({'error': 'Directory not found'}), 404
    files = get_files_in_directory(directory)
    return jsonify(files)

@app.route('/delete', methods=['POST'])
def delete_item():
    item_path = request.json.get('path')
    if os.path.exists(item_path):
        try:
            if os.path.isdir(item_path):
                # Remove the directory even if it's not empty
                shutil.rmtree(item_path)
            else:
                os.remove(item_path)
            return jsonify({'message': 'Item deleted'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return jsonify({'error': 'Item not found'}), 404

@app.route('/delete_all', methods=['POST'])
def delete_all_items():
    item_paths = request.json.get('paths', [])
    errors = []
    
    for item_path in item_paths:
        if os.path.exists(item_path):
            try:
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
            except Exception as e:
                errors.append({'path': item_path, 'error': str(e)})
    
    if errors:
        return jsonify({'message': 'Some items could not be deleted', 'errors': errors}), 500
    
    return jsonify({'message': 'All items deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
