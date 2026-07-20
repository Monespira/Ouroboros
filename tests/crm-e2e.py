from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:5174"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    page.get_by_label("Senha de acesso").fill("Zimbra")
    page.get_by_role("button", name="Entrar").click()
    page.get_by_role("button", name="CRM", exact=True).wait_for()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    initial = page.evaluate("async () => (await fetch('/api/workspace')).json()")
    try:
        page.get_by_role("button", name="CRM", exact=True).evaluate("element => element.click()")
        page.wait_for_timeout(1500)
        assert page.get_by_text("CRM Ouroboros").count() > 0, {"headings": page.locator("h1,h2").all_text_contents(), "errors": errors}
        page.get_by_role("button", name="Contatos").click()
        page.get_by_placeholder("Nome").fill("Lead Teste E2E")
        page.get_by_placeholder("Empresa").fill("Ouroboros QA")
        page.get_by_placeholder("E-mail").fill("qa@example.invalid")
        page.get_by_placeholder("Valor potencial").fill("1250")
        page.get_by_role("button", name="Cadastrar lead").click()
        page.get_by_text("Lead Teste E2E", exact=True).wait_for()
        page.get_by_role("button", name="Converter").first.click()
        page.get_by_text("Perfil consolidado").wait_for()
        page.get_by_role("button", name="Pipeline").click()
        page.get_by_text("Auditoria de movimentações").wait_for()
        page.get_by_role("button", name="Relatórios").click()
        page.get_by_text("Conversão por etapa").wait_for()
        response = page.evaluate("""async () => { const r = await fetch('/api/crm/integrations/validate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'ERP REST',baseUrl:'https://erp.example.com',webhookUrl:'https://erp.example.com/hook',credentialRef:'ERP_API_KEY'})}); return {status:r.status, body:await r.json()}; }""")
        assert response["status"] == 200 and response["body"]["valid"] is True, response
        print("CRM_E2E_OK lead contact pipeline dashboard integration")
        assert not errors, f"console errors: {errors}"
    finally:
        if "data" in initial:
            current = page.evaluate("async () => (await fetch('/api/workspace')).json()")
            page.evaluate("""async ({revision, data}) => { const r = await fetch('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,data})}); if(!r.ok) throw new Error('restore failed '+r.status); }""", {"revision": current["revision"], "data": initial["data"]})
        browser.close()
