from datetime import date, timedelta
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
        page.wait_for_timeout(1200)
        page.get_by_text("CRM Ouroboros").wait_for()
        page.get_by_role("button", name="Prospecção").click()
        page.get_by_placeholder("Empresa").fill("Ouroboros QA")
        page.get_by_placeholder("Nome do decisor").fill("Lead Teste E2E")
        page.get_by_placeholder("Pontuação (0–10)").fill("8")
        page.get_by_placeholder("Data do 1º contato").fill(date.today().isoformat())
        page.get_by_placeholder("Último contato").fill((date.today()-timedelta(days=4)).isoformat())
        page.get_by_placeholder("Próxima ação", exact=True).fill("Enviar microdiagnóstico")
        page.get_by_placeholder("Data da próxima ação").fill((date.today()-timedelta(days=1)).isoformat())
        page.get_by_placeholder("Valor estimado").fill("2500")
        page.get_by_role("button", name="Cadastrar oportunidade").click()
        page.get_by_text("Ouroboros QA", exact=True).wait_for()
        page.get_by_text("ATRASADO", exact=True).wait_for()
        page.get_by_role("button", name="Atividades", exact=True).click()
        page.locator("select").filter(has=page.locator("option", has_text="Ouroboros QA")).select_option(label="Ouroboros QA")
        page.get_by_placeholder("Próxima ação", exact=True).fill("Agendar reunião")
        page.get_by_role("button", name="Registrar atividade").click()
        page.get_by_text("Novo lead", exact=True).last.wait_for()
        page.get_by_role("button", name="Metas").click()
        page.get_by_text("Rotina semanal").wait_for()
        page.get_by_text("1 / 25", exact=False).wait_for()
        page.get_by_role("button", name="Scripts").click()
        page.get_by_text("Primeiro contato — diagnóstico", exact=False).wait_for()
        page.get_by_role("button", name="Painel comercial").click()
        page.get_by_text("Meta x realizado — funil mensal").wait_for()
        response = page.evaluate("""async () => { const r = await fetch('/api/crm/integrations/validate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'ERP REST',baseUrl:'https://erp.example.com',webhookUrl:'https://erp.example.com/hook',credentialRef:'ERP_API_KEY'})}); return {status:r.status, body:await r.json()}; }""")
        assert response["status"] == 200 and response["body"]["valid"] is True, response
        assert not errors, f"console errors: {errors}"
        print("CRM_EXCEL_LOGIC_E2E_OK prospect alert activity goals scripts dashboard integration")
    finally:
        if "data" in initial:
            current = page.evaluate("async () => (await fetch('/api/workspace')).json()")
            page.evaluate("""async ({revision, data}) => { const r = await fetch('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision,data})}); if(!r.ok) throw new Error('restore failed '+r.status); }""", {"revision": current["revision"], "data": initial["data"]})
        browser.close()
