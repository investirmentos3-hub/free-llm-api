#!/usr/bin/env python3
"""
Exemplos de uso da Free LLM API com Python
Execute com: python3 examples/example.py
"""

import requests
import json
from typing import Optional

API_URL = "http://localhost:3000"
API_KEY = "sua_chave_api_secreta_aqui"  # Mude conforme seu .env

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}


class FreeLLMClient:
    """Cliente para interagir com Free LLM API"""

    def __init__(self, api_url: str = API_URL, api_key: str = API_KEY):
        self.api_url = api_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
        self.conversation_id: Optional[str] = None

    def health_check(self) -> dict:
        """Verificar status da API"""
        response = requests.get(f"{self.api_url}/health")
        return response.json()

    def list_models(self) -> list:
        """Listar modelos disponíveis"""
        response = requests.get(f"{self.api_url}/api/models", headers=self.headers)
        data = response.json()
        return data['data']['models']

    def send_message(self, message: str, model: str = "llama3", conversation_id: Optional[str] = None) -> dict:
        """Enviar mensagem para o modelo"""
        payload = {
            "message": message,
            "model": model
        }
        
        if conversation_id:
            payload["conversationId"] = conversation_id
        
        response = requests.post(
            f"{self.api_url}/api/chat",
            headers=self.headers,
            json=payload
        )
        data = response.json()
        
        # Salvar conversation_id
        if 'data' in data:
            self.conversation_id = data['data'].get('conversationId')
        
        return data

    def get_history(self, conversation_id: str) -> dict:
        """Obter histórico de uma conversação"""
        response = requests.get(
            f"{self.api_url}/api/chat/history/{conversation_id}",
            headers=self.headers
        )
        return response.json()

    def clear_history(self, conversation_id: str) -> dict:
        """Limpar histórico de uma conversação"""
        response = requests.delete(
            f"{self.api_url}/api/chat/history/{conversation_id}",
            headers=self.headers
        )
        return response.json()


def example_1_health_check():
    """Exemplo 1: Health Check"""
    print("\n🏥 Health Check...")
    client = FreeLLMClient()
    status = client.health_check()
    print(f"Status: {status['status']}")
    print(f"FreeLLMAPI: {status['freeLLMAPI']['status']}")


def example_2_list_models():
    """Exemplo 2: Listar Modelos"""
    print("\n🤖 Listando Modelos...")
    client = FreeLLMClient()
    models = client.list_models()
    print("Modelos disponíveis:")
    for model in models:
        print(f"  - {model['name']}: {model['description']}")


def example_3_single_chat():
    """Exemplo 3: Chat Único"""
    print("\n💬 Chat Único...")
    client = FreeLLMClient()
    response = client.send_message("Olá! Quem é você?")
    print(f"Resposta: {response['data']['response']}")
    print(f"Conversation ID: {response['data']['conversationId']}")


def example_4_chat_with_history():
    """Exemplo 4: Chat com Histórico"""
    print("\n📚 Chat com Histórico...")
    client = FreeLLMClient()

    # Primeira mensagem
    response1 = client.send_message("Meu nome é João")
    print(f"1ª Mensagem - Resposta: {response1['data']['response']}")

    # Segunda mensagem (mantém contexto)
    conversation_id = response1['data']['conversationId']
    response2 = client.send_message("Qual é meu nome?", conversation_id=conversation_id)
    print(f"2ª Mensagem - Resposta: {response2['data']['response']}")

    # Visualizar histórico
    history = client.get_history(conversation_id)
    print(f"\nHistórico ({history['data']['messageCount']} mensagens):")
    for msg in history['data']['messages']:
        print(f"  [{msg['role']}]: {msg['content']}")


def main():
    """Executar todos os exemplos"""
    print("🚀 Free LLM API - Exemplos")
    print("================================")

    try:
        example_1_health_check()
        example_2_list_models()
        example_3_single_chat()
        example_4_chat_with_history()
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

    print("\n✅ Exemplos completados!")


if __name__ == "__main__":
    main()
