# Plan FE-012: Dọn dependency classification và tài liệu onboarding Frontend

> **Nguồn shadcn/improve**: Được tạo từ đợt audit của **shadcn/improve skill
> v1.0.0**. File tiếng Anh `plans/012-clean-frontend-dependencies-and-docs.md`
> là canonical executable context. Codex thực thi trực tiếp, **không** dùng
> `improve execute`; file này là bản tiếng Việt để đọc và đối chiếu.
>
> **Hướng dẫn executor**: Làm đúng từng bước và mọi verification command. Thực
> hiện plan này cuối cùng để tài liệu phản ánh architecture đã merge. Nếu gặp
> STOP condition, dừng và báo cáo — không tự suy đoán. Chỉ bắt đầu sau FE-001 đến
> FE-011 và backend BE-015 của repo `coqanklazy/VelaWear_BE`, plan
> `plans/015-clean-backend-dependencies-and-docs.md`, branch
> `chore/backend-maintenance-docs`, đã merge; sau đó chạy preflight chuẩn và tạo
> đúng branch bên dưới.
>
> **Drift check (chạy đầu tiên)**:
> `git diff --stat ff217af..HEAD -- README.md AGENTS.md convention.md docs/PROJECT_STATUS.md package.json pnpm-lock.yaml scripts/check-markdown-links.mjs scripts/check-markdown-links.test.mjs plans/README.md`
> Documentation/dependency có thể đổi trong các plan trước. So sánh live script,
> CI workflow và import với "Trạng thái hiện tại"; mismatch không giải thích
> được là STOP condition.

## Trạng thái

- **ID**: FE-012
- **Priority**: P3
- **Effort**: M
- **Wave**: 5
- **Risk**: MED — manifest ảnh hưởng build; `AGENTS.md`/integration convention hướng dẫn mọi thay đổi sau.
- **Depends on**: FE-001 đến FE-011 và `coqanklazy/VelaWear_BE` BE-015 (`plans/015-clean-backend-dependencies-and-docs.md`, branch `chore/backend-maintenance-docs`)
- **Category**: dx
- **Planned at**: commit `ff217af`, 2026-07-16

## Vì sao việc này quan trọng

README vẫn chủ yếu là template `create-next-app`, quảng bá bốn package manager và
trỏ tới page file không tồn tại. Đồng thời build-time `shadcn` CLI bị phân loại
là production dependency, trong khi `@shadcn/react` thật sự chạy runtime phải
giữ ở production. Plan làm onboarding reproducible với pnpm/CI toolchain thực tế
và chỉ phân loại CLI thành development tooling, đồng thời để lại một bộ tài liệu
nội bộ nhất quán thay cho mô tả prototype/API đã cũ.

## Trạng thái hiện tại

- `README.md:1-15` là generic Next.js text, gợi ý npm, yarn, pnpm và bun.
- `README.md:38` bảo sửa `app/page.tsx`, nhưng file không tồn tại; shop home route
  là `app/(shop)/page.tsx`.
- README có link Playwright tiếng Việt ở dòng 19–35 nhưng thiếu prerequisite,
  environment setup, install, lint, typecheck, build, full-stack prerequisite và
  architecture/doc index chính xác.
- `.github/workflows/frontend-pr-checks.yml:40-96` là nguồn chuẩn cho local CI
  parity: Node 24, pnpm 11.5.2, frozen install, ESLint tối đa 25 warning,
  TypeScript, Vitest, production build; smoke dùng Chromium Playwright.
- `.env.example` khai báo public key name `NEXT_PUBLIC_API_URL` và
  `NEXT_PUBLIC_BACKEND_ORIGIN`. Tài liệu được nêu key/copy command nhưng không
  ghi local hoặc secret value.
- `package.json:15-47` đang đặt cả hai package trong `dependencies`:

  ```json
  "@shadcn/react": "0.2.1",
  // ...
  "shadcn": "^4.11.0"
  ```

