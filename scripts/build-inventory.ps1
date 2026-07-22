$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\xbox-\OneDrive\Desktop\Threadwell'
$src  = 'C:\Users\xbox-\.claude\projects\C--Users-xbox--OneDrive-Desktop\d71c0ee2-e65b-42f8-830f-12f5d8e672a8\tool-results\mcp-Claude_Browser-javascript_tool-1784707331219.txt'

# --- load + unwrap the (multiply-encoded) browser result ---
$raw = Get-Content -Raw -Path $src | ConvertFrom-Json
$obj = $raw[0].text
$guard = 0
while ($obj -is [string]) {
  $guard++; if ($guard -gt 6) { throw 'unwrap exceeded' }
  $obj = ($obj -replace '(?s)\(captured at origin[^\)]*\)\.?\s*$','').Trim() | ConvertFrom-Json
}
$items = @($obj.items | Where-Object { $_.url -and $_.url -notmatch '/shop/?$' })
Write-Host "Loaded $($items.Count) products (reported total $($obj.total))"

$ti = (Get-Culture).TextInfo
function Get-Slug($url) { $u = $url -replace '/+$',''; $u = $u -replace '\.html?$',''; return ($u -split '/')[-1] }
function Get-Name($slug) {
  $n = ($slug -replace '-',' ').Trim()
  $n = ($n -replace '\s+\d{3,}$','').Trim()
  if (-not $n) { $n = $slug }
  return $ti.ToTitleCase($n.ToLower())
}
# Classify on the SLUG only (never the URL - the domain 'tuxedosonline' contains 'tuxedo')
function Get-Type($slug) {
  $s = $slug.ToLower()
  if ($s -match 'pocket.?square|hank(y|ie)|handkerchief') { return 'pocket_square' }
  if ($s -match 'cummerbund') { return 'cummerbund' }
  if ($s -match 'vest')       { return 'vest' }
  if ($s -match 'shirt')      { return 'shirt' }
  # accessory nouns (non-bottoms) -> not embroiderable
  if ($s -match 'bow.?tie|bowtie|neck.?tie|necktie|\btie\b|ties|cravat|ascot|cuff.?link|cufflink|\bstud|jewel|collar-stay|collar-extender|lapel-pin|button-cover|suspender|belt|garter|glove|\bhat|beanie|sock|spat|shoe|sneaker|boot') { return $null }
  # standalone bottoms -> not embroiderable (unless part of a suit/set/christening outfit)
  if (($s -match 'pant|trouser|skirt|short') -and ($s -notmatch 'suit|package|piece|\bset\b|christening|baptism|communion')) { return $null }
  # garments -> embroiderable jacket / suit / christening set
  if ($s -match 'tuxedo|suit|sport-?coat|dinner-?jacket|\bjacket|blazer|tailcoat|\btails\b|\bcoat|package|christening|baptism|communion|piece|\btux') { return 'jacket_suit' }
  if ($s -match 'robe')       { return 'robe' }
  return $null
}
function Get-Line($slug) {
  $s = $slug.ToLower()
  if ($s -match 'boy|toddler|infant|kids|child') { return 'boys' }
  if ($s -match 'women|ladies') { return 'womens' }
  return 'mens'
}

# --- clean records ---
$clean = New-Object System.Collections.Generic.List[object]
foreach ($it in $items) {
  $slug = Get-Slug $it.url
  $clean.Add([pscustomobject]@{ name=(Get-Name $slug); slug=$slug; url=$it.url; img=$it.img })
}

