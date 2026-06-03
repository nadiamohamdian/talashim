$root = Join-Path $PSScriptRoot "..\src\app\(dashboard)"
$import = "import { ModuleSkeletonPage } from '@/features/skeleton/components/module-skeleton-page';`n`n"
$dynamicImport = "import { DynamicSkeletonPage } from '@/features/skeleton/components/dynamic-skeleton-page';`n`n"
$dynamicBody = "${dynamicImport}export default function Page() {`n  return <DynamicSkeletonPage />;`n}`n"

$routes = @{
  "notifications\page.tsx" = "notifications.inbox"
  "notifications\templates\page.tsx" = "notifications.templates"
  "notifications\rules\page.tsx" = "notifications.rules"
  "notifications\delivery\page.tsx" = "notifications.delivery"
  "products\page.tsx" = "products.list"
  "products\new\page.tsx" = "products.new"
  "products\videos\page.tsx" = "products.videos"
  "inventory\page.tsx" = "inventory.overview"
  "inventory\history\page.tsx" = "inventory.history"
  "inventory\reports\page.tsx" = "inventory.reports"
  "orders\page.tsx" = "orders.list"
  "trading\buy-orders\page.tsx" = "trading.buy"
  "trading\sell-orders\page.tsx" = "trading.sell"
  "trading\history\page.tsx" = "trading.history"
  "trading\settlement\page.tsx" = "trading.settlement"
  "trading\reports\page.tsx" = "trading.reports"
  "pricing\live\page.tsx" = "pricing.live"
  "pricing\history\page.tsx" = "pricing.history"
  "pricing\providers\page.tsx" = "pricing.providers"
  "pricing\margins\page.tsx" = "pricing.margins"
  "pricing\overrides\page.tsx" = "pricing.overrides"
  "users\page.tsx" = "users.list"
  "users\kyc\page.tsx" = "users.kyc"
  "users\roles\page.tsx" = "users.roles"
  "users\permissions\page.tsx" = "users.permissions"
  "finance\wallets\page.tsx" = "finance.wallets"
  "finance\transactions\page.tsx" = "finance.transactions"
  "finance\ledger\page.tsx" = "finance.ledger"
  "finance\accounting\page.tsx" = "finance.accounting"
  "finance\reports\page.tsx" = "finance.reports"
  "cms\blog\page.tsx" = "cms.blog"
  "cms\homepage\page.tsx" = "cms.homepage"
  "cms\banners\page.tsx" = "cms.banners"
  "cms\faq\page.tsx" = "cms.faq"
  "cms\seo\page.tsx" = "cms.seo"
  "cms\pages\page.tsx" = "cms.pages"
  "media\page.tsx" = "media.library"
  "media\upload\page.tsx" = "media.upload"
  "reports\sales\page.tsx" = "reports.sales"
  "reports\inventory\page.tsx" = "reports.inventory"
  "reports\users\page.tsx" = "reports.users"
  "reports\trading\page.tsx" = "reports.trading"
  "reports\financial\page.tsx" = "reports.financial"
  "security\audit\page.tsx" = "security.audit"
  "security\sessions\page.tsx" = "security.sessions"
  "security\login-history\page.tsx" = "security.loginHistory"
  "security\roles\page.tsx" = "security.roles"
  "security\permissions\page.tsx" = "security.permissions"
  "settings\page.tsx" = "settings.home"
  "settings\general\page.tsx" = "settings.general"
  "settings\commerce\page.tsx" = "settings.commerce"
  "settings\gold\page.tsx" = "settings.gold"
  "settings\feature-flags\page.tsx" = "settings.featureFlags"
}

foreach ($entry in $routes.GetEnumerator()) {
  $file = Join-Path $root $entry.Key
  $dir = Split-Path $file -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $body = $import + "export default function Page() {`n  return <ModuleSkeletonPage routeId=`"$($entry.Value)`" />;`n}`n"
  Set-Content -Path $file -Value $body -NoNewline
}

$dynamicPages = @(
  "products\[slug]\page.tsx",
  "products\[slug]\edit\page.tsx",
  "orders\[id]\page.tsx",
  "users\[id]\page.tsx"
)
foreach ($rel in $dynamicPages) {
  $file = Join-Path $root $rel
  if (-not (Test-Path (Split-Path $file -Parent))) { continue }
  Set-Content -Path $file -Value $dynamicBody -NoNewline
}

# Legacy redirects unchanged
Write-Host "Synced $($routes.Count) static and $($dynamicPages.Count) dynamic skeleton pages."
