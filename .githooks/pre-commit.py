#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import subprocess
import re
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

SECRET_PATTERNS = {
    "AWS Access Key": r"AKIA[0-9A-Z]{16}",
    "AWS Secret Access Key": r"aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}",
    "GitHub Personal Access Token": r"gh[p|o|u|s]_[A-Za-z0-9]{36}",
    "Anthropic API Key": r"sk-ant-api[0-9]{2}-[A-Za-z0-9_-]{90,}",
    "OpenAI API Key": r"sk-(proj-)?[A-Za-z0-9]{40,}",
    "Private Key (SSH/RSA)": r"-----BEGIN [A-Z ]+ PRIVATE KEY-----",
}

PROTECTED_PATHS = [
    r"\.env$",
    r"\.env\.",
    r"secrets/.*",
    r"credentials\.json$",
    r"service-account.*\.json$",
]

def get_staged_files():
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
            capture_output=True, text=True, check=True
        )
        return [f.strip() for f in result.stdout.splitlines() if f.strip()]
    except Exception as e:
        print(f"Erro ao listar arquivos do git diff: {e}", file=sys.stderr)
        return []

def scan_file(filepath):
    for path_pattern in PROTECTED_PATHS:
        if re.search(path_pattern, filepath):
            print(f"BLOCKED: Arquivo '{filepath}' em caminho protegido.", file=sys.stderr)
            return False
    if not os.path.isfile(filepath):
        return True
    if filepath.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar.gz', '-lock.json', '.lock')):
        return True
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        for name, pattern in SECRET_PATTERNS.items():
            if re.search(pattern, content):
                print(f"BLOCKED: Segredo '{name}' detectado em: {filepath}", file=sys.stderr)
                return False
    except Exception as e:
        print(f"Erro ao ler arquivo {filepath}: {e}", file=sys.stderr)
    return True

def run_quality_checks(staged_files):
    py_files = [f for f in staged_files if f.endswith('.py') and os.path.isfile(f)]
    js_files = [f for f in staged_files if f.endswith(('.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json')) and os.path.isfile(f)]
    success = True

    if py_files:
        print("[pre-commit] Executando ruff check...")
        ruff_result = subprocess.run(["ruff", "check"] + py_files, capture_output=True, text=True)
        if ruff_result.returncode != 0:
            print(f"BLOCKED: Ruff encontrou problemas:\n{ruff_result.stdout}{ruff_result.stderr}", file=sys.stderr)
            success = False

    if py_files:
        print("[pre-commit] Executando pytest...")
        pytest_result = subprocess.run(["pytest", "-x", "-q"], capture_output=True, text=True)
        if pytest_result.returncode != 0:
            print(f"BLOCKED: Testes falharam:\n{pytest_result.stdout}{pytest_result.stderr}", file=sys.stderr)
            success = False

    if js_files:
        print("[pre-commit] Executando prettier --check...")
        prettier_result = subprocess.run(["npx", "prettier", "--check"] + js_files, capture_output=True, text=True)
        if prettier_result.returncode != 0:
            print(f"BLOCKED: Prettier encontrou formatacao inconsistente:\n{prettier_result.stdout}{prettier_result.stderr}", file=sys.stderr)
            success = False

    return success

def main():
    staged_files = get_staged_files()
    if not staged_files:
        sys.exit(0)

    success = True
    for file in staged_files:
        if not scan_file(file):
            success = False

    if not run_quality_checks(staged_files):
        success = False

    if not success:
        print("\nCommit cancelado pelo pre-commit hook (seguranca ou qualidade).", file=sys.stderr)
        print("Para bypass (nao recomendado): git commit --no-verify", file=sys.stderr)
        sys.exit(1)

    print("[pre-commit] Todas as verificacoes passaram.")
    sys.exit(0)

if __name__ == "__main__":
    main()
