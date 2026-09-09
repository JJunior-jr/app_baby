"""
Testes para validação da API e banco de dados
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_request(method, endpoint, data=None):
    print(f"→ {method} {endpoint}")
    if data:
        print(f"  Data: {json.dumps(data, indent=2)}")

def print_response(response):
    print(f"← Status: {response.status_code}")
    try:
        print(f"  Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"  Response: {response.text}")

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================

def test_health():
    print_section("1. HEALTH CHECK")
    endpoint = f"{BASE_URL}/api/health"
    print_request("GET", endpoint)
    response = requests.get(endpoint)
    print_response(response)
    return response.status_code == 200

# ============================================================================
# 2. AUTHENTICATION - REGISTER
# ============================================================================

def test_register():
    print_section("2. REGISTER NEW USER")
    endpoint = f"{BASE_URL}/api/auth/register"
    data = {
        "email": "papai@babyjohn.com",
        "name": "João Silva",
        "babyName": "Baby João",
        "password": "senha_segura_123"
    }
    print_request("POST", endpoint, data)
    response = requests.post(endpoint, json=data)
    print_response(response)
    return response.status_code == 201

# ============================================================================
# 3. AUTHENTICATION - LOGIN
# ============================================================================

def test_login():
    print_section("3. LOGIN")
    endpoint = f"{BASE_URL}/api/auth/login"
    data = {
        "email": "papai@babyjohn.com",
        "password": "senha_segura_123"
    }
    print_request("POST", endpoint, data)
    response = requests.post(endpoint, json=data)
    print_response(response)

    if response.status_code == 200:
        token = response.json().get("access_token")
        return token
    return None

# ============================================================================
# 4. GET CURRENT USER
# ============================================================================

def test_get_me(token):
    print_section("4. GET CURRENT USER")
    endpoint = f"{BASE_URL}/api/auth/me"
    print_request("GET", endpoint)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(endpoint, headers=headers)
    print_response(response)
    return response.status_code == 200

# ============================================================================
# 5. CREATE ACTIVITY
# ============================================================================

def test_create_activity(token):
    print_section("5. CREATE ACTIVITY")
    endpoint = f"{BASE_URL}/api/activities"
    data = {
        "type": "amamentacao",
        "title": "Amamentação",
        "subtitle": "Lado direito",
        "timestamp": "2026-09-09T10:30:00",
        "dateStr": "2026-09-09",
        "timeStr": "10:30",
        "period": "Manhã",
        "isInProgress": False,
        "durationMinutes": 15,
        "assignee": "Mamãe",
        "details": {"side": "right"}
    }
    print_request("POST", endpoint, data)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(endpoint, json=data, headers=headers)
    print_response(response)

    if response.status_code == 201:
        activity_id = response.json().get("id")
        return activity_id
    return None

# ============================================================================
# 6. LIST ACTIVITIES
# ============================================================================

def test_list_activities(token):
    print_section("6. LIST ACTIVITIES")
    endpoint = f"{BASE_URL}/api/activities"
    print_request("GET", endpoint)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(endpoint, headers=headers)
    print_response(response)
    return response.status_code == 200

# ============================================================================
# 7. GET ACTIVITY BY ID
# ============================================================================

def test_get_activity(token, activity_id):
    print_section("7. GET ACTIVITY BY ID")
    endpoint = f"{BASE_URL}/api/activities/{activity_id}"
    print_request("GET", endpoint)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(endpoint, headers=headers)
    print_response(response)
    return response.status_code == 200

# ============================================================================
# 8. UPDATE ACTIVITY
# ============================================================================

def test_update_activity(token, activity_id):
    print_section("8. UPDATE ACTIVITY")
    endpoint = f"{BASE_URL}/api/activities/{activity_id}"
    data = {
        "type": "amamentacao",
        "title": "Amamentação Atualizada",
        "subtitle": "Lado esquerdo",
        "timestamp": "2026-09-09T11:00:00",
        "dateStr": "2026-09-09",
        "timeStr": "11:00",
        "period": "Manhã",
        "isInProgress": False,
        "durationMinutes": 20,
        "assignee": "Mamãe",
        "details": {"side": "left"}
    }
    print_request("PUT", endpoint, data)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(endpoint, json=data, headers=headers)
    print_response(response)
    return response.status_code == 200

# ============================================================================
# 9. GET DAILY SUMMARY
# ============================================================================

def test_daily_summary(token):
    print_section("9. GET DAILY SUMMARY")
    endpoint = f"{BASE_URL}/api/activities/daily-summary/2026-09-09"
    print_request("GET", endpoint)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(endpoint, headers=headers)
    print_response(response)
    return response.status_code == 200

# ============================================================================
# 10. DELETE ACTIVITY
# ============================================================================

def test_delete_activity(token, activity_id):
    print_section("10. DELETE ACTIVITY")
    endpoint = f"{BASE_URL}/api/activities/{activity_id}"
    print_request("DELETE", endpoint)
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(endpoint, headers=headers)
    print(f"← Status: {response.status_code}")
    return response.status_code == 204

# ============================================================================
# 11. RATE LIMITING TEST
# ============================================================================

def test_rate_limiting():
    print_section("11. RATE LIMITING TEST")
    endpoint = f"{BASE_URL}/api/health"
    print("  Enviando 15 requisições para testar rate limit (10/minute)...")

    exceeded = False
    for i in range(15):
        response = requests.get(endpoint)
        if response.status_code == 429:
            print(f"  ✓ Rate limit acionado na requisição #{i+1}")
            exceeded = True
            break
        print(f"  {i+1}. Status: {response.status_code}")

    return exceeded

# ============================================================================
# MAIN TEST SUITE
# ============================================================================

def run_tests():
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*58 + "║")
    print("║" + "  BABY JOHN API - TEST SUITE".center(58) + "║")
    print("║" + "  PostgreSQL + SQLAlchemy 2.0".center(58) + "║")
    print("║" + " "*58 + "║")
    print("╚" + "="*58 + "╝")

    try:
        # 1. Health check
        if not test_health():
            print("✗ API não está respondendo. Certifique-se que o servidor está rodando.")
            return False

        # 2. Register
        if not test_register():
            print("✗ Falha no registro de usuário")
            return False

        # 3. Login
        token = test_login()
        if not token:
            print("✗ Falha no login")
            return False

        # 4. Get current user
        if not test_get_me(token):
            print("✗ Falha ao buscar usuário atual")
            return False

        # 5. Create activity
        activity_id = test_create_activity(token)
        if not activity_id:
            print("✗ Falha ao criar atividade")
            return False

        # 6. List activities
        if not test_list_activities(token):
            print("✗ Falha ao listar atividades")
            return False

        # 7. Get activity by ID
        if not test_get_activity(token, activity_id):
            print("✗ Falha ao buscar atividade")
            return False

        # 8. Update activity
        if not test_update_activity(token, activity_id):
            print("✗ Falha ao atualizar atividade")
            return False

        # 9. Get daily summary
        if not test_daily_summary(token):
            print("✗ Falha ao buscar resumo diário")
            return False

        # 10. Delete activity
        if not test_delete_activity(token, activity_id):
            print("✗ Falha ao deletar atividade")
            return False

        # 11. Rate limiting (comentado por padrão)
        # test_rate_limiting()

        print_section("✓ TODOS OS TESTES PASSARAM")
        return True

    except Exception as e:
        print_section("✗ ERRO")
        print(f"Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    run_tests()
