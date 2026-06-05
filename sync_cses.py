#!/usr/bin/env python3
import os
import sys
import re
import requests
import subprocess
from bs4 import BeautifulSoup as bs
from urllib.parse import urljoin

# Base URL
BASE_URL = 'https://cses.fi/problemset/'
LOGIN_URL = 'https://cses.fi/login'

def parse_metadata_map(ts_file_path):
    """Parses CSES_METADATA_MAP from cppFiles.ts to map CSES task IDs to filenames."""
    id_to_filename = {}
    filename_to_title = {}
    
    if not os.path.exists(ts_file_path):
        print(f"Warning: Metadata file {ts_file_path} not found.")
        return id_to_filename, filename_to_title

    try:
        with open(ts_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the CSES_METADATA_MAP block
        map_match = re.search(r'const CSES_METADATA_MAP.*?\n\};', content, re.DOTALL)
        if map_match:
            map_block = map_match.group(0)
            # Find each entry: 'Filename.cpp': { ... url: '.../task/ID' }
            entries = re.findall(r"'([^']+)':\s*\{\s*displayName:\s*'([^']+)',\s*category:\s*'[^']+',\s*(?:url:\s*'https://cses\.fi/problemset/task/(\d+)')?", map_block)
            for filename, display_name, task_id in entries:
                filename_to_title[filename] = display_name
                if task_id:
                    id_to_filename[task_id] = filename
    except Exception as e:
        print(f"Error parsing metadata map: {e}")

    return id_to_filename, filename_to_title

def clean_filename(title):
    """Generates a clean PascalCase filename from a task title."""
    # Remove special characters and keep alphanumeric/spaces
    cleaned = re.sub(r'[^\w\s-]', '', title)
    # Convert to PascalCase
    words = cleaned.split()
    filename = "".join(word.capitalize() for word in words)
    return f"{filename}.cpp"

def login_with_credentials(session, username, password):
    """Logs in using username and password, returning the session."""
    try:
        p = session.get(LOGIN_URL)
        soup = bs(p.text, 'html.parser')
        csrf_token_tag = soup.find('input', {'name': 'csrf_token'})
        if not csrf_token_tag:
            print("Failed to find CSRF token on login page.")
            return False

        csrf_token = csrf_token_tag['value']
        payload = {
            'nick': username,
            'pass': password,
            'csrf_token': csrf_token
        }
        
        response = session.post(LOGIN_URL, data=payload)
        soup_after = bs(response.text, 'html.parser')
        
        # Check if login succeeded
        account_link = soup_after.find('a', {'class': 'account'})
        if account_link and account_link.get('href') != '/login':
            print("Logged in successfully using credentials!")
            return True
        else:
            print("Login failed! Please check your username and password.")
            return False
    except Exception as e:
        print(f"Error during login: {e}")
        return False

def check_session(session):
    """Verifies if the session is logged in by checking the problemset page."""
    try:
        response = session.get(BASE_URL)
        soup = bs(response.text, 'html.parser')
        account_link = soup.find('a', {'class': 'account'})
        if account_link and account_link.get('href') != '/login':
            print(f"Verified login session as user: {account_link.text}")
            return True
        return False
    except Exception as e:
        print(f"Error checking session: {e}")
        return False

def get_solved_tasks(session):
    """Parses the problemset page to find all solved tasks (marked with 'full' class)."""
    solved_tasks = []
    
    try:
        response = session.get(BASE_URL)
        soup = bs(response.text, 'html.parser')
        
        # Only parse inside the main content area to avoid sidebar pollution
        content_div = soup.find(class_='content')
        if not content_div:
            content_div = soup
            
        # Tasks are normally under <a> with href like "/problemset/task/XXXX"
        links = content_div.find_all('a', href=re.compile(r'^/problemset/task/\d+'))
        
        for link in links:
            href = link.get('href')
            task_id = re.search(r'/task/(\d+)', href).group(1)
            title = link.text.strip()
            
            is_solved = False
            status_element = link.find_next_sibling(class_='task-score')
            if status_element:
                classes = status_element.get('class', [])
                if 'full' in classes:
                    is_solved = True

            
            if is_solved:
                solved_tasks.append({
                    'id': task_id,
                    'title': title,
                    'url': urljoin(BASE_URL, href)
                })
                
    except Exception as e:
        print(f"Error retrieving problem set: {e}")
        
    return solved_tasks


def download_code(session, task_url):
    """Crawls the task page, finds the accepted submission link, and downloads the source code."""
    try:
        response = session.get(task_url)
        soup = bs(response.text, 'html.parser')
        
        result_link = None
        for a_tag in soup.find_all('a', href=re.compile(r'^/problemset/result/\d+')):
            span = a_tag.find('span')
            if span and 'full' in span.get('class', []):
                result_link = urljoin(BASE_URL, a_tag.get('href'))
                break
        
        if not result_link:
            return None
            
        response = session.get(result_link)
        soup_ac = bs(response.text, 'html.parser')
        
        code_tag = soup_ac.find('pre', {'class': 'linenums'})
        if not code_tag:
            code_tag = soup_ac.find('pre')
            
        if code_tag:
            return code_tag.get_text()
            
    except Exception as e:
        print(f"Error downloading code: {e}")
        
    return None

def git_push_solution(project_root, filename, code):
    """Performs the exact git sparse-checkout, commit, pull-rebase, and push sequence."""
    task_name = filename.replace('.cpp', '')
    file_path = os.path.join(project_root, filename)
    
    try:
        # Create an empty Untitled-3.cpp if it doesn't exist, to support sparse rules
        untitled_path = os.path.join(project_root, 'Untitled-3.cpp')
        if not os.path.exists(untitled_path):
            with open(untitled_path, 'w') as f:
                f.write('// CSES Workspace')

        # 1. Write the downloaded solution code locally
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
            
        # 2. Get current branch
        branch_res = subprocess.run(['git', 'branch', '--show-current'], cwd=project_root, capture_output=True, text=True)
        current_branch = branch_res.stdout.strip() or 'cses-solutions'

        # 3. Abort any locks
        subprocess.run(['git', 'merge', '--abort'], cwd=project_root, capture_output=True)
        subprocess.run(['git', 'rebase', '--abort'], cwd=project_root, capture_output=True)

        # 4. Configure sparse checkout
        subprocess.run(['git', 'sparse-checkout', 'init', '--cone'], cwd=project_root, capture_output=True)
        subprocess.run(['git', 'sparse-checkout', 'set', '/*', '!/*.cpp', 'Untitled-3.cpp'], cwd=project_root, capture_output=True)
        subprocess.run(['git', 'sparse-checkout', 'add', filename], cwd=project_root, capture_output=True)

        # 5. Git add & commit
        subprocess.run(['git', 'add', filename], cwd=project_root, capture_output=True)
        subprocess.run(['git', 'commit', '-m', f"AC: {task_name}"], cwd=project_root, capture_output=True)

        # 6. Push to GitHub (pull with rebase & autostash first)
        print("🔄 正在與 GitHub 同步並推送...")
        pull_cmd = ['git', 'pull', 'origin', current_branch, '--rebase', '-X', 'ours', '--autostash']
        subprocess.run(pull_cmd, cwd=project_root, capture_output=True)
        
        push_cmd = ['git', 'push', 'origin', current_branch]
        push_res = subprocess.run(push_cmd, cwd=project_root, capture_output=True, text=True)

        if push_res.returncode == 0:
            print(f"🎉 成功！GitHub 已新增 {filename}")
            
            # Clean up local file and re-apply filters
            subprocess.run(['git', 'sparse-checkout', 'set', '/*', '!/*.cpp', 'Untitled-3.cpp'], cwd=project_root, capture_output=True)
            if os.path.exists(file_path):
                os.remove(file_path)
            print("🧹 本地端已自動隱藏並清除所有歷史 cpp 檔案，保持絕對乾淨！")
            return True
        else:
            print(f"❌ Push 失敗: {push_res.stderr.strip()}")
            return False

    except Exception as e:
        print(f"❌ Git 處理錯誤: {e}")
        # Fallback cleanup
        try:
            subprocess.run(['git', 'sparse-checkout', 'set', '/*', '!/*.cpp', 'Untitled-3.cpp'], cwd=project_root, capture_output=True)
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass
        return False

def main():
    print("==================================================")
    print("        CSES Solutions Syncer & Git Pusher        ")
    print("==================================================")
    
    project_root = os.path.dirname(os.path.abspath(__file__))
    ts_file_path = os.path.join(project_root, 'website', 'src', 'lib', 'cppFiles.ts')
    
    # Parse existing metadata map
    id_to_filename, filename_to_title = parse_metadata_map(ts_file_path)
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    auth_success = False
    
    # Arguments check
    if len(sys.argv) > 1:
        if sys.argv[1] == '--cookie' and len(sys.argv) > 2:
            phpsessid = sys.argv[2]
            session.cookies.set('PHPSESSID', phpsessid, domain='cses.fi')
            auth_success = check_session(session)
            
    if not auth_success:
        print("\nAuthentication required.")
        print("1. Use browser PHPSESSID cookie")
        print("2. Use Username & Password")
        choice = input("Enter 1 or 2: ").strip()
        
        if choice == '1':
            phpsessid = input("Paste your PHPSESSID: ").strip()
            session.cookies.set('PHPSESSID', phpsessid, domain='cses.fi')
            auth_success = check_session(session)
            if not auth_success:
                print("Cookie auth failed.")
                return
        elif choice == '2':
            username = input("Username: ").strip()
            import getpass
            password = getpass.getpass("Password: ")
            auth_success = login_with_credentials(session, username, password)
            if not auth_success:
                return
        else:
            return

    # Check git status
    git_check = subprocess.run(['git', 'rev-parse', '--is-inside-work-tree'], cwd=project_root, capture_output=True)
    if git_check.returncode != 0:
        print("Error: The project root is not a git repository. Cannot push to GitHub.")
        return

    # Fetch solved from CSES
    print("\nFetching solved list from CSES...")
    solved_tasks = get_solved_tasks(session)
    print(f"CSES reports {len(solved_tasks)} solved problems.")
    
    if not solved_tasks:
        return

    # Scan GitHub files using git ls-tree
    # Since local workspace might be sparse, fs.listdir won't see all files on GitHub.
    # We use git ls-tree to list all C++ files tracked on the remote branch.
    github_files = []
    try:
        ls_res = subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=project_root, capture_output=True, text=True)
        if ls_res.returncode == 0:
            github_files = [os.path.basename(f) for f in ls_res.stdout.split('\n') if f.endswith('.cpp')]
    except:
        pass

    if not github_files:
        github_files = [f for f in os.listdir(project_root) if f.endswith('.cpp')]
        
    print(f"GitHub repository contains {len(github_files)} C++ files.")

    # Find missing
    missing_tasks = []
    for task in solved_tasks:
        task_id = task['id']
        title = task['title']
        
        expected_filename = id_to_filename.get(task_id)
        if not expected_filename:
            possible_names = [fn for fn, t in filename_to_title.items() if t.lower() == title.lower()]
            expected_filename = possible_names[0] if possible_names else clean_filename(title)
                
        has_file = any(f.lower() == expected_filename.lower() for f in github_files)
        if not has_file:
            missing_tasks.append({
                'task': task,
                'filename': expected_filename
            })
            
    print(f"Comparison: {len(missing_tasks)} solved tasks are missing from your GitHub repository.")
    
    if not missing_tasks:
        print("\nAll solved problems are already on GitHub!")
        return

    print("\nMissing problems:")
    for i, item in enumerate(missing_tasks, 1):
        print(f" {i}. {item['task']['title']} -> {item['filename']}")
        
    confirm = input("\nDo you want to download and push these solutions to GitHub one by one (y/N)? ").strip().lower()
    if confirm != 'y':
        return
        
    for item in missing_tasks:
        task = item['task']
        filename = item['filename']
        print(f"\nProcessing: {task['title']}...")
        
        code = download_code(session, task['url'])
        if code:
            git_push_solution(project_root, filename, code)
        else:
            print(f"❌ Failed to download code for {task['title']}")
            
    print("\nAll processes finished!")

if __name__ == '__main__':
    main()
