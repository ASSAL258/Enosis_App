$ErrorActionPreference='Stop'
function Get-Items($obj){
  if($null -eq $obj){ return @() }
  if($obj -is [System.Array]){ return $obj }
  foreach($k in 'results','data','items','value'){
    if($obj.PSObject.Properties.Name -contains $k){
      $v=$obj.$k
      if($v -is [System.Array]){ return $v }
      if($null -ne $v){ return @($v) }
    }
  }
  return @($obj)
}
$roleBase='http://localhost:5003/roles/'
$userLookup='http://localhost:5002/users/'

# Role API is inconsistent in this project; create/read roles directly in auth-service DB.
$roleRaw = docker exec enosis_auth_service python manage.py shell -c "import json; from app.models import Role; names=['employee','manager','rh','courier','parkauto']; out={};
for n in names:
    r,_=Role.objects.get_or_create(name=n, defaults={'description':n});
    out[n]=str(r.id);
print(json.dumps(out))"

if (-not $roleRaw) { throw 'Unable to retrieve role IDs from auth-service container.' }
$roleJsonLine = (($roleRaw -split "`r?`n") | Where-Object { $_ -match '^\s*\{.*\}\s*$' } | Select-Object -Last 1)
if (-not $roleJsonLine) { throw "Unable to parse role JSON from auth-service output: $roleRaw" }
$roleIdByName = $roleJsonLine | ConvertFrom-Json
function Get-UserByEmail([string]$email){
  $url = "${userLookup}?email=$([uri]::EscapeDataString($email))"
  $resp = Invoke-RestMethod -Uri $url -Method Get
  $items = Get-Items $resp
  if($items.Count -gt 0){ return $items[0] }
  return $null
}
function Register-Or-GetUser($spec){
  $payload=@{
    email=$spec.email
    matricule=$spec.matricule
    first_name=$spec.first_name
    last_name=$spec.last_name
    password='Test12345!'
    role_id=([string]$spec.role_id)
  }
  if($spec.ContainsKey('manager_id') -and $spec.manager_id){ $payload.manager_id=([string]$spec.manager_id) }
  if($spec.ContainsKey('rh_id') -and $spec.rh_id){ $payload.rh_id=([string]$spec.rh_id) }
  try{
    $created = Invoke-RestMethod -Uri $userLookup -Method Post -ContentType 'application/json' -Body ($payload | ConvertTo-Json -Depth 6)
    $u = if($created){ $created } else { Get-UserByEmail $spec.email }
    if($u){ return @{ user=$u; status='created' } }
  } catch {
    $u = Get-UserByEmail $spec.email
    if($u){ return @{ user=$u; status='existing' } }
    throw
  }
  throw "Unable to create/fetch $($spec.email)"
}
$mgr1 = Register-Or-GetUser @{ email='manager.one@enosisapp.test'; matricule='MAT-MGR-001'; first_name='Manager'; last_name='One'; role_id=$roleIdByName.manager }
$rh1 = Register-Or-GetUser @{ email='rh.one@enosisapp.test'; matricule='MAT-RH-001'; first_name='Rh'; last_name='One'; role_id=$roleIdByName.rh }
$emp1 = Register-Or-GetUser @{ email='employee.one@enosisapp.test'; matricule='MAT-EMP-001'; first_name='Employee'; last_name='One'; role_id=$roleIdByName.employee; manager_id=$mgr1.user.id; rh_id=$rh1.user.id }
$mgrPA = Register-Or-GetUser @{ email='manager.parkauto@enosisapp.test'; matricule='MAT-MGR-PA-001'; first_name='Manager'; last_name='Parkauto'; role_id=$roleIdByName.manager }
$rhPA = Register-Or-GetUser @{ email='rh.parkauto@enosisapp.test'; matricule='MAT-RH-PA-001'; first_name='Rh'; last_name='Parkauto'; role_id=$roleIdByName.rh }
$empPA = Register-Or-GetUser @{ email='employee.parkauto@enosisapp.test'; matricule='MAT-EMP-PA-001'; first_name='Employee'; last_name='Parkauto'; role_id=$roleIdByName.employee; manager_id=$mgrPA.user.id; rh_id=$rhPA.user.id }
$cour1 = Register-Or-GetUser @{ email='courier.one@enosisapp.test'; matricule='MAT-COU-001'; first_name='Courier'; last_name='One'; role_id=$roleIdByName.courier }
$parkAuto = Register-Or-GetUser @{ email='parkauto.one@enosisapp.test'; matricule='MAT-PARK-001'; first_name='Parkauto'; last_name='One'; role_id=$roleIdByName.parkauto }
$results=@(
  @{email='manager.one@enosisapp.test'; rec=$mgr1},
  @{email='rh.one@enosisapp.test'; rec=$rh1},
  @{email='employee.one@enosisapp.test'; rec=$emp1},
  @{email='manager.parkauto@enosisapp.test'; rec=$mgrPA},
  @{email='rh.parkauto@enosisapp.test'; rec=$rhPA},
  @{email='employee.parkauto@enosisapp.test'; rec=$empPA},
  @{email='courier.one@enosisapp.test'; rec=$cour1},
  @{email='parkauto.one@enosisapp.test'; rec=$parkAuto}
)
$final = foreach($row in $results){
  $u = $row.rec.user
  [pscustomobject]@{ email=$row.email; id=$u.id; role_id=$u.role_id; manager_id=$u.manager_id; rh_id=$u.rh_id; status=$row.rec.status }
}
$final | Format-Table -AutoSize | Out-String