- `app/globals.css:4` import `shadcn/tailwind.css` lúc build, nên `shadcn` phải
  còn được cài trong development/build environment.
- `components/ui/message-scroller.tsx:4-9` import
  `@shadcn/react/message-scroller` ở runtime. **Không** move/remove
  `@shadcn/react`.
- `AGENTS.md:13,43-56,64-71` vẫn gọi app là prototype, trỏ tới
  `app/page.tsx`/`components/vela-wear-app.tsx` không tồn tại và khuyên mock-local
  dù repository đã có real route groups/API.
- `docs/PROJECT_STATUS.md` có opening summary cũ sau FE-001–FE-011 và ít nhất
  một invalid control character trước `vela-data.ts`; giữ history hữu ích nhưng
  làm current state/latest wave rõ ràng.
- `convention.md:9-13,151-175,245-307` trộn base URL thiếu `/v1`, gợi ý
  localStorage cho access token, thiếu stable `ApiResponse.code`, và mô tả
  refresh/logout không còn khớp Web Lock, in-memory token, HttpOnly cookie.
- Repository dùng conventional commit; ví dụ `feat: complete storefront catalog UX`.

## Các lệnh cần dùng

| Mục đích            | Lệnh                                                                                                                                                                                                                 | Kết quả thành công                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Cài dependency      | `pnpm install --frozen-lockfile`                                                                                                                                                                                     | exit 0; lockfile/manifest đồng bộ                                                                                       |
| CLI dependency      | `pnpm why shadcn`                                                                                                                                                                                                    | package resolve                                                                                                         |
| Runtime dependency  | `pnpm why @shadcn/react`                                                                                                                                                                                             | package resolve                                                                                                         |
| Classification      | `node -e "const p=require('./package.json'); if(p.dependencies?.shadcn                                                                                                                                               |                                                                                                                         | !p.devDependencies?.shadcn |     | !p.dependencies?.['@shadcn/react']) process.exit(1)"` | exit 0 |
| Documentation links | `node scripts/check-markdown-links.mjs README.md AGENTS.md docs/PROJECT_STATUS.md convention.md`                                                                                                                     | exit 0; local file/anchor resolve                                                                                       |
| Link-checker test   | `node --test scripts/check-markdown-links.test.mjs`                                                                                                                                                                  | same/cross-file anchor, duplicate-heading suffix và encoded path pass; missing target fail deterministic; không network |
| Link-checker lint   | `pnpm exec eslint scripts/check-markdown-links.mjs scripts/check-markdown-links.test.mjs --max-warnings 0`                                                                                                           | exit 0, không warning                                                                                                   |
| Control chars       | `node -e "const fs=require('fs');for(const f of ['README.md','AGENTS.md','docs/PROJECT_STATUS.md','convention.md']){if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(fs.readFileSync(f,'utf8')))process.exit(1)}"` | exit 0                                                                                                                  |
| Lint                | `pnpm exec eslint . --max-warnings 25`                                                                                                                                                                               | exit 0                                                                                                                  |
| Typecheck           | `pnpm exec tsc --noEmit --pretty false --incremental false`                                                                                                                                                          | exit 0, không error                                                                                                     |
| Unit suite          | `pnpm test:unit`                                                                                                                                                                                                     | mọi test pass                                                                                                           |
| Build               | `pnpm build`                                                                                                                                                                                                         | resolve `shadcn/tailwind.css`, build thành công                                                                         |
| Smoke               | `pnpm test:e2e:smoke`                                                                                                                                                                                                | mọi `@smoke` test pass                                                                                                  |

## Phạm vi

> **Workflow-metadata exception**: Ngoài source allowlist bên dưới, cập nhật `docs/PROJECT_STATUS.md` bằng plan ID, branch, outcome thật và exact verification evidence. Canonical EN/VI plan có thể reconcile trước source edit theo `plans/README.md`; reviewer/operator quản lý index status. Không file ngoài scope nào khác được phép.

**Trong phạm vi** (chỉ được sửa các file này):

