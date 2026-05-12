# Sistema de Ocorrências Acadêmicas - Versão Segura (AP01)

## 📋 Descrição

Este é o código corrigido e seguro do protótipo de gestão de ocorrências acadêmicas, desenvolvido como parte da disciplina de Segurança da Informação.

## 🔐 Melhorias de Segurança Implementadas

1. **Proteção de Dados em Repouso**
   - Uso de Base64 para ofuscar dados no LocalStorage
   - Codificação de credenciais e sessões

2. **Defesa contra XSS (Cross-Site Scripting)**
   - Função `escapeHtml()` em todas as saídas
   - Sanitização rigorosa de entradas do usuário

3. **Controle de Acesso Baseado em Roles (RBAC)**
   - Três níveis: ADMIN, PROFESSOR, ALUNO
   - Restrição de visualização de dados por perfil
   - Ocultamento de ações administrativas

4. **Gestão Segura de Sessões**
   - Timeout automático de 15 minutos de inatividade
   - Limpeza de tokens ao logout
   - Listeners de atividade (mouse, teclado, scroll)

5. **Validação de Entrada**
   - Validação de CPF (comprimento)
   - Campos obrigatórios no formulário

6. **Auditoria e Logs**
   - Registro codificado de todas as ações
   - Log de login, criação de ocorrências

## 🚀 Como Usar

1. Abra `index.html` em um navegador moderno
2. Utilize as credenciais fornecidas em CREDENCIAIS_TESTE.txt
3. Explore as funcionalidades de acordo com seu perfil

## 📦 Estrutura

```
codigo-corrigido/
├── index.html      # Interface web
├── app.js          # Lógica e segurança
└── style.css       # Estilos
```

## 🔑 Credenciais de Teste

Ver arquivo CREDENCIAIS_TESTE.txt para detalhes de acesso.

## ⚠️ Limitações

- Sistema front-end apenas (sem backend real)
- Base64 não é criptografia forte (apenas ofuscação)
- Sessões armazenadas em localStorage (vulneráveis a XSS avançado)
- Sem HTTPS/TLS em ambiente de desenvolvimento

## 📝 Notas

Este é um protótipo educacional que demonstra boas práticas de segurança client-side.
Para produção, seria necessário implementar autenticação servidor, criptografia assimétrica e banco de dados seguro.

---

**Desenvolvido por:** Heitor Lopes Reis  
**Data:** 05 de maio de 2026  
**Disciplina:** Segurança da Informação