# --- embroidery-area presets per garment type (mm). estimated = industry-standard placement ---
$hoopMaxW = 240; $hoopMaxH = 360
function Panel($id,$label,$def,$w,$h,$note){
  [ordered]@{ id=$id; label=$label; default=[bool]$def; area_mm=@($w,$h);
    fits_destiny_hoop=([bool](($w -le $hoopMaxW) -and ($h -le $hoopMaxH))); estimated=$true; note=$note }
}
$garmentTypes = [ordered]@{
  shirt = [ordered]@{ label='Dress / Tuxedo Shirt'; panels=@(
    (Panel 'left_chest' 'Left chest' $true 110 70 'Classic monogram/logo spot, ~180-200mm below shoulder seam, ~90mm from front placket'),
    (Panel 'left_cuff'  'Left cuff'  $false 70 25 'Cuff monogram (French or barrel cuff)'),
    (Panel 'right_cuff' 'Right cuff' $false 70 25 'Cuff monogram'),
    (Panel 'collar_band' 'Collar band' $false 45 18 'Hidden monogram under the collar'),
    (Panel 'back_yoke'  'Center back yoke' $false 130 60 'Below the collar on the back yoke')
  )}
  vest = [ordered]@{ label='Vest'; panels=@(
    (Panel 'back'       'Center back' $true 180 140 'Large back panel'),
    (Panel 'front_left' 'Lower left front' $false 80 55 'Discreet front monogram')
  )}
  cummerbund = [ordered]@{ label='Cummerbund'; panels=@(
    (Panel 'front_center' 'Front center' $true 120 45 'Across the pleated front')
  )}
  jacket_suit = [ordered]@{ label='Tuxedo / Suit / Jacket'; panels=@(
    (Panel 'interior_lining' 'Inside breast lining' $true 130 70 'Interior left-breast lining monogram (the traditional spot)'),
    (Panel 'left_chest' 'Exterior left chest' $false 90 55 'Exterior left chest (less common)'),
    (Panel 'back_showpiece' 'Full back (showpiece)' $false 200 260 'Large arched name across the back - costume/christening showpiece; near the hoop limit')
  )}
  pocket_square = [ordered]@{ label='Pocket Square / Handkerchief'; panels=@(
    (Panel 'corner' 'Corner monogram' $true 45 45 'Single corner, small initials')
  )}
  robe = [ordered]@{ label='Robe'; panels=@(
    (Panel 'left_chest' 'Left chest' $true 110 70 'Chest monogram'),
    (Panel 'back' 'Full back' $false 230 300 'Large back text/monogram')
  )}
}

# --- classify all products ---
$emb = New-Object System.Collections.Generic.List[object]
$counts = @{}
foreach ($c in $clean) {
  $t = Get-Type $c.slug
  if ($t) {
    $line = Get-Line $c.slug
    $christening = ($line -eq 'boys') -and ($c.slug -match 'white|ivory|communion|christening|baptism')
    $defaultPanel = ($garmentTypes[$t].panels | Where-Object { $_.default } | Select-Object -First 1).id
    if ($christening -and $t -eq 'jacket_suit') { $defaultPanel = 'back_showpiece' }
    $emb.Add([ordered]@{ name=$c.name; url=$c.url; img=$c.img; type=$t; line=$line; christening=$christening; default_panel=$defaultPanel })
    if ($counts.ContainsKey($t)) { $counts[$t]++ } else { $counts[$t] = 1 }
  }
}

# --- write full raw inventory (everything they sell) ---
New-Item -ItemType Directory -Force -Path "$repo\data" | Out-Null
$allMeta = [ordered]@{ source='https://www.tuxedosonline.com/product-sitemap.xml'; captured='2026-07-22';
  total=$clean.Count; note='Complete product inventory (all items, including drop-ship). Names derived from product URL slugs.' }
$allOut = [ordered]@{ meta=$allMeta; products=@($clean | ForEach-Object { [ordered]@{ name=$_.name; url=$_.url; img=$_.img } }) }
$allOut | ConvertTo-Json -Depth 6 | Set-Content -Path "$repo\data\all-products.json" -Encoding UTF8
Write-Host "checkpoint: wrote all-products.json"

# --- write studio presets (embroiderable only, with panel dimensions) ---
$byType = [ordered]@{}
foreach ($k in @('shirt','jacket_suit','vest','cummerbund','pocket_square','robe')) { if ($counts.ContainsKey($k)) { $byType.Add($k, [int]$counts[$k]) } }
$pmeta = [ordered]@{}
$pmeta.Add('source','https://www.tuxedosonline.com')
$pmeta.Add('captured','2026-07-22')
$pmeta.Add('forApp','Threadwell Studio (website) ONLY - not the Windows app')
$pmeta.Add('destiny_hoop_max_mm', @($hoopMaxW,$hoopMaxH))
$pmeta.Add('note','Embroidery-area dimensions are industry-standard estimates (estimated=true). Confirm against real garments before production.')
$pcounts = [ordered]@{}
$pcounts.Add('total_site_products',[int]$clean.Count)
$pcounts.Add('embroiderable',[int]$emb.Count)
$pcounts.Add('by_type',$byType)
$presetOut = [ordered]@{
  meta = $pmeta
  counts = $pcounts
  garmentTypes = $garmentTypes
  products = @($emb | ForEach-Object { $_ })
}
$presetOut | ConvertTo-Json -Depth 12 | Set-Content -Path "$repo\apps\studio\presets\products.json" -Encoding UTF8
Write-Host "checkpoint: wrote products.json"

Write-Host "=== RESULT ==="
Write-Host "Total site products : $($clean.Count)"
Write-Host "Embroiderable       : $($emb.Count)"
Write-Host "By type             : $(( $byType.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" } ) -join ', ')"
Write-Host "Christening-line     : $(@($emb | Where-Object { $_.christening }).Count)"
Write-Host "Non-embroiderable    : $($clean.Count - $emb.Count)"