- `README.md`
- `AGENTS.md`
- `convention.md`
- `docs/PROJECT_STATUS.md`
- `package.json`
- `pnpm-lock.yaml`
- `scripts/check-markdown-links.mjs` (tạo mới)
- `scripts/check-markdown-links.test.mjs` (tạo mới)

**Ngoài phạm vi** (KHÔNG sửa):

- Xóa/move `@shadcn/react`; đây là runtime dependency.
- Đổi component code, CSS import, Next.js/pnpm/Node version hoặc app behavior.
- Upgrade package không liên quan hoặc xử lý transitive PostCSS advisory riêng.
- Thêm secret, real local env value, deployment credential hoặc personal setup.
- Rewrite historical project-status entry không liên quan corruption/current ordering.

## Git workflow

- **Authorization gate**: không commit, push hoặc mở PR nếu thiếu explicit current operator instruction; mọi commit example chỉ là recommendation.
- Branch: `chore/frontend-maintenance-docs`
- Chạy preflight trong `plans/README.md`; chỉ branch từ `main` sạch, mới nhất sau
  FE-001 đến FE-011 và external BE-015.
- Ưu tiên logical conventional commit như
  `chore: classify shadcn as build tooling` và
  `docs: refresh frontend onboarding guide`.
- Không push hoặc mở PR nếu chưa được yêu cầu và mọi gate chưa pass.

## Các bước

### Bước 1: Xác minh build-time và runtime shadcn consumer

Trước khi sửa, chạy `pnpm why` cho hai package và assert live CSS/runtime import.
Inspect in-repo CI workflow để chứng minh frozen install chạy trước build và
không production-only. Nếu external deployment system sở hữu production build
thật nhưng install config không truy cập được, STOP xin operator evidence; không
suy ra từ CI.

**Verify**: chạy riêng từng command; tất cả exit 0 và in expected live
consumer/workflow line khi phù hợp.

```powershell
pnpm why shadcn
pnpm why @shadcn/react
rg -n -F '@import "shadcn/tailwind.css";' app/globals.css
rg -n -F 'from "@shadcn/react/message-scroller"' components/ui/message-scroller.tsx
node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/frontend-pr-checks.yml','utf8');const i=s.indexOf('pnpm install --frozen-lockfile');const b=s.indexOf('pnpm build');if(i<0||b<0||i>b||/pnpm install[^\r\n]*(--prod|--production)/.test(s))process.exit(1)"
```

### Bước 2: Chỉ chuyển shadcn CLI sang development dependencies

Dùng đúng một pnpm manifest command, không sửa lockfile thủ công và không
remove/re-add làm dependency graph re-resolve:

```powershell
pnpm add -D shadcn@^4.11.0
```

Giữ resolved range hiện tại trừ khi latest main đã đổi. Không move/remove
`@shadcn/react`. Review lockfile diff để bảo đảm chỉ dependency classification/
metadata thay đổi, không broad upgrade.
Resolved `shadcn` version và package/snapshot resolution/integrity phải giữ
nguyên; STOP nếu pnpm tạo version/transitive churn.

**Verify**: chạy riêng hai lệnh sau; cả hai exit 0.

```powershell
node -e "const p=require('./package.json'); if(p.dependencies?.shadcn||!p.devDependencies?.shadcn||!p.dependencies?.['@shadcn/react']) process.exit(1)"
pnpm install --frozen-lockfile
```

Sau đó `git diff --unified=0 -- pnpm-lock.yaml` chỉ được cho thấy root importer
move `shadcn` từ dependencies sang devDependencies; không package/snapshot
version, resolution hay integrity line thay đổi.

### Bước 3: Tạo link checker rồi thay README

Trước tiên tạo `scripts/check-markdown-links.mjs` và
`scripts/check-markdown-links.test.mjs`. Checker nhận Markdown path qua
CLI, resolve relative file target từ từng document, validate explicit anchor theo
normalized heading, chỉ ignore `http:`, `https:`, `mailto:` và pure external URL,
report source/line/target cho mỗi lỗi, exit nonzero khi thiếu file/anchor. Không
rewrite document hay truy cập network.

Node test tạo isolated temporary Markdown fixture và cover valid relative file,
same-file/cross-file normalized heading anchor, duplicate heading với GitHub-style
numeric suffix, percent-encoded path, missing file, missing anchor, ignored
external URL, deterministic source/line/target error output và zero network.

Viết README bằng tiếng Việt, giữ thuật ngữ IT quan trọng. Bao gồm:

1. Mục đích project và stack: Next.js App Router, React, TypeScript, TanStack
   Query, Zustand, Tailwind CSS, Vitest, Playwright.
2. Prerequisite Node 24 và pnpm 11.5.2 khớp CI.
3. `pnpm install --frozen-lockfile`, copy `.env.example` sang `.env.local`; nêu
   public key name nhưng không ghi real/local value.
4. `pnpm dev`, actual entrypoint (`app/(shop)/page.tsx`, admin/auth route group)
   và local URL.
5. CI-equivalent command: lint, TypeScript, unit, build.
6. Smoke/full-stack Playwright command, Backend/PostgreSQL/Redis prerequisite và
   link `docs/PLAYWRIGHT_CI_VI.md`.
7. Exact link tới `convention.md`, `docs/PROJECT_STATUS.md`,
   `docs/PLAYWRIGHT_CI_VI.md`, `docs/I18N_ADMIN_GUIDE_VI.md`,
   `docs/SALE_CAMPAIGN_FRONTEND.md`, `docs/STOREFRONT_CATALOG_UX_FRONTEND_VI.md`
   và Vietnamese shadcn/improve roadmap `plans/README.vi.md`.

Chỉ dùng pnpm. Xóa generic create-next-app learning/deployment filler và stale
`app/page.tsx` instruction.

**Verify**: chạy block PowerShell sau → exit 0 khi stale text không có match.
Sau đó `node scripts/check-markdown-links.mjs README.md` → exit 0 và báo số
file/link đã check.

```powershell
rg -n '\b(?:npm run|yarn|bun)\b|app/page\.tsx' README.md
if ($LASTEXITCODE -eq 0) { exit 1 }
if ($LASTEXITCODE -gt 1) { exit $LASTEXITCODE }
exit 0
```

```powershell
node --test scripts/check-markdown-links.test.mjs
pnpm exec eslint scripts/check-markdown-links.mjs scripts/check-markdown-links.test.mjs --max-warnings 0
node scripts/check-markdown-links.mjs README.md
```

### Bước 4: Reconcile agent guidance, current status và API conventions

Sửa `AGENTS.md` theo live App Router route groups/components/real API; giữ safety,
testing, `docs/PROJECT_STATUS.md` và explicit operator-authorization rules. Trong
`docs/PROJECT_STATUS.md`, thêm current state/latest-wave entry ngắn ở đầu, giữ
history hữu ích, bỏ invalid control character, chỉ ghi work thật đã merge qua
FE-011 cùng maintenance này. Sửa `convention.md` theo
`NEXT_PUBLIC_API_URL` có `/api/v1`, relative helper path, `ApiResponse.code`,
display-only message, in-memory access token, HttpOnly refresh cookie, Web
Lock/single-flight refresh/logout, self-scoped API và `Retry-After` units. Không
copy secret hay paste implementation thứ hai dễ drift.

**Verify**: chạy `node -e "const fs=require('fs');const checks=[['AGENTS.md',/app\/page\.tsx|components\/vela-wear-app|frontend prototype|mock-only UI/],['convention.md',/http:\/\/localhost:8080\/api(?!\/v1)|Local Storage\/Client-side Session/]];for(const [f,re] of checks){if(re.test(fs.readFileSync(f,'utf8'))){console.error('stale documentation pattern in '+f);process.exit(1)}}"` → exit 0; chạy control-character command và `node scripts/check-markdown-links.mjs README.md AGENTS.md docs/PROJECT_STATUS.md convention.md` trong table → cả hai exit 0.

### Bước 5: Verify build-tool resolution và final repository gate

Frozen install, kiểm tra dependency path rồi chạy mọi Frontend gate/smoke.
Production build phải resolve `shadcn/tailwind.css`. Review `git diff --check` và
xác nhận chỉ declared in-scope file thay đổi.

**Verify**: chạy riêng từng lệnh; mọi lệnh exit 0.

```powershell
pnpm install --frozen-lockfile
pnpm why shadcn
pnpm why @shadcn/react
node --test scripts/check-markdown-links.test.mjs
pnpm exec eslint . --max-warnings 25
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm test:unit
pnpm build
pnpm test:e2e:smoke
node scripts/check-markdown-links.mjs README.md AGENTS.md docs/PROJECT_STATUS.md convention.md
git diff --check
```

## Test plan

- Không cần application runtime test; Node test mới kiểm tra reusable Markdown
  link checker bằng isolated file/anchor fixture.
- Node classification assertion chứng minh `shadcn` development-only và
  `@shadcn/react` vẫn runtime.
- Frozen install chứng minh `package.json`/`pnpm-lock.yaml` đồng bộ.
- Production build chứng minh CSS package export vẫn resolve.
- Full unit/smoke bảo vệ khỏi runtime dependency damage.
- README/AGENTS/convention check chứng minh stale architecture/path/auth text đã xóa.
- Link-checker unit test cover valid/missing file, same/cross-file normalized
  anchor, duplicate heading, encoded path và ignored external URL; reusable
  checker cùng control-character gate validate maintained docs.

## Tiêu chí hoàn tất

- [ ] FE-001 đến FE-011 và external BE-015 đã merge trước khi tạo branch.
- [ ] `shadcn` chỉ tồn tại trong `devDependencies`.
- [ ] `@shadcn/react` vẫn trong `dependencies`; message-scroller build thành công.
- [ ] Frozen install thành công, không unrelated dependency upgrade.
- [ ] README tiếng Việt, chỉ dùng pnpm, khớp Node/pnpm CI, không ghi secret value.
- [ ] README document actual entrypoint, env-key setup, CI check và Playwright prerequisite.
- [ ] AGENTS, current project status và integration convention khớp final merged architecture, không invalid control character.
- [ ] Mọi local link/anchor trong maintained docs resolve; stale template/prototype text không còn.
- [ ] Link-checker Node test và targeted lint pass cho same/cross-file anchor,
      duplicate heading, encoded path, ignored external URL và error case.
- [ ] Lint, TypeScript, unit, build, smoke exit 0.
- [ ] `git diff --check` exit 0; chỉ declared in-scope file thay đổi.

## STOP conditions

Dừng và báo cáo (không tự suy đoán) nếu:

- Một plan FE-001–FE-011 hoặc external BE-015 chưa merge, hoặc architecture/doc
  hiện tại khác khiến README mô tả future state.
- Production build thật do external deployment config kiểm soát nhưng không thể
  xác minh dependency-install mode bằng operator evidence.
- Build/deployment chỉ cài production dependency trước `pnpm build`, làm
  development-only `shadcn` không tồn tại.
- Move `shadcn` khiến `shadcn/tailwind.css` không resolve.
- `@shadcn/react` trông không dùng chỉ vì generated/dynamic import; plan này vẫn
  tuyệt đối không xóa nó.
- pnpm muốn broad unrelated upgrade hoặc fix cần đổi CSS/component code.
- Latest merged source mâu thuẫn documentation contract và không thể resolve từ source/test; STOP thay vì document assumption.
- Một verification command fail hai lần sau một lần sửa hợp lý.

## Ghi chú bảo trì

- Build-only CLI package thuộc `devDependencies`; runtime component package ở
  `dependencies`.
- Đồng bộ version trong README với GitHub Actions khi Node/pnpm thay đổi.
- PostCSS advisory riêng được defer sang dependency-upgrade plan có compatibility
  và build verification riêng.
- Reviewer cần chạy documentation command, không chỉ đọc chúng.
